import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PlanningArea, Clinic, AdequacyMetric, ClinicType, ActiveWalkingRoute } from '../types';
import { Layers, PlusCircle, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Globe } from 'lucide-react';

interface MapViewProps {
  planningAreas: PlanningArea[];
  clinics: Clinic[];
  metrics: AdequacyMetric[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  showBuffers: boolean;
  setShowBuffers: (show: boolean) => void;
  bufferRadiusMeters: 400 | 800 | 1200;
  setBufferRadiusMeters: (radius: 400 | 800 | 1200) => void;
  isAddClinicMode: boolean;
  setIsAddClinicMode: (mode: boolean) => void;
  onAddClinicAtCoordinates: (lat: number, lng: number) => void;
  selectedClinicTypes: ClinicType[];
  setSelectedClinicTypes: React.Dispatch<React.SetStateAction<ClinicType[]>>;
  activeRoute?: ActiveWalkingRoute | null;
}

export const MapView: React.FC<MapViewProps> = ({
  planningAreas,
  clinics,
  metrics,
  selectedAreaId,
  onSelectArea,
  showBuffers,
  setShowBuffers,
  bufferRadiusMeters,
  setBufferRadiusMeters,
  isAddClinicMode,
  setIsAddClinicMode,
  onAddClinicAtCoordinates,
  selectedClinicTypes,
  setSelectedClinicTypes,
  activeRoute
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const buffersLayerRef = useRef<L.LayerGroup | null>(null);
  const areasLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Basemap style state (defaults to official OneMap SLA basemap)
  const [basemapStyle, setBasemapStyle] = useState<'onemap_default' | 'onemap_night' | 'onemap_grey' | 'osm'>('onemap_default');

  // Status Color Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Well Serviced': return '#10b981'; // emerald
      case 'Adequate': return '#0ea5e9'; // sky
      case 'Underserved': return '#f59e0b'; // amber
      case 'Critical Shortage': return '#ef4444'; // red
      default: return '#64748b';
    }
  };

  // Clinic Type Color Helper
  const getClinicColor = (type: ClinicType) => {
    switch (type) {
      case 'polyclinic': return '#3b82f6'; // blue
      case 'emergency_24h': return '#f97316'; // orange
      case 'dental': return '#a855f7'; // purple
      case 'specialist': return '#ec4899'; // pink
      default: return '#14b8a6'; // teal for chas_gp
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Singapore
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer groups for clean toggling
    const buffersLayer = L.layerGroup().addTo(map);
    const areasLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    buffersLayerRef.current = buffersLayer;
    areasLayerRef.current = areasLayer;
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;
    mapInstanceRef.current = map;

    // Invalidate size to ensure container layout finishes before rendering tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer on basemapStyle change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let tileUrl = 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png';
    let attribution = '<a href="https://www.onemap.gov.sg/" target="_blank">OneMap</a> &copy; Singapore Land Authority';
    let maxZoom = 19;

    if (basemapStyle === 'onemap_night') {
      tileUrl = 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png';
      attribution = 'OneMap Night &copy; SLA';
    } else if (basemapStyle === 'onemap_grey') {
      tileUrl = 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png';
      attribution = 'OneMap Grayscale &copy; SLA';
    } else if (basemapStyle === 'osm') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom,
      minZoom: 11
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [basemapStyle]);

  // Map Click Listener for placing clinics
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddClinicMode) {
        onAddClinicAtCoordinates(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAddClinicMode, onAddClinicAtCoordinates]);

