import React, { useState } from 'react';
import { X, Database, Globe, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicsCount: number;
  planningAreasCount: number;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  clinicsCount,
  planningAreasCount
}) => {
  const [oneMapToken, setOneMapToken] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('chas_clinics');
  const [apiResponseStatus, setApiResponseStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'provenance' | 'live-query'>('provenance');

  if (!isOpen) return null;

  const handleTestOneMap = async () => {
    setIsLoading(true);
    setApiResponseStatus(null);

    try {
      const res = await fetch('/api/onemap/query-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: oneMapToken.trim(),
          queryName: selectedTheme
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApiResponseStatus(`Success: Connected to SLA OneMap API. Received valid thematic response.`);
      } else {
        setApiResponseStatus(
          `Notice: ${data.message || data.error || 'Direct SLA connection requires an authenticated OneMap API token. Local verified dataset active with ' + clinicsCount + ' clinics.'}`
        );
      }
    } catch (err: any) {
      setApiResponseStatus('Network error connecting to OneMap gateway. Local pre-indexed dataset is operational.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Singapore Data Provenance & OneMap Gateway
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'provenance'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Sources & Methodology
          </button>
          <button
            onClick={() => setActiveTab('live-query')}
            className={`py-2.5 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'live-query'
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Live OneMap API Query
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          {activeTab === 'provenance' ? (
            <div className="space-y-4">
              {/* SingStat Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-teal-400 text-sm">
                    SingStat: Department of Statistics Singapore
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Census & Population Trends
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed mb-3">
                  Singapore resident population by Planning Area and Subzone, age cohort distribution (0-14 youth, 15-64 working age, 65+ elderly cohort), land area (sq km), and residential dwelling type proportions.
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                  <span>Coverage: <strong>{planningAreasCount} Planning Areas</strong></span>
                  <span>Centroid System: <strong>WGS84</strong></span>
                  <span>Elderly Granularity: <strong>Age 65+</strong></span>
                </div>
              </div>

              {/* OneMap Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sky-400 text-sm">
                    OneMap: Singapore Land Authority (SLA)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Thematic Services API & CHAS Directory
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed mb-3">
                  Geolocations of primary care facilities across Singapore, including SingHealth / NHGP / NUP Polyclinics, CHAS General Practice clinics, 24-hour emergency practitioners, and dental practices.
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                  <span>Indexed Facilities: <strong>{clinicsCount} Clinics</strong></span>
                  <span>Projection: <strong>SVY21 / WGS84</strong></span>
                  <span>Service Catchment: <strong>400m & 800m Walk Buffers</strong></span>
                </div>
              </div>

              {/* Adequacy Methodology */}
              <div className="p-3 bg-slate-800/40 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-1">Adequacy Formula Benchmark:</strong>
                MOH national target is approximately 3.5 to 5.0 primary care physicians per 10,000 population.
                In mature towns where &gt;20% of residents are 65+, the chronic care load factor requires an adjusted ratio to prevent polyclinic bottlenecks.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 space-y-2">
                  <div className="font-semibold text-teal-400">Updated SLA OneMap API Endpoints Connected:</div>
                  <ul className="space-y-1.5 font-mono text-[10px] text-slate-400">
                    <li>
                      <span className="text-teal-400 font-bold">POST</span> https://www.onemap.gov.sg/api/auth/post/getToken
                      <div className="text-slate-500 font-sans">Mint 3-day access token (JSON body with email &amp; password)</div>
                    </li>
                    <li>
                      <span className="text-sky-400 font-bold">GET</span> https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&amp;returnGeom=Y&amp;getAddrDetails=Y&amp;pageNum=1
                      <div className="text-slate-500 font-sans">Elastic search &amp; geocoding (Authorization header required)</div>
                    </li>
                    <li>
                      <span className="text-amber-400 font-bold">GET</span> https://www.onemap.gov.sg/api/public/revgeocode?location=...&amp;buffer=40&amp;addressType=All
                      <div className="text-slate-500 font-sans">Reverse geocoding (Coordinates to official postal address)</div>
                    </li>
                    <li>
                      <span className="text-purple-400 font-bold">GET</span> https://www.onemap.gov.sg/api/public/routingsvc/route?start=...&amp;end=...&amp;routeType=walk
                      <div className="text-slate-500 font-sans">Pedestrian / transit route geometry &amp; walkability duration</div>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-200 block mb-1">Interactive OneMap Live Tab:</strong>
                  Use the <strong>&ldquo;OneMap Live&rdquo;</strong> tab in the top navigation bar to mint your 3-day token, run live elastic searches, inspect building geocodes, and draw walking routes directly onto the Leaflet map. Tokens are kept in memory only and never saved to disk.
                </div>
              </div>

              {apiResponseStatus && (
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed">
                  {apiResponseStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
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
