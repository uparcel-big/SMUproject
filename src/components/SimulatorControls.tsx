import React, { useState } from 'react';
import { SimulationParams, PlanningArea, ClinicType } from '../types';
import { Sliders, RotateCcw, Plus, Check, Sparkles } from 'lucide-react';

interface SimulatorControlsProps {
  simParams: SimulationParams;
  setSimParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  planningAreas: PlanningArea[];
  onAddCustomClinic: (areaId: string, clinicType: ClinicType, clinicName: string) => void;
  onResetSimulation: () => void;
  simulatedClinicsCount: number;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  simParams,
  setSimParams,
  planningAreas,
  onAddCustomClinic,
  onResetSimulation,
  simulatedClinicsCount
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(planningAreas[0]?.id || 'tengah');
  const [clinicType, setClinicType] = useState<ClinicType>('chas_gp');
  const [customName, setCustomName] = useState<string>('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const handleAddClinic = (e: React.FormEvent) => {
    e.preventDefault();
    const area = planningAreas.find(a => a.id === selectedAreaId);
    if (!area) return;

    const finalName = customName.trim() !== ''
      ? customName.trim()
      : `Simulated ${clinicType === 'polyclinic' ? 'Polyclinic' : 'CHAS GP'} (${area.name})`;

    onAddCustomClinic(selectedAreaId, clinicType, finalName);
    setCustomName('');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const isModified =
    simParams.populationGrowthPct > 0 ||
    simParams.elderlySurgePct > 0 ||
    simParams.minClinicsPer10kTarget !== 3.5 ||
    simulatedClinicsCount > 0;

  return (
    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Healthcare Stress & Scenario Simulator
          </h3>
        </div>
        {isModified && (
          <button
            onClick={onResetSimulation}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slider 1: Population Growth */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Population Growth Projection</span>
            <span className="font-mono tabular-nums text-teal-400 font-semibold">
              +{simParams.populationGrowthPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={simParams.populationGrowthPct}
            onChange={(e) =>
              setSimParams(prev => ({ ...prev, populationGrowthPct: Number(e.target.value) }))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2024 Baseline</span>
            <span>+15% (2030)</span>
            <span>+30% (Future)</span>
          </div>
        </div>

        {/* Slider 2: Silver Tsunami / Elderly Surge */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Silver Tsunami (65+ Shift)</span>
            <span className="font-mono tabular-nums text-amber-400 font-semibold">
              +{simParams.elderlySurgePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={simParams.elderlySurgePct}
            onChange={(e) =>
              setSimParams(prev => ({ ...prev, elderlySurgePct: Number(e.target.value) }))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Current Cohort</span>
            <span>+20% Surge</span>
            <span>+40% Super-Aged</span>
          </div>
        </div>

        {/* Slider 3: Benchmark Target */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Target Clinic Density</span>
            <span className="font-mono tabular-nums text-sky-400 font-semibold">
              {simParams.minClinicsPer10kTarget} / 10k
            </span>
          </div>
          <input
            type="range"
            min="2.5"
            max="5.0"
            step="0.5"
            value={simParams.minClinicsPer10kTarget}
            onChange={(e) =>
              setSimParams(prev => ({ ...prev, minClinicsPer10kTarget: Number(e.target.value) }))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2.5 Basic</span>
            <span>3.5 Standard</span>
            <span>5.0 High Access</span>
          </div>
        </div>
      </div>

      {/* Form: Add Custom Clinic to Any Town */}
      <div className="pt-3 border-t border-slate-800">
        <form onSubmit={handleAddClinic} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            Simulate Adding Clinic:
          </span>

          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          >
            {planningAreas.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.region})
              </option>
            ))}
          </select>

          <select
            value={clinicType}
            onChange={(e) => setClinicType(e.target.value as ClinicType)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="chas_gp">CHAS GP Clinic</option>
            <option value="polyclinic">Public Polyclinic</option>
            <option value="emergency_24h">24-Hour Emergency GP</option>
            <option value="dental">Dental Practice</option>
          </select>

          <input
            type="text"
            placeholder="Clinic Name (Optional)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 flex-1 min-w-[140px]"
          />

          <button
            type="submit"
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy to Estate</span>
          </button>
        </form>

        {isSuccessToast && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Simulated clinic deployed! Adequacy scores recalculated in real time.</span>
          </div>
        )}
      </div>
    </div>
  );
};
