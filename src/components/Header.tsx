import React from 'react';
import { Activity, MapPin, Database, Sparkles, SlidersHorizontal, Download, Globe } from 'lucide-react';
import { NationalSummary } from '../types';

interface HeaderProps {
  activeTab: 'map' | 'table' | 'demographics' | 'onemap' | 'advisor';
  setActiveTab: (tab: 'map' | 'table' | 'demographics' | 'onemap' | 'advisor') => void;
  nationalSummary: NationalSummary;
  onOpenDataSync: () => void;
  onExportCSV: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  nationalSummary,
  onOpenDataSync,
  onExportCSV,
  isSimulating
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                SG HealthMap
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">
                SingStat Demographics × OneMap SLA Geospatial
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Geospatial Map</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adequacy Ratios</span>
            </button>

            <button
              onClick={() => setActiveTab('demographics')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'demographics'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Aging & Risk</span>
            </button>

            <button
              onClick={() => setActiveTab('onemap')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'onemap'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>OneMap Live</span>
            </button>

            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'advisor'
                  ? 'bg-slate-800 text-purple-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Policy Advisor</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Data Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {isSimulating && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded hidden md:inline">
                Simulation Active
              </span>
            )}
            
            <button
              onClick={onOpenDataSync}
              title="OneMap & SingStat Data Provenance & API Connector"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Data Sources</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Audit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
