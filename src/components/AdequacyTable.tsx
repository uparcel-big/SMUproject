import React, { useState, useMemo } from 'react';
import { AdequacyMetric, AdequacyStatus, Region } from '../types';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdequacyTableProps {
  metrics: AdequacyMetric[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  onFlyToMap: (areaId: string) => void;
}

type SortField = 'name' | 'population' | 'elderly' | 'elderlyPct' | 'clinics' | 'ratio' | 'popPerClinic' | 'score';
type SortOrder = 'asc' | 'desc';

export const AdequacyTable: React.FC<AdequacyTableProps> = ({
  metrics,
  selectedAreaId,
  onSelectArea,
  onFlyToMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('ratio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // default show lowest ratios first (underserved)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'ratio' || field === 'score' ? 'asc' : 'desc');
    }
  };

  const filteredMetrics = useMemo(() => {
    return metrics
      .filter(m => {
        if (selectedRegion !== 'All' && m.region !== selectedRegion) return false;
        if (selectedStatus !== 'All' && m.status !== selectedStatus) return false;
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchesName = m.planningAreaName.toLowerCase().includes(query);
          const matchesRegion = m.region.toLowerCase().includes(query);
          return matchesName || matchesRegion;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        switch (sortField) {
          case 'name':
            valA = a.planningAreaName;
            valB = b.planningAreaName;
            return sortOrder === 'asc' ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
          case 'population':
            valA = a.totalPopulation;
            valB = b.totalPopulation;
            break;
          case 'elderly':
            valA = a.elderlyPopulation;
            valB = b.elderlyPopulation;
            break;
          case 'elderlyPct':
            valA = a.elderlyPct;
            valB = b.elderlyPct;
            break;
          case 'clinics':
            valA = a.clinicsCount;
            valB = b.clinicsCount;
            break;
          case 'ratio':
            valA = a.clinicsPer10k;
            valB = b.clinicsPer10k;
            break;
          case 'popPerClinic':
            valA = a.populationPerClinic;
            valB = b.populationPerClinic;
            break;
          case 'score':
            valA = a.serviceScore;
            valB = b.serviceScore;
            break;
        }

        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [metrics, selectedRegion, selectedStatus, searchQuery, sortField, sortOrder]);

  const getStatusBadge = (status: AdequacyStatus) => {
    switch (status) {
      case 'Well Serviced':
        return <span className="text-emerald-400 font-medium">Well Serviced</span>;
      case 'Adequate':
        return <span className="text-sky-400 font-medium">Adequate</span>;
      case 'Underserved':
        return <span className="text-amber-400 font-medium">Underserved</span>;
      case 'Critical Shortage':
        return <span className="text-rose-400 font-medium font-semibold">Critical Shortage</span>;
    }
  };

  const regions: string[] = ['All', 'Central', 'East', 'North', 'North-East', 'West'];
  const statuses: string[] = ['All', 'Critical Shortage', 'Underserved', 'Adequate', 'Well Serviced'];

  return (
    <div className="space-y-4">
      {/* Control Strip: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search planning area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Region Segmented Controls */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 mr-1 hidden lg:inline">Region:</span>
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                selectedRegion === region
                  ? 'bg-slate-800 text-teal-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 mr-1 hidden lg:inline">Status:</span>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                selectedStatus === status
                  ? 'bg-slate-800 text-teal-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main High-Density Data Grid */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium select-none">
                <th className="py-2.5 px-3">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-200">
                    <span>Planning Area</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('population')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Population</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('elderlyPct')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Seniors 65+</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('clinics')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Clinics</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('ratio')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Clinics / 10k</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('popPerClinic')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Pop / Clinic</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('score')} className="flex items-center justify-end gap-1 w-full hover:text-slate-200">
                    <span>Index</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Adequacy Assessment</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No planning areas found matching your query criteria.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map(item => {
                  const isSelected = selectedAreaId === item.planningAreaId;
                  return (
                    <tr
                      key={item.planningAreaId}
                      onClick={() => onSelectArea(item.planningAreaId)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-teal-950/30 border-l-2 border-teal-500' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                        {item.planningAreaName}
                      </td>

                      {/* Region */}
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {item.region}
                      </td>

                      {/* Population */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                        {item.totalPopulation.toLocaleString()}
                      </td>

                      {/* Seniors 65+ */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className={item.elderlyPct >= 22 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                          {item.elderlyPct}%
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({item.elderlyPopulation.toLocaleString()})
                        </span>
                      </td>

                      {/* Total Clinics (Polyclinic breakdown) */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                        {item.clinicsCount}
                        {item.polyclinicsCount > 0 ? (
                          <span className="text-blue-400 text-[10px] ml-1">
                            ({item.polyclinicsCount} Poly)
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px] ml-1">(0 Poly)</span>
                        )}
                      </td>

                      {/* Clinics / 10k Ratio */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                        <span
                          className={
                            item.clinicsPer10k >= 3.8
                              ? 'text-emerald-400'
                              : item.clinicsPer10k >= 2.5
                              ? 'text-sky-400'
                              : item.clinicsPer10k >= 1.2
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {item.clinicsPer10k}
                        </span>
                      </td>

                      {/* Population per Clinic */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                        {item.clinicsCount > 0 ? item.populationPerClinic.toLocaleString() : 'N/A'}
                      </td>

                      {/* Service Score */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                        <span className="text-slate-200">{item.serviceScore}</span>
                        <span className="text-slate-500 text-[10px]">/100</span>
                      </td>

                      {/* Status & Primary Deficit */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <div className="text-[11px]">{getStatusBadge(item.status)}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs" title={item.primaryDeficit}>
                            {item.primaryDeficit}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFlyToMap(item.planningAreaId);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-950/40 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>View Map</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmark Reference Note */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2">
        <div>
          Official Benchmarks: MOH Target ≥ 3.5 primary care clinics / 10k population · 1 clinic per &lt; 2,500 residents
        </div>
        <div className="font-mono">
          Showing {filteredMetrics.length} of {metrics.length} Planning Areas
        </div>
      </div>
    </div>
  );
};
