import React, { useState } from 'react';
import {
  Globe,
  Key,
  Search,
  Navigation,
  MapPin,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Footprints,
  Compass,
  ArrowRight
} from 'lucide-react';
import { OneMapSearchItem, ActiveWalkingRoute, Clinic, PlanningArea, ClinicType } from '../types';
import { decodeOneMapPolyline } from '../utils/polylineDecoder';

interface OneMapLiveConsoleProps {
  oneMapToken: string;
  setOneMapToken: (token: string) => void;
  onAddClinicFromOneMap: (item: OneMapSearchItem, clinicType: ClinicType) => void;
  clinics: Clinic[];
  planningAreas: PlanningArea[];
  activeRoute: ActiveWalkingRoute | null;
  setActiveRoute: (route: ActiveWalkingRoute | null) => void;
  onFlyToCoordinates: (lat: number, lng: number) => void;
}

export const OneMapLiveConsole: React.FC<OneMapLiveConsoleProps> = ({
  oneMapToken,
  setOneMapToken,
  onAddClinicFromOneMap,
  clinics,
  planningAreas,
  activeRoute,
  setActiveRoute,
  onFlyToCoordinates
}) => {
  // Token state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMintingToken, setIsMintingToken] = useState(false);
  const [tokenStatusMsg, setTokenStatusMsg] = useState<string | null>(null);

  // Search state
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<OneMapSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Routing state
  const [routeOriginMode, setRouteOriginMode] = useState<'area' | 'coords'>('area');
  const [selectedOriginAreaId, setSelectedOriginAreaId] = useState(planningAreas[0]?.id || 'bedok');
  const [customOriginCoords, setCustomOriginCoords] = useState('1.320981,103.844150');
  const [selectedDestClinicId, setSelectedDestClinicId] = useState(clinics[0]?.id || '');
  const [routeType, setRouteType] = useState<'walk' | 'pt' | 'drive' | 'cycle'>('walk');
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Reverse geocode state
  const [revCoords, setRevCoords] = useState('1.3521,103.8198');
  const [revResult, setRevResult] = useState<string | null>(null);
  const [isRevGeocoding, setIsRevGeocoding] = useState(false);

  // Active section tab
  const [subTab, setSubTab] = useState<'token' | 'search' | 'route' | 'revgeocode'>('token');

  // Mint Token Handler
  const handleMintToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setTokenStatusMsg('Please enter email and password to mint token');
      return;
    }

    setIsMintingToken(true);
    setTokenStatusMsg(null);

    try {
      const res = await fetch('/api/onemap/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate with OneMap');
      }

      if (data.access_token) {
        setOneMapToken(data.access_token);
        setTokenStatusMsg('Successfully minted OneMap access token! Active in memory for this session (lasts 3 days).');
        // Clear secret password field from memory
        setPassword('');
      } else {
        throw new Error('No access_token returned by OneMap');
      }
    } catch (err: any) {
      setTokenStatusMsg(`Error: ${err.message || 'OneMap login failed'}`);
    } finally {
      setIsMintingToken(false);
    }
  };

  // Live OneMap Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const headers: Record<string, string> = {};
      if (oneMapToken) {
        headers['Authorization'] = oneMapToken.startsWith('Bearer ') ? oneMapToken : `Bearer ${oneMapToken}`;
      }

      const res = await fetch(`/api/onemap/search?searchVal=${encodeURIComponent(searchVal)}&pageNum=1`, {
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OneMap search error');
      }

      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          setSearchError('No OneMap results found for this search value.');
        }
      } else {
        setSearchResults([]);
        setSearchError('Unexpected response format from OneMap search service.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Route calculation
  const handleCalculateRoute = async () => {
    setIsRouting(true);
    setRoutingError(null);

    try {
      let startCoords = customOriginCoords.trim();
      let originName = `Coordinate (${startCoords})`;

      if (routeOriginMode === 'area') {
        const area = planningAreas.find(a => a.id === selectedOriginAreaId);
        if (area) {
          startCoords = `${area.centerLat},${area.centerLng}`;
          originName = `${area.name} Residential Center`;
        }
      }

      const destClinic = clinics.find(c => c.id === selectedDestClinicId);
      if (!destClinic) {
        throw new Error('Please select a destination clinic');
      }

      const endCoords = `${destClinic.lat},${destClinic.lng}`;

      const headers: Record<string, string> = {};
      if (oneMapToken) {
        headers['Authorization'] = oneMapToken.startsWith('Bearer ') ? oneMapToken : `Bearer ${oneMapToken}`;
      }

      const url = `/api/onemap/route?start=${encodeURIComponent(startCoords)}&end=${encodeURIComponent(endCoords)}&routeType=${encodeURIComponent(routeType)}`;
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.status_message || 'OneMap routing service error');
      }

      if (data.route_geometry) {
        const decodedPoints = decodeOneMapPolyline(data.route_geometry);
        const distanceM = data.route_summary?.total_distance || 0;
        const timeSec = data.route_summary?.total_time || 0;

        const routeResult: ActiveWalkingRoute = {
          originName,
          destinationClinicName: destClinic.name,
          distanceMeters: distanceM,
          durationMinutes: Math.round(timeSec / 60),
          coordinates: decodedPoints,
          instructions: data.route_instructions
        };

        setActiveRoute(routeResult);
        if (decodedPoints.length > 0) {
          onFlyToCoordinates(decodedPoints[0][0], decodedPoints[0][1]);
        }
      } else {
        throw new Error(data.status_message || 'No route geometry returned by OneMap');
      }
    } catch (err: any) {
      setRoutingError(err.message || 'Routing calculation failed');
    } finally {
      setIsRouting(false);
    }
  };

  // Reverse geocoding
  const handleReverseGeocode = async () => {
    setIsRevGeocoding(true);
    setRevResult(null);

    try {
      const headers: Record<string, string> = {};
      if (oneMapToken) {
        headers['Authorization'] = oneMapToken.startsWith('Bearer ') ? oneMapToken : `Bearer ${oneMapToken}`;
      }

      const res = await fetch(`/api/onemap/revgeocode?location=${encodeURIComponent(revCoords)}&buffer=40&addressType=All`, {
        headers
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Reverse geocode failed');
      }

      if (data.GeocodeInfo && data.GeocodeInfo.length > 0) {
        const info = data.GeocodeInfo[0];
        setRevResult(
          `${info.BUILDINGNAME ? info.BUILDINGNAME + ', ' : ''}${info.BLOCK ? 'Blk ' + info.BLOCK + ' ' : ''}${info.ROAD}, Singapore ${info.POSTALCODE}`
        );
      } else {
        setRevResult('No building or postal address recorded within 40m buffer of this point.');
      }
    } catch (err: any) {
      setRevResult(`Error: ${err.message}`);
    } finally {
      setIsRevGeocoding(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
      {/* Header and Token Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              SLA OneMap Live Services Gateway
            </h3>
            <span className="text-[11px] text-slate-400">
              Live Token Minting &middot; Elastic Search &middot; Reverse Geocoding &middot; Accessibility Routing
            </span>
          </div>
        </div>

        {/* In-Memory Secret Token Status */}
        <div className="flex items-center gap-2 text-xs">
          {oneMapToken ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-teal-950/70 border border-teal-800 text-teal-300 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Token Active in Memory</span>
              <button
                onClick={() => {
                  setOneMapToken('');
                  setTokenStatusMsg('Token cleared from memory.');
                }}
                className="text-slate-400 hover:text-rose-400 ml-1"
                title="Wipe token from session"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[11px]">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>No Token (Enter manually below)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setSubTab('token')}
          className={`px-3 py-1.5 font-medium rounded transition-colors whitespace-nowrap ${
            subTab === 'token'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1. Mint / Enter Token
        </button>

        <button
          onClick={() => setSubTab('search')}
          className={`px-3 py-1.5 font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            subTab === 'search'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3 h-3" />
          <span>2. Live Clinic & Address Search</span>
        </button>

        <button
          onClick={() => setSubTab('route')}
          className={`px-3 py-1.5 font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            subTab === 'route'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Footprints className="w-3 h-3" />
          <span>3. Walk / Transit Route Engine</span>
        </button>

        <button
          onClick={() => setSubTab('revgeocode')}
          className={`px-3 py-1.5 font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            subTab === 'revgeocode'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>4. Reverse Geocode</span>
        </button>
      </div>

      {/* Tab 1: Token Minting & Manual Entry */}
      {subTab === 'token' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200 block mb-1">Confidential Memory-Only Policy:</strong>
            As requested, tokens and credentials are kept strictly in browser memory during this session. Nothing is ever written to disk, database, or environment files.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Mint Token directly from OneMap */}
            <form onSubmit={handleMintToken} className="space-y-3 p-4 bg-slate-950/60 rounded border border-slate-800">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-teal-400" />
                <span>Option A: Mint Fresh Token via OneMap API</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Calls <code className="text-slate-300">https://www.onemap.gov.sg/api/auth/post/getToken</code> (valid for 3 days).
              </p>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">OneMap Registered Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@domain.sg"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">OneMap Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isMintingToken}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900/50 text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isMintingToken ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Contacting OneMap...</span>
                  </>
                ) : (
                  <span>Mint 3-Day OneMap Token</span>
                )}
              </button>
            </form>

            {/* Right: Manual Token Paste */}
            <div className="space-y-3 p-4 bg-slate-950/60 rounded border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                  <Key className="w-4 h-4 text-sky-400" />
                  <span>Option B: Paste Pre-Minted Token</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  If you already generated a bearer token from the SLA OneMap Portal, paste it below.
                </p>

                <label className="block text-[11px] text-slate-400 mb-1">Bearer Token</label>
                <textarea
                  rows={4}
                  value={oneMapToken}
                  onChange={(e) => setOneMapToken(e.target.value.trim())}
                  placeholder="ey..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 break-all"
                />
              </div>

              {oneMapToken && (
                <button
                  type="button"
                  onClick={() => {
                    setOneMapToken('');
                    setTokenStatusMsg('Token cleared from memory.');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe Token from Session Memory</span>
                </button>
              )}
            </div>
          </div>

          {tokenStatusMsg && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-teal-300 font-mono leading-relaxed">
              {tokenStatusMsg}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Clinic & Address Search */}
      {subTab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search live OneMap: e.g. Bedok Polyclinic, Raffles Medical, Tengah Plantation, 469662..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900/50 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Query OneMap Elastic</span>
            </button>
          </form>

          {searchError && (
            <div className="p-3 bg-amber-950/60 border border-amber-800 rounded text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results Grid */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div className="text-[11px] text-slate-400 font-mono">
                Found {searchResults.length} official OneMap results:
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span>{item.BUILDING || item.SEARCHVAL}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        S({item.POSTAL || 'N/A'})
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {item.ROAD_NAME} {item.BLK_NO ? `Blk ${item.BLK_NO}` : ''}
                    </div>
                    <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                      Coords: {Number(item.LATITUDE).toFixed(5)}, {Number(item.LONGITUDE).toFixed(5)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onFlyToCoordinates(Number(item.LATITUDE), Number(item.LONGITUDE))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Fly Here</span>
                    </button>

                    <button
                      onClick={() => onAddClinicFromOneMap(item, 'chas_gp')}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Import as Clinic</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Walk / Transit Route Engine */}
      {subTab === 'route' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Calculate actual walking or transit route geometry from residential zones to the nearest primary care clinic using SLA OneMap Routing Service: <code className="text-slate-300">https://www.onemap.gov.sg/api/public/routingsvc/route</code>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Origin */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Origin Residential Point</label>
              <div className="flex gap-1 mb-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRouteOriginMode('area')}
                  className={`px-2 py-0.5 rounded ${
                    routeOriginMode === 'area' ? 'bg-teal-900/60 text-teal-300 border border-teal-700' : 'text-slate-400'
                  }`}
                >
                  Planning Area
                </button>
                <button
                  type="button"
                  onClick={() => setRouteOriginMode('coords')}
                  className={`px-2 py-0.5 rounded ${
                    routeOriginMode === 'coords' ? 'bg-teal-900/60 text-teal-300 border border-teal-700' : 'text-slate-400'
                  }`}
                >
                  Custom Lat,Lng
                </button>
              </div>

              {routeOriginMode === 'area' ? (
                <select
                  value={selectedOriginAreaId}
                  onChange={(e) => setSelectedOriginAreaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {planningAreas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.region})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customOriginCoords}
                  onChange={(e) => setCustomOriginCoords(e.target.value)}
                  placeholder="1.320981,103.844150"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              )}
            </div>

            {/* Destination Clinic */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Destination Clinic</label>
              <select
                value={selectedDestClinicId}
                onChange={(e) => setSelectedDestClinicId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                {clinics.slice(0, 40).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.planningAreaName})
                  </option>
                ))}
              </select>
            </div>

            {/* Route Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Transit Mode</label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="walk">Walk (Pedestrian)</option>
                <option value="pt">Public Transit (Bus / MRT)</option>
                <option value="drive">Drive</option>
                <option value="cycle">Cycle</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculateRoute}
              disabled={isRouting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900/50 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              {isRouting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Compute OneMap Route</span>
            </button>

            {activeRoute && (
              <button
                onClick={() => setActiveRoute(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear Route Overlay
              </button>
            )}
          </div>

          {routingError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{routingError}</span>
            </div>
          )}

          {/* Active Route Summary Card */}
          {activeRoute && (
            <div className="p-4 bg-slate-950 rounded-lg border border-teal-500/40 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-400 text-sm">
                  OneMap Route: {activeRoute.originName} &rarr; {activeRoute.destinationClinicName}
                </span>
                <span className="font-mono text-slate-400">
                  Mode: <strong className="text-slate-200 capitalize">{routeType}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-900 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500">Total Distance</span>
                  <div className="text-sm font-bold text-slate-200">
                    {(activeRoute.distanceMeters / 1000).toFixed(2)} km
                  </div>
                  <div className="text-[10px] text-slate-500">{activeRoute.distanceMeters} meters</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500">Estimated Duration</span>
                  <div className="text-sm font-bold text-amber-400">
                    {activeRoute.durationMinutes} mins
                  </div>
                  <div className="text-[10px] text-slate-500">at normal walking pace</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500">10-Min Walk Standard</span>
                  <div className={`text-sm font-bold ${activeRoute.durationMinutes <= 12 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeRoute.durationMinutes <= 12 ? 'Accessible (<12m)' : 'Excessive Walk'}
                  </div>
                  <div className="text-[10px] text-slate-500">MOH accessibility goal</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500">Map Overlay</span>
                  <div className="text-sm font-bold text-sky-400">Polyline Drawn</div>
                  <div className="text-[10px] text-slate-500">{activeRoute.coordinates.length} waypoints</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reverse Geocode */}
      {subTab === 'revgeocode' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Convert GPS coordinates into an official Singapore Land Authority postal address: <code className="text-slate-300">https://www.onemap.gov.sg/api/public/revgeocode?location=1.3,103.8&amp;buffer=40&amp;addressType=All</code>.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={revCoords}
              onChange={(e) => setRevCoords(e.target.value)}
              placeholder="e.g. 1.3268,103.9320 (Bedok Polyclinic)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleReverseGeocode}
              disabled={isRevGeocoding}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900/50 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isRevGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
              <span>Reverse Geocode</span>
            </button>
          </div>

          {revResult && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{revResult}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
