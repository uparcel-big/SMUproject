import {
  PlanningArea,
  Clinic,
  AdequacyMetric,
  NationalSummary,
  SimulationParams,
  AdequacyStatus,
  ElderlyRiskLevel
} from '../types';

/**
 * Calculates healthcare adequacy metrics for a given planning area
 * combining SingStat population demographics and OneMap clinic distribution.
 */
export function calculateAdequacy(
  area: PlanningArea,
  clinics: Clinic[],
  simParams?: Partial<SimulationParams>
): AdequacyMetric {
  // Apply population growth simulation if specified
  const growthMultiplier = 1 + (simParams?.populationGrowthPct || 0) / 100;
  const elderlyMultiplier = 1 + (simParams?.elderlySurgePct || 0) / 100;

  const adjustedPopulation = Math.round(area.totalPopulation * growthMultiplier);
  const adjustedElderly = Math.round(area.elderlyPopulation * growthMultiplier * elderlyMultiplier);
  const elderlyPct = adjustedPopulation > 0 ? (adjustedElderly / adjustedPopulation) * 100 : 0;

  // Filter clinics belonging to this planning area and match active types
  const areaClinics = clinics.filter(c => {
    const belongsToArea = c.planningAreaId === area.id;
    if (!belongsToArea) return false;
    if (simParams?.activeClinicTypes && simParams.activeClinicTypes.length > 0) {
      return simParams.activeClinicTypes.includes(c.type);
    }
    return true;
  });

  const clinicsCount = areaClinics.length;
  const polyclinicsCount = areaClinics.filter(c => c.type === 'polyclinic').length;
  const chasGpsCount = areaClinics.filter(c => c.type === 'chas_gp' || c.type === 'emergency_24h').length;

  // Ratios
  const clinicsPer10k = adjustedPopulation > 0
    ? Number(((clinicsCount / adjustedPopulation) * 10000).toFixed(2))
    : 0;

  const populationPerClinic = clinicsCount > 0
    ? Math.round(adjustedPopulation / clinicsCount)
    : adjustedPopulation;

  const elderlyPerClinic = clinicsCount > 0
    ? Math.round(adjustedElderly / clinicsCount)
    : adjustedElderly;

  // Calculate Walkability Catchment approximation:
  // 800m buffer (~2.01 sq km per clinic coverage circle, accounting for overlap)
  const theoreticalCoverageKm2 = clinicsCount * 1.5;
  const walkabilityCatchmentPct = Math.min(
    100,
    Math.round((theoreticalCoverageKm2 / Math.max(1, area.areaKm2)) * 100)
  );

  // Status classification based on MOH & Urban Primary Care accessibility standards
  let status: AdequacyStatus = 'Adequate';
  if (clinicsCount === 0 || clinicsPer10k < 1.2 || populationPerClinic > 8000) {
    status = 'Critical Shortage';
  } else if (clinicsPer10k < 2.5 || populationPerClinic > 4000) {
    status = 'Underserved';
  } else if (clinicsPer10k >= 3.8 && populationPerClinic <= 2600) {
    status = 'Well Serviced';
  } else {
    status = 'Adequate';
  }

  // Elderly Risk Level
  let elderlyRisk: ElderlyRiskLevel = 'Low';
  if (elderlyPct >= 22 && elderlyPerClinic > 1000) {
    elderlyRisk = 'Severe';
  } else if (elderlyPct >= 18 && elderlyPerClinic > 750) {
    elderlyRisk = 'High';
  } else if (elderlyPct >= 15 || elderlyPerClinic > 550) {
    elderlyRisk = 'Moderate';
  }

  // Service Composite Score (0-100)
  // 40% clinics/10k (target 4.0), 20% polyclinic anchor, 25% elderly load, 15% walkability
  const ratioScore = Math.min(100, (clinicsPer10k / 4.0) * 100) * 0.4;
  const polyclinicScore = (polyclinicsCount > 0 ? 100 : 25) * 0.2;
  const elderlyLoadScore = Math.max(0, 100 - (elderlyPerClinic / 15)) * 0.25;
  const coverageScore = walkabilityCatchmentPct * 0.15;

  const serviceScore = Math.round(Math.min(100, Math.max(5, ratioScore + polyclinicScore + elderlyLoadScore + coverageScore)));

  // Identify primary deficit message
  let primaryDeficit = 'Healthy clinic-to-resident ratio';
  if (clinicsCount === 0) {
    primaryDeficit = 'Complete healthcare void: No registered primary care clinics';
  } else if (populationPerClinic > 7000) {
    primaryDeficit = `Overloaded capacity: 1 clinic per ${populationPerClinic.toLocaleString()} residents (Target: <2,500)`;
  } else if (polyclinicsCount === 0 && adjustedPopulation > 60000) {
    primaryDeficit = 'Missing public polyclinic: Lacks subsidized institutional anchor';
  } else if (elderlyRisk === 'Severe') {
    primaryDeficit = `Chronic care stress: ${elderlyPct.toFixed(1)}% elderly with ${elderlyPerClinic} seniors per clinic`;
  } else if (walkabilityCatchmentPct < 40) {
    primaryDeficit = `Geographic gap: Only ~${walkabilityCatchmentPct}% of land within 10-min walk of a clinic`;
  } else if (status === 'Underserved') {
    primaryDeficit = `Below MOH benchmark: ${clinicsPer10k} clinics/10k pop (Target: 3.5+)`;
  }

  return {
    planningAreaId: area.id,
    planningAreaName: area.name,
    region: area.region,
    totalPopulation: adjustedPopulation,
    elderlyPopulation: adjustedElderly,
    elderlyPct: Number(elderlyPct.toFixed(1)),
    clinicsCount,
    polyclinicsCount,
    chasGpsCount,
    clinicsPer10k,
    populationPerClinic,
    elderlyPerClinic,
    serviceScore,
    status,
    elderlyRisk,
    walkabilityCatchmentPct,
    primaryDeficit
  };
}

/**
 * Aggregates all planning areas into a national summary
 */
export function calculateNationalSummary(
  areas: PlanningArea[],
  metrics: AdequacyMetric[],
  clinics: Clinic[]
): NationalSummary {
  const totalPopulation = metrics.reduce((sum, m) => sum + m.totalPopulation, 0);
  const totalElderly = metrics.reduce((sum, m) => sum + m.elderlyPopulation, 0);
  const totalClinics = clinics.length;
  const totalPolyclinics = clinics.filter(c => c.type === 'polyclinic').length;

  const avgClinicsPer10k = totalPopulation > 0
    ? Number(((totalClinics / totalPopulation) * 10000).toFixed(2))
    : 0;

  const avgPopPerClinic = totalClinics > 0
    ? Math.round(totalPopulation / totalClinics)
    : 0;

  const underservedAreasCount = metrics.filter(m => m.status === 'Underserved').length;
  const criticalAreasCount = metrics.filter(m => m.status === 'Critical Shortage').length;
  const wellServicedCount = metrics.filter(m => m.status === 'Well Serviced').length;

  return {
    totalPopulation,
    totalElderly,
    totalClinics,
    totalPolyclinics,
    avgClinicsPer10k,
    avgPopPerClinic,
    underservedAreasCount,
    criticalAreasCount,
    wellServicedCount
  };
}
