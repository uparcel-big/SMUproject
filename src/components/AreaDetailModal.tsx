import React from 'react';
import { PlanningArea, Clinic, AdequacyMetric, ClinicType } from '../types';
import { X, MapPin, Phone, Clock, Plus, ShieldCheck, AlertTriangle, AlertOctagon, Heart } from 'lucide-react';

interface AreaDetailModalProps {
  area: PlanningArea | null;
  metric: AdequacyMetric | null;
  clinics: Clinic[];
  isOpen: boolean;
  onClose: () => void;
  onAddClinic: (areaId: string, clinicType: ClinicType, clinicName: string) => void;
  onFlyToMap: (areaId: string) => void;
}

export const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  area,
  metric,
  clinics,
  isOpen,
  onClose,
  onAddClinic,
  onFlyToMap
}) => {
  if (!isOpen || !area || !metric) return null;

  const areaClinics = clinics.filter(c => c.planningAreaId === area.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Well Serviced': return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
      case 'Adequate': return 'text-sky-400 bg-sky-950/50 border-sky-800';
      case 'Underserved': return 'text-amber-400 bg-amber-950/50 border-amber-800';
      case 'Critical Shortage': return 'text-rose-400 bg-rose-950/50 border-rose-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">{area.name}</h3>
              <span className="text-xs text-slate-400 font-mono">({area.region} Region)</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Subzones: {area.subzones.join(', ')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          {/* Top Score & Status Banner */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Adequacy Assessment</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Service Index: <strong className="text-slate-200">{metric.serviceScore}/100</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {metric.primaryDeficit}
              </div>
            </div>

            <button
              onClick={() => {
                onFlyToMap(area.id);
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded transition-colors flex items-center gap-1.5 font-medium shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Center on Map</span>
            </button>
          </div>

          {/* Demographic Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Total Population</span>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-100 mt-0.5">
                {metric.totalPopulation.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Density: {area.density.toLocaleString()}/km²
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Seniors (65+)</span>
              <div className="text-sm font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                {metric.elderlyPopulation.toLocaleString()} ({metric.elderlyPct}%)
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Risk: {metric.elderlyRisk}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Clinics / 10k</span>
              <div className="text-sm font-bold font-mono tabular-nums text-sky-400 mt-0.5">
                {metric.clinicsPer10k}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Target: 3.5 - 5.0
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Pop / Clinic</span>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-200 mt-0.5">
                {metric.populationPerClinic > 0 ? metric.populationPerClinic.toLocaleString() : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Target: &lt; 2,500
              </div>
            </div>
          </div>

          {/* Existing Facilities List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Healthcare Facilities in {area.name} ({areaClinics.length})
              </h4>
              <button
                onClick={() => {
                  onAddClinic(area.id, 'chas_gp', `New CHAS GP (${area.name})`);
                }}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Simulated Clinic Here</span>
              </button>
            </div>

            {areaClinics.length === 0 ? (
              <div className="p-6 text-center rounded border border-dashed border-rose-900/50 bg-rose-950/20 text-rose-300">
                <AlertOctagon className="w-6 h-6 mx-auto mb-2 text-rose-400" />
                <div className="font-semibold text-xs">No Registered Primary Care Clinics Located in {area.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Residents rely entirely on neighboring planning areas for outpatient and chronic healthcare.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {areaClinics.map(clinic => (
                  <div
                    key={clinic.id}
                    className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{clinic.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                          {clinic.type.replace('_', ' ')}
                        </span>
                        {clinic.isSimulated && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            Simulated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {clinic.address} (Singapore {clinic.postalCode})
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {clinic.operatingHours}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {clinic.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
