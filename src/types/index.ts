export type Region = 'Central' | 'East' | 'North' | 'North-East' | 'West';

export type ClinicType = 'polyclinic' | 'chas_gp' | 'emergency_24h' | 'dental' | 'specialist';

export type ChasTier = 'CHAS_Orange_Blue' | 'CHAS_All' | 'Non_CHAS' | 'Government_Subsidised';

export interface PlanningArea {
  id: string;
  name: string;
  region: Region;
  totalPopulation: number;
  elderlyPopulation: number; // 65+ years old
  youthPopulation: number; // 0-14 years old
  workingAgePopulation: number; // 15-64 years old
  areaKm2: number;
  density: number; // per km2
  hdbDwellingPct: number;
  centerLat: number;
  centerLng: number;
  subzones: string[];
}

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  planningAreaId: string;
  planningAreaName: string;
  address: string;
  postalCode: string;
  lat: number;
  lng: number;
  chasTier: ChasTier;
  operatingHours: string;
  phone: string;
  isSimulated?: boolean;
}

export type AdequacyStatus = 'Well Serviced' | 'Adequate' | 'Underserved' | 'Critical Shortage';

export type ElderlyRiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface AdequacyMetric {
  planningAreaId: string;
  planningAreaName: string;
  region: Region;
  totalPopulation: number;
  elderlyPopulation: number;
  elderlyPct: number;
  clinicsCount: number;
  polyclinicsCount: number;
  chasGpsCount: number;
  clinicsPer10k: number;
  populationPerClinic: number;
  elderlyPerClinic: number;
  serviceScore: number; // 0 to 100
  status: AdequacyStatus;
  elderlyRisk: ElderlyRiskLevel;
  walkabilityCatchmentPct: number; // estimated % of area within 800m of a clinic
  primaryDeficit: string;
}

export interface NationalSummary {
  totalPopulation: number;
  totalElderly: number;
  totalClinics: number;
  totalPolyclinics: number;
  avgClinicsPer10k: number;
  avgPopPerClinic: number;
  underservedAreasCount: number;
  criticalAreasCount: number;
  wellServicedCount: number;
}

export interface SimulationParams {
  populationGrowthPct: number; // e.g. +0%, +10%, +25%
  elderlySurgePct: number; // aging scenario e.g. +15% elderly
  minClinicsPer10kTarget: number; // e.g. 3.5 or 4.0
  activeClinicTypes: ClinicType[];
  selectedRegion: string; // 'All' | Region
  searchQuery: string;
  filterStatus: 'All' | AdequacyStatus;
  bufferRadiusMeters: 400 | 800 | 1200;
  showBuffers: boolean;
}

export interface AIAdvisorReport {
  timestamp: string;
  summary: string;
  criticalAreas: {
    name: string;
    issue: string;
    urgency: 'Critical' | 'High' | 'Medium';
    recommendedAction: string;
  }[];
  demographicInsights: string[];
  strategicRecommendations: string[];
}

export interface OneMapSearchItem {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface OneMapRouteResponse {
  route_geometry?: string; // encoded polyline
  status_message?: string;
  status?: number;
  route_instructions?: string[][];
  route_summary?: {
    start_point: string;
    end_point: string;
    total_time: number; // in seconds
    total_distance: number; // in meters
  };
}

export interface ActiveWalkingRoute {
  originName: string;
  destinationClinicName: string;
  distanceMeters: number;
  durationMinutes: number;
  coordinates: [number, number][]; // decoded lat, lng
  instructions?: string[][];
}

