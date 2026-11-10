import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SINGSTAT_PLANNING_AREAS } from './src/data/singstatPopulation.ts';
import { ONEMAP_CLINICS } from './src/data/onemapClinics.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory working copies so user additions/modifications persist during session
let workingClinics = [...ONEMAP_CLINICS];
let workingPlanningAreas = [...SINGSTAT_PLANNING_AREAS];

// API: SingStat Demographic Data
app.get('/api/singstat/data', (req: Request, res: Response) => {
  res.json({
    source: 'Singapore Department of Statistics (SingStat) Population Trends',
    count: workingPlanningAreas.length,
    data: workingPlanningAreas
  });
});

// API: OneMap Clinic Data
app.get('/api/onemap/clinics', (req: Request, res: Response) => {
  res.json({
    source: 'Singapore Land Authority (SLA) OneMap Thematic / CHAS Directory',
    count: workingClinics.length,
    data: workingClinics
  });
});

// --- ONEMAP OFFICIAL API PROXY ENDPOINTS (Credentials kept in client memory, not saved) ---

// 1. Mint OneMap Token (lasts 3 days)
app.post('/api/onemap/get-token', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required to mint OneMap token' });
    }

    const response = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SGHealthAdequacyApp/1.0'
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'OneMap authentication failed',
        details: data
      });
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to contact OneMap authentication service',
      message: err?.message || 'Network error'
    });
  }
});

// 2. Geocode / Search with Elastic Search
app.get('/api/onemap/search', async (req: Request, res: Response) => {
  try {
    const searchVal = req.query.searchVal as string;
    const pageNum = (req.query.pageNum as string) || '1';
    const authHeader = req.headers.authorization;

    if (!searchVal) {
      return res.status(400).json({ error: 'searchVal parameter is required' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'SGHealthAdequacyApp/1.0'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=${pageNum}`;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: 'OneMap search request failed',
      message: err?.message || 'Network error'
    });
  }
});

// 3. Reverse Geocode
app.get('/api/onemap/revgeocode', async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string; // 'lat,lng'
    const buffer = (req.query.buffer as string) || '40';
    const addressType = (req.query.addressType as string) || 'All';
    const authHeader = req.headers.authorization;

    if (!location) {
      return res.status(400).json({ error: 'location parameter is required (format: lat,lng)' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'SGHealthAdequacyApp/1.0'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${encodeURIComponent(location)}&buffer=${buffer}&addressType=${addressType}`;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: 'OneMap reverse geocode failed',
      message: err?.message || 'Network error'
    });
  }
});

// 4. Routing: walk | drive | cycle | pt
app.get('/api/onemap/route', async (req: Request, res: Response) => {
  try {
    const start = req.query.start as string; // 'lat,lng'
    const end = req.query.end as string; // 'lat,lng'
    const routeType = (req.query.routeType as string) || 'walk'; // walk | drive | cycle | pt
    const authHeader = req.headers.authorization;

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end coordinates required (format: lat,lng)' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'SGHealthAdequacyApp/1.0'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const url = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&routeType=${encodeURIComponent(routeType)}`;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: 'OneMap routing service failed',
      message: err?.message || 'Network error'
    });
  }
});

// API: Gemini Health Capacity Advisor
app.post('/api/advisor', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured in environment'
      });
    }

    const { metrics, simulationParams, selectedArea } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    // Format top underserved and top elderly-strained planning areas for AI prompt
    const underserved = metrics
      .filter((m: any) => m.status === 'Critical Shortage' || m.status === 'Underserved')
      .slice(0, 8);

    const elderlyStrained = [...metrics]
      .sort((a: any, b: any) => b.elderlyPerClinic - a.elderlyPerClinic)
      .slice(0, 5);

    const prompt = `
You are Singapore's Chief Urban Healthcare & Population Planning Analyst.
Analyze this demographic and primary care dataset cross-referencing SingStat (Singapore Department of Statistics) and OneMap (Singapore Land Authority).

Current Scenario:
- Population Growth Simulation: +${simulationParams?.populationGrowthPct || 0}%
- Elderly Surge Simulation: +${simulationParams?.elderlySurgePct || 0}%
- Target Clinic Density Benchmark: ${simulationParams?.minClinicsPer10kTarget || 3.5} clinics / 10,000 residents
${selectedArea ? `- Specifically Focused on Planning Area: ${selectedArea.name} (${selectedArea.region} Region, Pop: ${selectedArea.totalPopulation.toLocaleString()}, 65+: ${selectedArea.elderlyPct}% with ${selectedArea.clinicsCount} clinics, Status: ${selectedArea.status})` : ''}

Key Underserved Areas Identified:
${underserved.map((u: any) => `- ${u.planningAreaName} (${u.region}): Pop ${u.totalPopulation.toLocaleString()}, Clinics: ${u.clinicsCount}, Ratio: ${u.clinicsPer10k} per 10k (Deficit: ${u.primaryDeficit})`).join('\n')}

Top Aging Burden Areas (Elderly per clinic):
${elderlyStrained.map((e: any) => `- ${e.planningAreaName}: ${e.elderlyPct}% seniors, ${e.elderlyPerClinic} seniors per clinic, ${e.polyclinicsCount} polyclinics`).join('\n')}

Provide an analytical executive report in valid JSON format ONLY with the following schema:
{
  "summary": "2-3 concise sentences synthesizing whether Singapore's population is well-serviced under this scenario, highlighting the critical disparity between mature aging estates and rapid BTO towns like Tengah/Punggol.",
  "criticalAreas": [
    {
      "name": "Area Name",
      "issue": "Specific primary care or demographic deficit",
      "urgency": "Critical | High | Medium",
      "recommendedAction": "Actionable proposal (e.g., place 2 CHAS GPs at [Subzone], deploy mobile Healthier SG chronic clinic, accelerate polyclinic opening)"
    }
  ],
  "demographicInsights": [
    "Key insight 1 regarding elderly chronic disease load vs GP distribution",
    "Key insight 2 regarding young families / pediatric capacity",
    "Key insight 3 regarding geographical accessibility & walkability buffers"
  ],
  "strategicRecommendations": [
    "Specific policy recommendation 1 for MOH / SLA OneMap planning",
    "Specific recommendation 2 regarding CHAS incentive tiers",
    "Specific recommendation 3 regarding preventive care hub co-location"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      timestamp: new Date().toISOString(),
      ...parsed
    });
  } catch (err: any) {
    console.error('Gemini Advisor Error:', err);
    return res.status(500).json({
      error: 'Failed to generate healthcare adequacy advisory',
      message: err?.message || 'Server error'
    });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SG HealthMap Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
