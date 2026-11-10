import React, { useState } from 'react';
import { AdequacyMetric, SimulationParams, PlanningArea, AIAdvisorReport } from '../types';
import { Sparkles, AlertTriangle, ShieldAlert, ArrowRight, Loader2, RefreshCw, FileText } from 'lucide-react';

interface AIAdvisorPanelProps {
  metrics: AdequacyMetric[];
  simulationParams: SimulationParams;
  selectedArea: PlanningArea | null;
}

export const AIAdvisorPanel: React.FC<AIAdvisorPanelProps> = ({
  metrics,
  simulationParams,
  selectedArea
}) => {
  const [report, setReport] = useState<AIAdvisorReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          simulationParams,
          selectedArea
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || errJson.message || 'Failed to generate advisory');
      }

      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error contacting policy advisor engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Advisor Header & Trigger Action */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-slate-100">
              AI Healthcare Capacity & Resource Allocation Advisor
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Synthesizes SingStat demographic census tables with SLA OneMap geospatial clinic density to evaluate national adequacy, detect acute supply bottlenecks, and formulate strategic policy briefs.
          </p>
        </div>

        <button
          onClick={fetchAIReport}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-900/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Adequacy Matrix...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{report ? 'Re-Run Executive Analysis' : 'Generate Adequacy Assessment'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State before first run */}
      {!report && !loading && !error && (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
          <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-800/50 flex items-center justify-center mx-auto mb-3 text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Ready to Generate Strategic Adequacy Report
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Click &ldquo;Generate Adequacy Assessment&rdquo; to analyze the current simulation parameters,
            flag underserved towns, and formulate targeted recommendations for clinic expansion.
          </p>
          <button
            onClick={fetchAIReport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-medium rounded border border-purple-500/30 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Policy Advisor</span>
          </button>
        </div>
      )}

      {/* Populated Report */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Summary */}
          <div className="p-5 rounded-lg bg-slate-900 border border-purple-500/30">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 mb-2 font-semibold">
              Executive Finding · {new Date(report.timestamp).toLocaleDateString()}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {report.summary}
            </p>
          </div>

          {/* Critical Underserved Areas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Priority Estate Interventions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.criticalAreas?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-100 text-xs">
                        {item.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          item.urgency === 'Critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </div>
                    <div className="text-xs text-rose-300/90 mb-2">
                      {item.issue}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-teal-300/90 flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{item.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographic & Walkability Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                Demographic & Capacity Insights
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.demographicInsights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">·</span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                Strategic Policy Recommendations
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.strategicRecommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold shrink-0">·</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
