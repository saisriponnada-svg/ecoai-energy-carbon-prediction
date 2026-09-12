export type CurrencyCode = "INR" | "USD";

export type SustainabilityTier =
  | "Needs Improvement"
  | "Fair"
  | "Moderate"
  | "Efficient"
  | "Excellent";

export type RefrigeratorType =
  | "inverter_5star" // ~0.8 kWh/day
  | "standard_frost_free" // ~1.3 kWh/day
  | "double_door_large" // ~1.9 kWh/day
  | "older_inefficient"; // ~2.6 kWh/day

export type LightingType =
  | "100_led" // 10W per point
  | "mix_led_cfl" // 18W per point
  | "mostly_cfl" // 24W per point
  | "incandescent"; // 60W per point

export interface HouseholdInput {
  householdMembers: number;
  monthlyKwh: number; // User billed or baseline
  isAutoCalculated: boolean; // whether monthlyKwh comes from appliance sum or manual bill
  currency: CurrencyCode; // "INR" | "USD"
  pricePerKwh: number; // electricity tariff (e.g. ₹8.00/kWh or $0.16/kWh)
  emissionFactor: number; // kg CO2 per kWh (default 0.82 for India / 0.70 US avg)
  gridRegionName: string;
  isDemoData?: boolean;

  // Cooling
  acCount: number;
  acHoursDaily: number;
  acTemperature: number; // Thermostat setpoint (e.g. 24°C)
  acTonnage: number; // 1.5 ton default
  fanCount: number;
  fanHoursDaily: number;

  // Refrigeration & Lighting
  refrigeratorType: RefrigeratorType;
  refrigeratorCount: number;
  lightingType: LightingType;
  lightingHoursDaily: number;
  bulbCount: number;

  // Other appliances
  waterHeaterHoursDaily: number; // 2000W geyser
  waterHeaterUsesPerWeek: number;
  tvHoursDaily: number; // ~100W
  computerHoursDaily: number; // ~120W
  washingMachineLoadsPerWeek: number; // ~0.8 kWh/cycle
  otherApplianceWatts: number; // standby/misc watts

  // Solar & Renewables
  hasSolar: boolean;
  solarCapacityKw: number; // e.g. 3 kW
  solarMonthlyKwh: number; // e.g. 320 kWh
}

export interface ApplianceBreakdownItem {
  id: string;
  name: string;
  category: "cooling" | "refrigeration" | "lighting" | "water_heating" | "entertainment" | "other";
  dailyKwh: number;
  monthlyKwh: number;
  monthlyCost: number;
  monthlyCo2Kg: number;
  percentage: number;
  color: string;
  description: string;
}

export interface EnergyAnalysisResult {
  totalDailyKwh: number;
  totalMonthlyKwh: number;
  netMonthlyKwh: number; // after solar deduction
  monthlyCost: number;
  annualCost: number;
  monthlyCo2Kg: number;
  annualCo2Kg: number;
  annualCo2Tons: number;
  solarGeneratedKwh: number;
  solarCostSaved: number;
  solarCo2OffsetKg: number;
  perCapitaMonthlyKwh: number;
  applianceItems: ApplianceBreakdownItem[];
  topConsumer: ApplianceBreakdownItem;
  sustainabilityScore: number;
  efficiencyTier: SustainabilityTier;
  scoreBreakdown: {
    perCapitaScore: number; // max 30
    coolingScore: number; // max 25
    solarScore: number; // max 20
    lightingScore: number; // max 15
    miscScore: number; // max 10
  };
  carbonEquivalents: {
    treesNeededPerYear: number;
    kmDrivenGasolineCar: number;
    smartphonesCharged: number;
    flightsNyToLondonFraction: number;
  };
}

export interface PredictionResult {
  currentMonthlyKwh: number;
  predictedNextMonthKwh: number;
  differenceKwh: number;
  percentageChange: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  drivers: {
    factor: string;
    impactKwh: number;
    description: string;
    direction: "up" | "down" | "neutral";
  }[];
  trendData: {
    month: string;
    actualKwh: number | null;
    predictedKwh: number | null;
    isProjected: boolean;
  }[];
  modelType: string;
  modelExplanation: string;
}

export interface AIRecommendationItem {
  id: string;
  title: string;
  category: "cooling" | "appliances" | "lighting" | "habits" | "solar";
  impactLevel: "High" | "Medium" | "Low";
  description: string;
  expectedImprovementDirection?: string;
  estimatedKwhSavingsMonthly: number;
  estimatedCostSavingsMonthly: number;
  estimatedCo2SavingsMonthly: number;
  environmentalBenefit: string;
}

export interface AIRecommendationsResponse {
  source: "gemini" | "fallback";
  coachMessage: string;
  priorityFocus: string;
  actionItems: AIRecommendationItem[];
  quickWins: string[];
  totalPotentialKwhSavings: number;
  totalPotentialCostSavings: number;
  totalPotentialCo2Savings: number;
}

export interface SimulationState {
  acHoursDaily: number;
  acTemperature: number;
  fanHoursDaily: number;
  lightingHoursDaily: number;
  useAllLed: boolean;
  waterHeaterMinutesSavedDaily: number;
  otherApplianceReductionHoursDaily?: number;
  solarCapacityKw: number;
  hasSolar: boolean;
}
