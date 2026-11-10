import { PlanningArea } from '../types';

/**
 * SingStat Population Trends & Census data by Planning Area (Singapore Department of Statistics).
 * Includes total resident population, elderly cohort (65+), youth cohort (0-14),
 * planning area land size (sq km), and geographic centroid (WGS84).
 */
export const SINGSTAT_PLANNING_AREAS: PlanningArea[] = [
  // --- CENTRAL REGION ---
  {
    id: 'bukit_merah',
    name: 'Bukit Merah',
    region: 'Central',
    totalPopulation: 147800,
    elderlyPopulation: 34100, // 23.1% elderly (pioneer generation high)
    youthPopulation: 16200,
    workingAgePopulation: 97500,
    areaKm2: 14.34,
    density: 10306,
    hdbDwellingPct: 76.5,
    centerLat: 1.2819,
    centerLng: 103.8239,
    subzones: ['Redhill', 'Tiong Bahru', 'Telok Blangah', 'Bukit Ho Swee', 'Harbourfront', 'Radin Mas']
  },
  {
    id: 'queenstown',
    name: 'Queenstown',
    region: 'Central',
    totalPopulation: 96400,
    elderlyPopulation: 22800, // 23.6% elderly
    youthPopulation: 10800,
    workingAgePopulation: 62800,
    areaKm2: 20.43,
    density: 4718,
    hdbDwellingPct: 79.2,
    centerLat: 1.2942,
    centerLng: 103.7861,
    subzones: ['Commonwealth', 'Ghim Moh', 'Dover', 'Mei Chin', 'Tanglin Halt', 'Pasir Panjang']
  },
  {
    id: 'toa_payoh',
    name: 'Toa Payoh',
    region: 'Central',
    totalPopulation: 120600,
    elderlyPopulation: 27500, // 22.8% elderly
    youthPopulation: 13500,
    workingAgePopulation: 79600,
    areaKm2: 8.17,
    density: 14761,
    hdbDwellingPct: 84.1,
    centerLat: 1.3343,
    centerLng: 103.8563,
    subzones: ['Toa Payoh Central', 'Lorong 8 Toa Payoh', 'Boon Teck', 'Potong Pasir', 'Bidadari']
  },
  {
    id: 'kallang',
    name: 'Kallang',
    region: 'Central',
    totalPopulation: 101400,
    elderlyPopulation: 20100,
    youthPopulation: 11900,
    workingAgePopulation: 69400,
    areaKm2: 9.17,
    density: 11057,
    hdbDwellingPct: 74.0,
    centerLat: 1.3100,
    centerLng: 103.8651,
    subzones: ['Bendemeer', 'Boon Keng', 'Geylang Bahru', 'Old Airport', 'Tanjong Rhu', 'Kallang Bahru']
  },
  {
    id: 'geylang',
    name: 'Geylang',
    region: 'Central',
    totalPopulation: 109800,
    elderlyPopulation: 21300,
    youthPopulation: 12400,
    workingAgePopulation: 76100,
    areaKm2: 9.64,
    density: 11390,
    hdbDwellingPct: 69.8,
    centerLat: 1.3182,
    centerLng: 103.8871,
    subzones: ['Aljunied', 'Geylang East', 'MacPherson', 'Kampong Ubi', 'Dakota']
  },
  {
    id: 'novena',
    name: 'Novena',
    region: 'Central',
    totalPopulation: 49200,
    elderlyPopulation: 8900,
    youthPopulation: 7100,
    workingAgePopulation: 33200,
    areaKm2: 8.98,
    density: 5478,
    hdbDwellingPct: 28.4,
    centerLat: 1.3204,
    centerLng: 103.8436,
    subzones: ['Moulmein', 'Balestier', 'Mount Pleasant', 'Chancery']
  },
  {
    id: 'outram',
    name: 'Outram',
    region: 'Central',
    totalPopulation: 18200,
    elderlyPopulation: 4850, // 26.6% elderly (super-aged)
    youthPopulation: 1550,
    workingAgePopulation: 11800,
    areaKm2: 1.37,
    density: 13284,
    hdbDwellingPct: 71.0,
    centerLat: 1.2828,
    centerLng: 103.8392,
    subzones: ['Chinatown', 'Pearl\'s Hill', 'People\'s Park']
  },
  {
    id: 'marine_parade',
    name: 'Marine Parade',
    region: 'Central',
    totalPopulation: 46100,
    elderlyPopulation: 11200, // 24.3% elderly
    youthPopulation: 5100,
    workingAgePopulation: 29800,
    areaKm2: 6.12,
    density: 7532,
    hdbDwellingPct: 54.3,
    centerLat: 1.3020,
    centerLng: 103.9073,
    subzones: ['Marine Drive', 'Katong', 'Mountbatten', 'Meyer']
  },
  {
    id: 'bishan',
    name: 'Bishan',
    region: 'Central',
    totalPopulation: 86800,
    elderlyPopulation: 18200,
    youthPopulation: 10200,
    workingAgePopulation: 58400,
    areaKm2: 7.62,
    density: 11391,
    hdbDwellingPct: 78.5,
    centerLat: 1.3508,
    centerLng: 103.8482,
    subzones: ['Bishan East', 'Marymount', 'Bishan West']
  },
  {
    id: 'bukit_timah',
    name: 'Bukit Timah',
    region: 'Central',
    totalPopulation: 77800,
    elderlyPopulation: 14400,
    youthPopulation: 11500,
    workingAgePopulation: 51900,
    areaKm2: 17.53,
    density: 4438,
    hdbDwellingPct: 4.8, // predominantly private
    centerLat: 1.3294,
    centerLng: 103.8021,
    subzones: ['Hillview', 'Coronation Road', 'Farrer', 'Swiss Club']
  },
  {
    id: 'rochor',
    name: 'Rochor',
    region: 'Central',
    totalPopulation: 13200,
    elderlyPopulation: 3250,
    youthPopulation: 1100,
    workingAgePopulation: 8850,
    areaKm2: 1.62,
    density: 8148,
    hdbDwellingPct: 62.4,
    centerLat: 1.3039,
    centerLng: 103.8529,
    subzones: ['Kampong Glam', 'Bencoolen', 'Farrer Park', 'Sungei Road']
  },
  {
    id: 'downtown_core',
    name: 'Downtown Core',
    region: 'Central',
    totalPopulation: 3720,
    elderlyPopulation: 580,
    youthPopulation: 390,
    workingAgePopulation: 2750,
    areaKm2: 4.34,
    density: 857,
    hdbDwellingPct: 1.2,
    centerLat: 1.2870,
    centerLng: 103.8520,
    subzones: ['City Hall', 'Marina Centre', 'Raffles Place', 'Tanjong Pagar', 'Bugis']
  },

  // --- EAST REGION ---
  {
    id: 'bedok',
    name: 'Bedok',
    region: 'East',
    totalPopulation: 275800,
    elderlyPopulation: 59300, // 21.5% elderly (one of Singapore's largest elderly aggregates)
    youthPopulation: 33400,
    workingAgePopulation: 183100,
    areaKm2: 21.69,
    density: 12715,
    hdbDwellingPct: 77.8,
    centerLat: 1.3236,
    centerLng: 103.9273,
    subzones: ['Bedok North', 'Bedok South', 'Bedok Reservoir', 'Chai Chee', 'Frankel', 'Kaki Bukit', 'Siglap']
  },
  {
    id: 'tampines',
    name: 'Tampines',
    region: 'East',
    totalPopulation: 268200,
    elderlyPopulation: 44200,
    youthPopulation: 35100,
    workingAgePopulation: 188900,
    areaKm2: 20.89,
    density: 12838,
    hdbDwellingPct: 82.3,
    centerLat: 1.3531,
    centerLng: 103.9447,
    subzones: ['Tampines East', 'Tampines West', 'Tampines North', 'Simei', 'Xilin']
  },
  {
    id: 'pasir_ris',
    name: 'Pasir Ris',
    region: 'East',
    totalPopulation: 145900,
    elderlyPopulation: 23100,
    youthPopulation: 20100,
    workingAgePopulation: 102700,
    areaKm2: 15.02,
    density: 9713,
    hdbDwellingPct: 83.9,
    centerLat: 1.3721,
    centerLng: 103.9474,
    subzones: ['Pasir Ris Central', 'Pasir Ris Drive', 'Loyang', 'Elias']
  },
  {
    id: 'changi',
    name: 'Changi',
    region: 'East',
    totalPopulation: 2140,
    elderlyPopulation: 320,
    youthPopulation: 240,
    workingAgePopulation: 1580,
    areaKm2: 40.61,
    density: 52,
    hdbDwellingPct: 0.0,
    centerLat: 1.3644,
    centerLng: 103.9915,
    subzones: ['Changi Point', 'Changi Airport', 'Changi Village']
  },

  // --- NORTH REGION ---
  {
    id: 'woodlands',
    name: 'Woodlands',
    region: 'North',
    totalPopulation: 254100,
    elderlyPopulation: 38200,
    youthPopulation: 37400,
    workingAgePopulation: 178500,
    areaKm2: 26.12,
    density: 9728,
    hdbDwellingPct: 89.4,
    centerLat: 1.4382,
    centerLng: 103.7890,
    subzones: ['Woodlands East', 'Woodlands South', 'Woodlands West', 'Innova', 'Admiralty', 'Midview']
  },
  {
    id: 'yishun',
    name: 'Yishun',
    region: 'North',
    totalPopulation: 222900,
    elderlyPopulation: 37900,
    youthPopulation: 31200,
    workingAgePopulation: 153800,
    areaKm2: 21.24,
    density: 10494,
    hdbDwellingPct: 84.7,
    centerLat: 1.4304,
    centerLng: 103.8354,
    subzones: ['Yishun Central', 'Yishun East', 'Yishun South', 'Khatib', 'Chong Pang', 'Nee Soon']
  },
  {
    id: 'sembawang',
    name: 'Sembawang',
    region: 'North',
    totalPopulation: 110800,
    elderlyPopulation: 12600, // 11.3% elderly - younger demographic
    youthPopulation: 21400,
    workingAgePopulation: 76800,
    areaKm2: 12.34,
    density: 8978,
    hdbDwellingPct: 86.8,
    centerLat: 1.4491,
    centerLng: 103.8185,
    subzones: ['Sembawang Central', 'Sembawang Springs', 'Canberra', 'The Senoko']
  },

  // --- NORTH-EAST REGION ---
  {
    id: 'sengkang',
    name: 'Sengkang',
    region: 'North-East',
    totalPopulation: 252800,
    elderlyPopulation: 30800, // 12.2% elderly
    youthPopulation: 42900,
    workingAgePopulation: 179100,
    areaKm2: 10.59,
    density: 23871, // extremely high residential density
    hdbDwellingPct: 91.5,
    centerLat: 1.3916,
    centerLng: 103.8944,
    subzones: ['Rivervale', 'Compassvale', 'Anchorvale', 'Fernvale', 'Sengkang West']
  },
  {
    id: 'punggol',
    name: 'Punggol',
    region: 'North-East',
    totalPopulation: 191600,
    elderlyPopulation: 18900, // 9.8% elderly (youngest estate in Singapore)
    youthPopulation: 39600,
    workingAgePopulation: 133100,
    areaKm2: 9.57,
    density: 20020,
    hdbDwellingPct: 92.8,
    centerLat: 1.4052,
    centerLng: 103.9023,
    subzones: ['Punggol Field', 'Punggol Waterway', 'Punggol Point', 'Northshore', 'Matilda']
  },
  {
    id: 'hougang',
    name: 'Hougang',
    region: 'North-East',
    totalPopulation: 225400,
    elderlyPopulation: 42800,
    youthPopulation: 29800,
    workingAgePopulation: 152800,
    areaKm2: 13.93,
    density: 16180,
    hdbDwellingPct: 83.2,
    centerLat: 1.3712,
    centerLng: 103.8915,
    subzones: ['Hougang Central', 'Lorong Ah Soo', 'Defu', 'Kangkar', 'Kovan', 'Tai Seng']
  },
  {
    id: 'ang_mo_kio',
    name: 'Ang Mo Kio',
    region: 'North-East',
    totalPopulation: 161200,
    elderlyPopulation: 38200, // 23.7% elderly (mature estate, heavy chronic disease burden)
    youthPopulation: 18100,
    workingAgePopulation: 104900,
    areaKm2: 13.94,
    density: 11563,
    hdbDwellingPct: 85.6,
    centerLat: 1.3691,
    centerLng: 103.8454,
    subzones: ['Ang Mo Kio Town Centre', 'Cheng San', 'Chong Boon', 'Kebun Baru', 'Yio Chu Kang']
  },
  {
    id: 'serangoon',
    name: 'Serangoon',
    region: 'North-East',
    totalPopulation: 116200,
    elderlyPopulation: 23600,
    youthPopulation: 14400,
    workingAgePopulation: 78200,
    areaKm2: 10.10,
    density: 11504,
    hdbDwellingPct: 76.8,
    centerLat: 1.3554,
    centerLng: 103.8679,
    subzones: ['Serangoon Central', 'Serangoon Garden', 'Lorong Chuan', 'Serangoon North']
  },

  // --- WEST REGION ---
  {
    id: 'jurong_west',
    name: 'Jurong West',
    region: 'West',
    totalPopulation: 258400,
    elderlyPopulation: 42700,
    youthPopulation: 37200,
    workingAgePopulation: 178500,
    areaKm2: 14.69,
    density: 17590,
    hdbDwellingPct: 88.5,
    centerLat: 1.3404,
    centerLng: 103.7090,
    subzones: ['Boon Lay Place', 'Chin Bee', 'Hong Kah', 'Jurong West Central', 'Taman Jurong', 'Gek Poh']
  },
  {
    id: 'choa_chu_kang',
    name: 'Choa Chu Kang',
    region: 'West',
    totalPopulation: 188900,
    elderlyPopulation: 27400,
    youthPopulation: 28300,
    workingAgePopulation: 133200,
    areaKm2: 6.11,
    density: 30916,
    hdbDwellingPct: 89.2,
    centerLat: 1.3840,
    centerLng: 103.7470,
    subzones: ['Choa Chu Kang Central', 'Yew Tee', 'Teck Whye', 'Keat Hong']
  },
  {
    id: 'bukit_batok',
    name: 'Bukit Batok',
    region: 'West',
    totalPopulation: 158800,
    elderlyPopulation: 28100,
    youthPopulation: 22600,
    workingAgePopulation: 108100,
    areaKm2: 11.13,
    density: 14267,
    hdbDwellingPct: 84.4,
    centerLat: 1.3590,
    centerLng: 103.7518,
    subzones: ['Bukit Batok Central', 'Bukit Batok East', 'Bukit Batok West', 'Guilin', 'Brickworks']
  },
  {
    id: 'bukit_panjang',
    name: 'Bukit Panjang',
    region: 'West',
    totalPopulation: 137400,
    elderlyPopulation: 23600,
    youthPopulation: 18900,
    workingAgePopulation: 94900,
    areaKm2: 8.99,
    density: 15283,
    hdbDwellingPct: 86.9,
    centerLat: 1.3774,
    centerLng: 103.7719,
    subzones: ['Fajar', 'Bangkit', 'Senja', 'Jelebu', 'Saujana', 'Petir']
  },
  {
    id: 'clementi',
    name: 'Clementi',
    region: 'West',
    totalPopulation: 91800,
    elderlyPopulation: 19600, // 21.3% elderly
    youthPopulation: 11200,
    workingAgePopulation: 61000,
    areaKm2: 9.49,
    density: 9673,
    hdbDwellingPct: 78.4,
    centerLat: 1.3162,
    centerLng: 103.7649,
    subzones: ['Clementi Central', 'Clementi West', 'Clementi Woods', 'Sunset Way']
  },
  {
    id: 'jurong_east',
    name: 'Jurong East',
    region: 'West',
    totalPopulation: 76400,
    elderlyPopulation: 15100,
    youthPopulation: 8900,
    workingAgePopulation: 52400,
    areaKm2: 17.83,
    density: 4284,
    hdbDwellingPct: 83.1,
    centerLat: 1.3329,
    centerLng: 103.7436,
    subzones: ['Jurong Gateway', 'Toh Guan', 'Yuhua East', 'Yuhua West']
  },
  {
    id: 'tengah',
    name: 'Tengah',
    region: 'West',
    totalPopulation: 34200, // Newly inhabited BTO town, rapidly expanding toward 130k+
    elderlyPopulation: 2900,
    youthPopulation: 7400,
    workingAgePopulation: 23900,
    areaKm2: 7.40,
    density: 4621,
    hdbDwellingPct: 98.2,
    centerLat: 1.3638,
    centerLng: 103.7288,
    subzones: ['Plantation', 'Park District', 'Garden District', 'Brickland', 'Forest Hill']
  }
];

export const REGIONS: { label: string; value: string }[] = [
  { label: 'All Regions', value: 'All' },
  { label: 'Central', value: 'Central' },
  { label: 'East', value: 'East' },
  { label: 'North', value: 'North' },
  { label: 'North-East', value: 'North-East' },
  { label: 'West', value: 'West' }
];
