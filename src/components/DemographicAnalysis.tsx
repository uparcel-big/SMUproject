import React from 'react';
import { AdequacyMetric } from '../types';
import { Users, HeartPulse, Baby, AlertCircle, ArrowUpRight } from 'lucide-react';

interface DemographicAnalysisProps {
  metrics: AdequacyMetric[];
  onSelectArea: (areaId: string) => void;
  onFlyToMap: (areaId: string) => void;
}

export const DemographicAnalysis: React.FC<DemographicAnalysisProps> = ({
  metrics,
  onSelectArea,
  onFlyToMap
}) => {
  // Top 5 Super-Aged Towns (Highest % 65+)
  const topAgingPercentage = [...metrics]
    .sort((a, b) => b.elderlyPct - a.elderlyPct)
    .slice(0, 6);

  // Top 5 Towns by Total Elderly Headcount (Largest absolute volume of seniors)
  const topElderlyVolume = [...metrics]
    .sort((a, b) => b.elderlyPopulation - a.elderlyPopulation)
    .slice(0, 6);

  // Severe Senior Load Towns (Most seniors per clinic)
  const topSeniorLoad = [...metrics]
    .filter(m => m.clinicsCount > 0)
    .sort((a, b) => b.elderlyPerClinic - a.elderlyPerClinic)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Overview Context Banner */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            <span>Singapore Demographic Healthcare Stress Analysis</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Under Singapore’s Healthier SG national policy, elderly citizens (65+) visit primary care clinics 3.5× more often than younger residents for chronic ailments (diabetes, hypertension, hyperlipidemia). Evaluating adequacy requires cross-referencing pure clinic counts with aging density.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <div className="text-slate-500 text-[10px]">National 65+ Avg</div>
            <div className="text-amber-400 text-sm font-semibold tabular-nums">~19.8%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <div className="text-slate-500 text-[10px]">Critical Senior Ratio</div>
            <div className="text-rose-400 text-sm font-semibold tabular-nums">&gt; 800 / clinic</div>
          </div>
        </div>
      </div>

      {/* Grid of Analytical Deep Dives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Super-Aged Mature Estates */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Highest Senior Concentration
              </span>
              <span className="text-[10px] text-slate-500 font-mono">% Age 65+</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pioneer and mature estates with disproportionate chronic disease load requiring higher CHAS GP density.
            </p>

            <div className="space-y-3">
              {topAgingPercentage.map((item, idx) => (
                <div
                  key={item.planningAreaId}
                  onClick={() => onSelectArea(item.planningAreaId)}
                  className="p-2.5 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {idx + 1}. {item.planningAreaName}
                    </span>
                    <span className="font-mono tabular-nums text-amber-400 font-bold">
                      {item.elderlyPct}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.elderlyPct / 30) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{item.elderlyPopulation.toLocaleString()} seniors</span>
                    <span>{item.clinicsCount} clinics ({item.clinicsPer10k}/10k)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Highest Absolute Senior Volume */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                Absolute Elderly Headcount
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Total 65+</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Massive population centres where the aggregate number of seniors strains public polyclinic consultation capacity.
            </p>

            <div className="space-y-3">
              {topElderlyVolume.map((item, idx) => (
                <div
                  key={item.planningAreaId}
                  onClick={() => onSelectArea(item.planningAreaId)}
                  className="p-2.5 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {idx + 1}. {item.planningAreaName}
                    </span>
                    <span className="font-mono tabular-nums text-sky-400 font-bold">
                      {item.elderlyPopulation.toLocaleString()}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.elderlyPopulation / 65000) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Pop: {item.totalPopulation.toLocaleString()}</span>
                    <span>{item.polyclinicsCount} Polyclinic · {item.chasGpsCount} CHAS GP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Senior-to-Clinic Burden (Highest Strain) */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                Chronic Strain (Seniors / Clinic)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Elderly Load</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Severe doctor supply bottlenecks where existing clinics face intense chronic disease consultation pressure.
            </p>

            <div className="space-y-3">
              {topSeniorLoad.map((item, idx) => (
                <div
                  key={item.planningAreaId}
                  onClick={() => onSelectArea(item.planningAreaId)}
                  className="p-2.5 rounded bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {idx + 1}. {item.planningAreaName}
                    </span>
                    <span className="font-mono tabular-nums text-rose-400 font-bold">
                      {item.elderlyPerClinic.toLocaleString()} / clinic
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.elderlyPerClinic / 1500) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Status: {item.status}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlyToMap(item.planningAreaId);
                      }}
                      className="text-teal-400 hover:text-teal-300 text-[10px] flex items-center gap-0.5"
                    >
                      Locate <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structural Disparity Analysis between Old vs New Towns */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Key Planning Finding: The Two SingStat Cohort Divergences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="text-amber-400 font-medium mb-1">
              Mature Pioneer Clusters (Outram, Bukit Merah, Queenstown, Toa Payoh)
            </div>
            <p>
              These planning areas exhibit over 22-26% senior citizens. While raw clinic ratios may seem moderate, primary care doctor time per patient is significantly higher due to multimorbidity (hypertension, diabetic foot management, dementia screening). Recommendation: Expand polyclinic allied health capacity and incentivize evening CHAS GP chronic follow-ups.
            </p>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="text-sky-400 font-medium mb-1">
              Rapid BTO Growth Towns (Tengah, Punggol, Sengkang West)
            </div>
            <p>
              New estates like Tengah have young resident populations arriving years before commercial retail plazas and dedicated polyclinics are completed, resulting in localized healthcare deserts where residents travel outside their planning area for basic pediatric or GP care. Recommendation: Accelerate interim container clinics and temporary GP leases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
