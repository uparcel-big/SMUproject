import React from 'react';
import { NationalSummary } from '../types';
import { Users, Building2, Stethoscope, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface NationalKPIStripProps {
  summary: NationalSummary;
  isSimulating: boolean;
}

export const NationalKPIStrip: React.FC<NationalKPIStripProps> = ({ summary, isSimulating }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* KPI 1: Total Population */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>SingStat Population</span>
          <Users className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-slate-100">
          {(summary.totalPopulation / 1000000).toFixed(2)}M
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {summary.totalPopulation.toLocaleString()} residents
        </div>
      </div>

      {/* KPI 2: Seniors 65+ */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>Seniors (65+)</span>
          <span className="text-[10px] text-amber-400 font-mono font-semibold">
            {((summary.totalElderly / summary.totalPopulation) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-amber-400">
          {summary.totalElderly.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          High chronic care demand
        </div>
      </div>

      {/* KPI 3: Total OneMap Clinics */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>Total Clinics</span>
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-sky-400">
          {summary.totalClinics}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {summary.totalPolyclinics} Public Polyclinics
        </div>
      </div>

      {/* KPI 4: Clinics per 10k Ratio */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>National Density</span>
          <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-teal-400">
          {summary.avgClinicsPer10k} <span className="text-xs text-slate-400 font-normal">/ 10k</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Benchmark Target: 3.5 - 5.0
        </div>
      </div>

      {/* KPI 5: Avg Population per Clinic */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>Pop / Clinic</span>
          <span className="text-[10px] text-slate-500 font-mono">Capacity</span>
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-slate-200">
          {summary.avgPopPerClinic.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Optimal: &lt; 2,500
        </div>
      </div>

      {/* KPI 6: Underserved Areas Deficit */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span>Underserved Towns</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-rose-400">
          {summary.underservedAreasCount + summary.criticalAreasCount}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {summary.criticalAreasCount} Critical Shortage
        </div>
      </div>
    </div>
  );
};