  // Render Planning Area Circles & Labels
  useEffect(() => {
    const areasLayer = areasLayerRef.current;
    if (!areasLayer || !mapInstanceRef.current) return;

    areasLayer.clearLayers();

    const metricMap = new Map<string, AdequacyMetric>();
    metrics.forEach(m => metricMap.set(m.planningAreaId, m));

    planningAreas.forEach(area => {
      const metric = metricMap.get(area.id);
      if (!metric) return;

      const isSelected = selectedAreaId === area.id;
      const color = getStatusColor(metric.status);

      // Area circle indicating density & adequacy status
      const circleRadius = Math.max(700, Math.min(2200, Math.sqrt(area.areaKm2) * 450));
      const circle = L.circle([area.centerLat, area.centerLng], {
        radius: circleRadius,
        color: color,
        weight: isSelected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.12,
        dashArray: isSelected ? undefined : '4, 4'
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #f8fafc;">${area.name}</strong>
            <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">${area.region}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin-bottom: 8px;">
            <div>
              <span style="color: #94a3b8; font-size: 11px;">Population</span><br/>
              <strong style="color: #f1f5f9; font-variant-numeric: tabular-nums;">${metric.totalPopulation.toLocaleString()}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 11px;">Seniors (65+)</span><br/>
              <strong style="color: ${metric.elderlyPct >= 20 ? '#fbbf24' : '#f1f5f9'}; font-variant-numeric: tabular-nums;">
                ${metric.elderlyPopulation.toLocaleString()} (${metric.elderlyPct}%)
              </strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 11px;">Clinics Total</span><br/>
              <strong style="color: #38bdf8; font-variant-numeric: tabular-nums;">${metric.clinicsCount} (${metric.polyclinicsCount} Poly)</strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 11px;">Clinics / 10k</span><br/>
              <strong style="color: ${color}; font-variant-numeric: tabular-nums;">${metric.clinicsPer10k}</strong>
            </div>
          </div>
          <div style="background: rgba(30, 41, 59, 0.7); border-radius: 4px; padding: 6px 8px; border: 1px solid #334155;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
              <span style="color: #94a3b8;">Adequacy Status:</span>
              <strong style="color: ${color};">${metric.status}</strong>
            </div>
            <div style="color: #cbd5e1; font-size: 11px;">
              ${metric.primaryDeficit}
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => {
        onSelectArea(area.id);
      });

      circle.addTo(areasLayer);

      // Clean SVG area label
      const labelIcon = L.divIcon({
        className: 'planning-area-label',
        html: `
          <div style="
            transform: translate(-50%, -50%);
            white-space: nowrap;
            font-size: 11px;
            font-weight: 600;
            color: ${isSelected ? '#38bdf8' : '#e2e8f0'};
            background: ${isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)'};
            border: 1px solid ${isSelected ? '#38bdf8' : '#334155'};
            padding: 2px 6px;
            border-radius: 4px;
            cursor: pointer;
            pointer-events: auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          ">
            ${area.name} <span style="color: ${color}; font-variant-numeric: tabular-nums;">${metric.clinicsPer10k}/10k</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const labelMarker = L.marker([area.centerLat, area.centerLng], { icon: labelIcon });
      labelMarker.on('click', () => {
        onSelectArea(area.id);
      });
      labelMarker.addTo(areasLayer);
    });
  }, [planningAreas, metrics, selectedAreaId, onSelectArea]);

  // Render Clinic Markers & Catchment Buffers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const buffersLayer = buffersLayerRef.current;
    if (!markersLayer || !buffersLayer || !mapInstanceRef.current) return;

    markersLayer.clearLayers();
    buffersLayer.clearLayers();

    // Filter clinics by active types
    const filteredClinics = clinics.filter(c => selectedClinicTypes.includes(c.type));

    filteredClinics.forEach(clinic => {
      const color = getClinicColor(clinic.type);

      // Catchment Walkability Buffer (400m / 800m / 1200m)
      if (showBuffers) {
        const buffer = L.circle([clinic.lat, clinic.lng], {
          radius: bufferRadiusMeters,
          color: color,
          weight: 1,
          opacity: 0.35,
          fillColor: color,
          fillOpacity: 0.08
        });
        buffer.addTo(buffersLayer);
      }

      // Marker Icon
      const isSimulated = clinic.isSimulated;
      const markerHtml = `
        <div style="
          width: ${clinic.type === 'polyclinic' ? '24px' : '18px'};
          height: ${clinic.type === 'polyclinic' ? '24px' : '18px'};
          background-color: ${color};
          border: 2px solid ${isSimulated ? '#fbbf24' : '#0f172a'};
          border-radius: ${clinic.type === 'polyclinic' ? '4px' : '50%'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px ${color}88;
          color: white;
          font-size: 10px;
          font-weight: bold;
          cursor: pointer;
        ">
          ${clinic.type === 'polyclinic' ? '+' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-clinic-pin',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([clinic.lat, clinic.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 220px;">
          <div style="border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${color}; font-weight: 600;">
              ${clinic.type.replace('_', ' ')} ${isSimulated ? '(Simulated Scenario)' : ''}
            </span>
            <div style="font-weight: 600; color: #f8fafc; font-size: 13px;">${clinic.name}</div>
          </div>
          <div style="color: #cbd5e1; font-size: 11px; margin-bottom: 6px;">
            <strong>Town:</strong> ${clinic.planningAreaName}<br/>
            <strong>Address:</strong> ${clinic.address}<br/>
            <strong>Postal:</strong> Singapore ${clinic.postalCode}
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">
            <strong>Hours:</strong> ${clinic.operatingHours}<br/>
            <strong>Phone:</strong> ${clinic.phone}
          </div>
          <div style="font-size: 10px; color: #38bdf8; background: #1e293b; padding: 2px 6px; border-radius: 3px; display: inline-block;">
            Tier: ${clinic.chasTier.replace('_', ' ')}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(markersLayer);
    });
  }, [clinics, selectedClinicTypes, showBuffers, bufferRadiusMeters]);

  // Fly to selected planning area when changed
  useEffect(() => {
    if (!selectedAreaId || !mapInstanceRef.current) return;
    const area = planningAreas.find(a => a.id === selectedAreaId);
    if (area) {
      mapInstanceRef.current.flyTo([area.centerLat, area.centerLng], 14, {
        duration: 0.8
      });
    }
  }, [selectedAreaId, planningAreas]);

  // Render OneMap Walking / Transit Route
  useEffect(() => {
    const routeLayer = routeLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routeLayer || !map) return;

    routeLayer.clearLayers();

    if (!activeRoute || activeRoute.coordinates.length === 0) return;

    const coords = activeRoute.coordinates;

    // Outer glow line
    const outerLine = L.polyline(coords, {
      color: '#06b6d4',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // Inner dashed indicator line
    const innerLine = L.polyline(coords, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.9,
      dashArray: '6, 8'
    });

    outerLine.addTo(routeLayer);
    innerLine.addTo(routeLayer);

    // Origin Marker
    const startPoint = coords[0];
    const originIcon = L.divIcon({
      html: `
        <div style="
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        "></div>
      `,
      className: 'route-origin-pin',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const originMarker = L.marker(startPoint, { icon: originIcon });
    originMarker.bindPopup(`<strong>Origin:</strong> ${activeRoute.originName}`);
    originMarker.addTo(routeLayer);

    // Destination Marker
    const endPoint = coords[coords.length - 1];
    const destIcon = L.divIcon({
      html: `
        <div style="
          width: 16px;
          height: 16px;
          background: #06b6d4;
          border: 2px solid #ffffff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #ffffff;
          font-size: 10px;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.9);
        ">+</div>
      `,
      className: 'route-dest-pin',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const destMarker = L.marker(endPoint, { icon: destIcon });
    destMarker.bindPopup(`<strong>Destination:</strong> ${activeRoute.destinationClinicName}<br/>Distance: ${(activeRoute.distanceMeters / 1000).toFixed(2)}km (${activeRoute.durationMinutes} mins)`);
    destMarker.addTo(routeLayer);

    // Zoom and pan to frame the entire route
    const bounds = outerLine.getBounds();
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [activeRoute]);

  // Toggle clinic type filter
  const toggleClinicType = (type: ClinicType) => {
    setSelectedClinicTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] min-h-[500px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Basemap Style Selector & Clinic Type Filters */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Official OneMap Basemap Style Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700 shadow-xl text-xs">
            <span className="text-slate-300 font-semibold px-2 py-0.5 flex items-center gap-1 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Basemap:</span>
            </span>
            <button
              onClick={() => setBasemapStyle('onemap_default')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                basemapStyle === 'onemap_default'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Official Singapore Land Authority OneMap Full-Color Basemap"
            >
              OneMap Official
            </button>
            <button
              onClick={() => setBasemapStyle('onemap_night')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                basemapStyle === 'onemap_night'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Official OneMap Night Mode"
            >
              Night
            </button>
            <button
              onClick={() => setBasemapStyle('onemap_grey')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                basemapStyle === 'onemap_grey'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Official OneMap Grayscale"
            >
              Grayscale
            </button>
            <button
              onClick={() => setBasemapStyle('osm')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                basemapStyle === 'osm'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OpenStreetMap Standard"
            >
              OSM
            </button>
          </div>

          {/* Clinic Type Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 shadow-lg text-xs">
            <span className="text-slate-400 font-medium px-2 py-0.5 hidden lg:inline">Facilities:</span>
            
            <button
              onClick={() => toggleClinicType('polyclinic')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedClinicTypes.includes('polyclinic')
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              Polyclinics
            </button>

            <button
              onClick={() => toggleClinicType('chas_gp')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedClinicTypes.includes('chas_gp')
                  ? 'bg-teal-900/60 text-teal-300 border border-teal-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              CHAS GPs
            </button>

            <button
              onClick={() => toggleClinicType('emergency_24h')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedClinicTypes.includes('emergency_24h')
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              24-Hour Emergency
            </button>

            <button
              onClick={() => toggleClinicType('dental')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedClinicTypes.includes('dental')
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              Dental
            </button>
          </div>
        </div>

        {/* Right: Catchment Buffer & Placement Tool */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Catchment Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 shadow-lg text-xs">
            <button
              onClick={() => setShowBuffers(!showBuffers)}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                showBuffers
                  ? 'bg-slate-800 text-teal-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catchment: {showBuffers ? `${bufferRadiusMeters}m` : 'Off'}</span>
            </button>

            {showBuffers && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800 font-mono text-[11px]">
                <button
                  onClick={() => setBufferRadiusMeters(400)}
                  className={`px-1.5 py-0.5 rounded ${
                    bufferRadiusMeters === 400 ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400'
                  }`}
                  title="5-minute walk buffer (400m)"
                >
                  400m
                </button>
                <button
                  onClick={() => setBufferRadiusMeters(800)}
                  className={`px-1.5 py-0.5 rounded ${
                    bufferRadiusMeters === 800 ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400'
                  }`}
                  title="10-minute walk buffer (800m standard)"
                >
                  800m
                </button>
              </div>
            )}
          </div>

          {/* Place Clinic Simulator Mode Button */}
          <button
            onClick={() => setIsAddClinicMode(!isAddClinicMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isAddClinicMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAddClinicMode ? 'Click Map to Place' : 'Simulate Placement'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner when in Add Clinic Mode */}
      {isAddClinicMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-amber-950/90 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-lg text-xs shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Click anywhere on the map to place a simulated primary care clinic and evaluate impact.</span>
          <button
            onClick={() => setIsAddClinicMode(false)}
            className="ml-2 text-slate-400 hover:text-white underline text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Left: Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl max-w-xs text-xs pointer-events-auto">
        <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
          <span>Healthcare Adequacy Standard</span>
          <span className="text-[10px] text-slate-400 font-mono">SingStat × MOH</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-300 font-medium">Well Serviced</span>
            <span className="text-slate-500 ml-auto font-mono">≥ 3.8 / 10k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
            <span className="text-slate-300 font-medium">Adequate</span>
            <span className="text-slate-500 ml-auto font-mono">2.5 - 3.7 / 10k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-300 font-medium">Underserved</span>
            <span className="text-slate-500 ml-auto font-mono">1.2 - 2.4 / 10k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-slate-300 font-medium">Critical Shortage</span>
            <span className="text-slate-500 ml-auto font-mono">&lt; 1.2 / 10k</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
          Click any planning area circle to inspect demographics or clinic markers to view operating hours.
        </div>
      </div>
    </div>
  );
};
