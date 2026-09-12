import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Sustainability Recommendations Endpoint
app.post("/api/gemini/recommendations", async (req: Request, res: Response) => {
  try {
    const { energyProfile } = req.body;

    if (!energyProfile) {
      return res.status(400).json({ error: "Missing energyProfile data in request body." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(200).json({
        source: "fallback",
        message: "Gemini API key is not configured. Serving algorithmic sustainability recommendations.",
        recommendations: null,
      });
    }

    const currencySymbol = energyProfile.currencySymbol || (energyProfile.currency === "USD" ? "$" : "₹");

    const prompt = `You are the EcoAI Sustainability Coach for a household energy monitoring system (built for an educational 1M1B internship project focusing on SDG 7: Affordable and Clean Energy & SDG 13: Climate Action).
Analyze the following household energy profile and generate tailored, actionable, high-impact recommendations:

Household Profile:
- Number of people: ${energyProfile.householdMembers}
- Total monthly electricity consumption: ${energyProfile.monthlyKwh} kWh
- Electricity tariff: ${currencySymbol}${energyProfile.pricePerKwh}/kWh
- Estimated monthly cost: ${currencySymbol}${energyProfile.monthlyCost}
- Estimated monthly CO2 emissions: ${energyProfile.monthlyCo2} kg
- Sustainability Score: ${energyProfile.sustainabilityScore}/100 (Tier: ${energyProfile.efficiencyTier || "Moderate"})
- Uses solar panels: ${energyProfile.hasSolar ? "Yes" : "No"}
- Daily AC usage: ${energyProfile.acHours} hours/day at ${energyProfile.acTemperature || 24}°C (~${energyProfile.acKwh} kWh/mo)
- Daily Fan usage: ${energyProfile.fanHours} hours/day (~${energyProfile.fanKwh} kWh/mo)
- Refrigerator type: ${energyProfile.refrigeratorType} (~${energyProfile.fridgeKwh} kWh/mo)
- Lighting profile: ${energyProfile.lightingType} for ${energyProfile.lightingHours} hours/day (~${energyProfile.lightingKwh} kWh/mo)
- Other appliances: ${energyProfile.otherAppliancesNote || "Standard electronics and geyser"} (~${energyProfile.otherKwh} kWh/mo)
- Top energy consuming category: ${energyProfile.topConsumer}

REQUIREMENTS:
1. Provide 3 to 5 realistic, prioritized recommendations directly addressing the user's specific usage values above.
2. For each recommendation, provide:
   - title: concise title
   - category: "cooling" | "appliances" | "lighting" | "habits" | "solar"
   - impactLevel: "High" | "Medium" | "Low"
   - description: clear, encouraging explanation
   - expectedImprovementDirection: concrete direction of change (e.g. "Reduce AC usage from ${energyProfile.acHours || 5} hours/day to 3 hours/day. Potential effect: lower estimated electricity consumption and CO₂ emissions.")
   - estimatedKwhSavingsMonthly: realistic numeric estimate in kWh
   - estimatedCostSavingsMonthly: realistic cost savings in ${currencySymbol}
   - estimatedCo2SavingsMonthly: realistic CO2 reduction in kg
   - environmentalBenefit: specific CO2 or resource benefit note
3. Provide a motivating summary paragraph ("coachMessage") synthesizing their current footprint and how achievable improvement is.
4. Keep estimates transparent and clearly labeled as estimates. Do NOT invent unrealistic savings or fake research statistics.

Respond strictly in valid JSON with this exact structure:
{
  "coachMessage": "string",
  "priorityFocus": "string",
  "actionItems": [
    {
      "id": "string",
      "title": "string",
      "category": "cooling",
      "impactLevel": "High",
      "description": "string",
      "expectedImprovementDirection": "string",
      "estimatedKwhSavingsMonthly": 0,
      "estimatedCostSavingsMonthly": 0,
      "estimatedCo2SavingsMonthly": 0,
      "environmentalBenefit": "string"
    }
  ],
  "quickWins": [
    "string",
    "string",
    "string"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    try {
      const parsed = JSON.parse(responseText);
      return res.json({
        source: "gemini",
        data: parsed,
      });
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", responseText, parseErr);
      return res.status(200).json({
        source: "fallback",
        raw: responseText,
        error: "Failed to parse model JSON",
      });
    }
  } catch (err: any) {
    console.error("Error generating Gemini recommendations:", err);
    return res.status(200).json({
      source: "fallback",
      error: err.message || "Failed to contact Gemini API",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoAI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
