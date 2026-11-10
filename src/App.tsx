import React, { useState, useMemo, useCallback } from 'react';
import { SINGSTAT_PLANNING_AREAS } from './data/singstatPopulation';
import { ONEMAP_CLINICS } from './data/onemapClinics';
import { PlanningArea, Clinic, ClinicType, SimulationParams, OneMapSearchItem, ActiveWalkingRoute } from './types';
import { calculateAdequacy, calculateNationalSummary } from './utils/adequacyCalculator';
import { Header } from './components/Header';
import { NationalKPIStrip } from './components/NationalKPIStrip';
import { MapView } from './components/MapView';
import { AdequacyTable } from './components/AdequacyTable';
import { DemographicAnalysis } from './components/DemographicAnalysis';
import { SimulatorControls } from './components/SimulatorControls';
import { AIAdvisorPanel } from './components/AIAdvisorPanel';
import { DataSyncModal } from './components/DataSyncModal';
import { AreaDetailModal } from './components/AreaDetailModal';
import { OneMapLiveConsole } from './components/OneMapLiveConsole';

export default function App() {
  const [planningAreas] = useState<PlanningArea[]>(SINGSTAT_PLANNING_AREAS);
  const [clinics, setClinics] = useState<Clinic[]>(ONEMAP_CLINICS);
  const [activeTab, setActiveTab] = useState<'map' | 'table' | 'demographics' | 'onemap' | 'advisor'>('map');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // In-memory OneMap token (never saved to disk or DB)
  const [oneMapToken, setOneMapToken] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<ActiveWalkingRoute | null>(null);

  // Simulation State
  const [simParams, setSimParams] = useState<SimulationParams>({
    populationGrowthPct: 0,
    elderlySurgePct: 0,
    minClinicsPer10kTarget: 3.5,
    activeClinicTypes: ['polyclinic', 'chas_gp', 'emergency_24h', 'dental'],
    selectedRegion: 'All',
    searchQuery: '',
    filterStatus: 'All',
    bufferRadiusMeters: 800,
    showBuffers: true
  });

  const [selectedClinicTypes, setSelectedClinicTypes] = useState<ClinicType[]>([
    'polyclinic',
    'chas_gp',
    'emergency_24h',
    'dental'
  ]);

  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [bufferRadiusMeters, setBufferRadiusMeters] = useState<400 | 800 | 1200>(800);
  const [isAddClinicMode, setIsAddClinicMode] = useState<boolean>(false);

  // Modals
  const [isDataSyncOpen, setIsDataSyncOpen] = useState<boolean>(false);
  const [isAreaDetailOpen, setIsAreaDetailOpen] = useState<boolean>(false);

  // Calculate Adequacy Metrics for all Planning Areas
  const metrics = useMemo(() => {
    return planningAreas.map(area => calculateAdequacy(area, clinics, simParams));
  }, [planningAreas, clinics, simParams]);

  // Calculate National Summary
  const nationalSummary = useMemo(() => {
    return calculateNationalSummary(planningAreas, metrics, clinics);
  }, [planningAreas, metrics, clinics]);

  const simulatedClinicsCount = useMemo(() => {
    return clinics.filter(c => c.isSimulated).length;
  }, [clinics]);

  const isSimulating =
    simParams.populationGrowthPct > 0 ||
    simParams.elderlySurgePct > 0 ||
    simParams.minClinicsPer10kTarget !== 3.5 ||
    simulatedClinicsCount > 0;

  // Selected Area & Metric
  const selectedArea = useMemo(() => {
    if (!selectedAreaId) return null;
    return planningAreas.find(a => a.id === selectedAreaId) || null;
  }, [selectedAreaId, planningAreas]);

  const selectedMetric = useMemo(() => {
    if (!selectedAreaId) return null;
    return metrics.find(m => m.planningAreaId === selectedAreaId) || null;
  }, [selectedAreaId, metrics]);

  // Handlers
  const handleSelectArea = useCallback((areaId: string) => {
    setSelectedAreaId(areaId);
    setIsAreaDetailOpen(true);
  }, []);

  const handleFlyToMap = useCallback((areaId: string) => {
    setSelectedAreaId(areaId);
    setActiveTab('map');
  }, []);

  const handleAddCustomClinic = useCallback((areaId: string, clinicType: ClinicType, clinicName: string) => {
    const area = planningAreas.find(a => a.id === areaId);
    if (!area) return;

    // Jitter slightly around area center
    const latOffset = (Math.random() - 0.5) * 0.008;
    const lngOffset = (Math.random() - 0.5) * 0.008;

    const newClinic: Clinic = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: clinicName,
      type: clinicType,
      planningAreaId: area.id,
      planningAreaName: area.name,
      address: `Simulated Site, ${area.name} Town Centre`,
      postalCode: `S(${Math.floor(100000 + Math.random() * 800000)})`,
      lat: Number((area.centerLat + latOffset).toFixed(5)),
      lng: Number((area.centerLng + lngOffset).toFixed(5)),
      chasTier: clinicType === 'polyclinic' ? 'Government_Subsidised' : 'CHAS_All',
      operatingHours: 'Mon-Sun: 08:30 - 21:00 (Simulated)',
      phone: '+65 6000 0000',
      isSimulated: true
    };

    setClinics(prev => [newClinic, ...prev]);
  }, [planningAreas]);

  // Add clinic at precise coordinates clicked on Map
  const handleAddClinicAtCoordinates = useCallback((lat: number, lng: number) => {
    // Find closest planning area
    let closestArea = planningAreas[0];
    let minDistance = Infinity;

    planningAreas.forEach(area => {
      const d = Math.hypot(area.centerLat - lat, area.centerLng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestArea = area;
      }
    });

    const newClinic: Clinic = {
      id: `sim-click-${Date.now()}`,
      name: `Simulated Clinic (${closestArea.name})`,
      type: 'chas_gp',
      planningAreaId: closestArea.id,
      planningAreaName: closestArea.name,
      address: `Simulated Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      postalCode: '690000',
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      chasTier: 'CHAS_All',
      operatingHours: 'Mon-Sun: 08:30 - 21:00',
      phone: '+65 6000 0000',
      isSimulated: true
    };

    setClinics(prev => [newClinic, ...prev]);
    setIsAddClinicMode(false);
  }, [planningAreas]);

  // Import Clinic directly from live OneMap Search result
  const handleAddClinicFromOneMap = useCallback((item: OneMapSearchItem, clinicType: ClinicType) => {
    const lat = parseFloat(item.LATITUDE);
    const lng = parseFloat(item.LONGITUDE);

    // Find closest planning area
    let closestArea = planningAreas[0];
    let minDistance = Infinity;

    planningAreas.forEach(area => {
      const d = Math.hypot(area.centerLat - lat, area.centerLng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestArea = area;
      }
    });

    const newClinic: Clinic = {
      id: `onemap-${item.POSTAL || Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: item.BUILDING || item.SEARCHVAL || `Clinic @ ${item.ROAD_NAME}`,
      type: clinicType,
      planningAreaId: closestArea.id,
      planningAreaName: closestArea.name,
      address: `${item.ROAD_NAME} ${item.BLK_NO ? 'Blk ' + item.BLK_NO : ''} ${item.BUILDING ? '(' + item.BUILDING + ')' : ''}`,
      postalCode: item.POSTAL || 'N/A',
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      chasTier: clinicType === 'polyclinic' ? 'Government_Subsidised' : 'CHAS_All',
      operatingHours: 'Mon-Sun: 08:30 - 21:00',
      phone: '+65 6000 0000',
      isSimulated: true
    };

    setClinics(prev => [newClinic, ...prev]);
  }, [planningAreas]);

  const handleFlyToCoordinates = useCallback((lat: number, lng: number) => {
    setActiveTab('map');
  }, []);

  const handleResetSimulation = useCallback(() => {
    setSimParams(prev => ({
      ...prev,
      populationGrowthPct: 0,
      elderlySurgePct: 0,
      minClinicsPer10kTarget: 3.5
    }));
    setClinics(ONEMAP_CLINICS);
  }, []);

  // Export CSV Audit Report
  const handleExportCSV = useCallback(() => {
    const headers = [
      'Planning Area',
      'Region',
      'SingStat Total Population',
      'SingStat Seniors (65+)',
      'Seniors Percentage (%)',
      'OneMap Total Clinics',
      'Public Polyclinics',
      'CHAS GP Clinics',
      'Clinics per 10,000 Pop',
      'Population per Clinic',
      'Seniors per Clinic',
      'Service Adequacy Index (0-100)',
      'Adequacy Status',
      'Primary Deficit Note'
    ];

    const rows = metrics.map(m => [
      `"${m.planningAreaName}"`,
      `"${m.region}"`,
      m.totalPopulation,
      m.elderlyPopulation,
      m.elderlyPct,
      m.clinicsCount,
      m.polyclinicsCount,
      m.chasGpsCount,
      m.clinicsPer10k,
      m.populationPerClinic,
      m.elderlyPerClinic,
      m.serviceScore,
      `"${m.status}"`,
      `"${m.primaryDeficit.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SG_Healthcare_Adequacy_SingStat_OneMap_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [metrics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nationalSummary={nationalSummary}
        onOpenDataSync={() => setIsDataSyncOpen(true)}
        onExportCSV={handleExportCSV}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* National Healthcare Adequacy KPI Strip */}
        <NationalKPIStrip summary={nationalSummary} isSimulating={isSimulating} />

        {/* Dynamic Main View Tab */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Active Walking Route Banner if present */}
            {activeRoute && (
              <div className="p-3 bg-teal-950/80 border border-teal-500/50 rounded-lg text-xs text-teal-200 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <span>
                    OneMap Walking Route: <strong>{activeRoute.originName}</strong> &rarr; <strong>{activeRoute.destinationClinicName}</strong>
                    {' '}&middot; <span className="font-mono tabular-nums text-white">{(activeRoute.distanceMeters / 1000).toFixed(2)}km</span>
                    {' '}&middot; <span className="font-mono tabular-nums text-amber-300 font-semibold">{activeRoute.durationMinutes} mins</span>
                    {' '}&middot; <span className={activeRoute.durationMinutes <= 12 ? 'text-emerald-300' : 'text-rose-300'}>
                      {activeRoute.durationMinutes <= 12 ? 'Complies with 10-min walk benchmark' : 'Exceeds 10-min walk benchmark'}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setActiveRoute(null)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                >
                  Clear Route Overlay
                </button>
              </div>
            )}

            <MapView
              planningAreas={planningAreas}
              clinics={clinics}
              metrics={metrics}
              selectedAreaId={selectedAreaId}
              onSelectArea={handleSelectArea}
              showBuffers={showBuffers}
              setShowBuffers={setShowBuffers}
              bufferRadiusMeters={bufferRadiusMeters}
              setBufferRadiusMeters={setBufferRadiusMeters}
              isAddClinicMode={isAddClinicMode}
              setIsAddClinicMode={setIsAddClinicMode}
              onAddClinicAtCoordinates={handleAddClinicAtCoordinates}
              selectedClinicTypes={selectedClinicTypes}
              setSelectedClinicTypes={setSelectedClinicTypes}
              activeRoute={activeRoute}
            />

            {/* Scenario Simulator Drawer */}
            <SimulatorControls
              simParams={simParams}
              setSimParams={setSimParams}
              planningAreas={planningAreas}
              onAddCustomClinic={handleAddCustomClinic}
              onResetSimulation={handleResetSimulation}
              simulatedClinicsCount={simulatedClinicsCount}
            />
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-4">
            <SimulatorControls
              simParams={simParams}
              setSimParams={setSimParams}
              planningAreas={planningAreas}
              onAddCustomClinic={handleAddCustomClinic}
              onResetSimulation={handleResetSimulation}
              simulatedClinicsCount={simulatedClinicsCount}
            />
            <AdequacyTable
              metrics={metrics}
              selectedAreaId={selectedAreaId}
              onSelectArea={handleSelectArea}
              onFlyToMap={handleFlyToMap}
            />
          </div>
        )}

        {activeTab === 'demographics' && (
          <DemographicAnalysis
            metrics={metrics}
            onSelectArea={handleSelectArea}
            onFlyToMap={handleFlyToMap}
          />
        )}

        {activeTab === 'onemap' && (
          <OneMapLiveConsole
            oneMapToken={oneMapToken}
            setOneMapToken={setOneMapToken}
            onAddClinicFromOneMap={handleAddClinicFromOneMap}
            clinics={clinics}
            planningAreas={planningAreas}
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
            onFlyToCoordinates={handleFlyToCoordinates}
          />
        )}

        {activeTab === 'advisor' && (
          <AIAdvisorPanel
            metrics={metrics}
            simulationParams={simParams}
            selectedArea={selectedArea}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Data Sources: SingStat (Department of Statistics Singapore) &middot; SLA OneMap Thematic Directory
          </div>
          <div>
            MOH Primary Care Accessibility Benchmark: 3.5 &ndash; 5.0 clinics / 10,000 population
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DataSyncModal
        isOpen={isDataSyncOpen}
        onClose={() => setIsDataSyncOpen(false)}
        clinicsCount={clinics.length}
        planningAreasCount={planningAreas.length}
      />

      <AreaDetailModal
        area={selectedArea}
        metric={selectedMetric}
        clinics={clinics}
        isOpen={isAreaDetailOpen}
        onClose={() => setIsAreaDetailOpen(false)}
        onAddClinic={handleAddCustomClinic}
        onFlyToMap={handleFlyToMap}
      />
    </div>
  );
}
