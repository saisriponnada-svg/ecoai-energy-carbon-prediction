/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { InputFormView } from "./components/InputFormView";
import { AnalysisView } from "./components/AnalysisView";
import { PredictionView } from "./components/PredictionView";
import { CoachView } from "./components/CoachView";
import { SimulatorView } from "./components/SimulatorView";
import { EducationView } from "./components/EducationView";
import { AboutView } from "./components/AboutView";

import {
  HouseholdInput,
  AIRecommendationsResponse,
  SimulationState,
} from "./types";
import {
  DEFAULT_INPUT,
  DEMO_PRESETS,
  analyzeHouseholdEnergy,
  predictNextMonthEnergy,
} from "./utils/calculations";
import { generateFallbackRecommendations } from "./utils/aiFallback";
import { Leaf, Info, ExternalLink, Heart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [householdInput, setHouseholdInput] = useState<HouseholdInput>(DEFAULT_INPUT);

  // Compute energy analysis and prediction
  const analysis = useMemo(
    () => analyzeHouseholdEnergy(householdInput),
    [householdInput]
  );

  const prediction = useMemo(
    () => predictNextMonthEnergy(householdInput, analysis),
    [householdInput, analysis]
  );

  // State for AI recommendations and loading status
  const [recommendations, setRecommendations] = useState<AIRecommendationsResponse>(() =>
    generateFallbackRecommendations(householdInput, analysis)
  );
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Function to call the Gemini API endpoint
  const fetchGeminiRecommendations = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: householdInput,
          analysis,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && data.actionItems) {
        setRecommendations(data);
      } else {
        // Fallback
        setRecommendations(generateFallbackRecommendations(householdInput, analysis));
      }
    } catch (err) {
      console.warn("Using offline AI Coach recommendations fallback:", err);
      // Seamlessly fall back to algorithmic coach
      const fallback = generateFallbackRecommendations(householdInput, analysis);
      setRecommendations(fallback);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Update recommendations whenever household profile changes significantly
  useEffect(() => {
    // If currently using algorithmic fallback, regenerate fallback based on new inputs
    if (recommendations.source !== "gemini") {
      setRecommendations(generateFallbackRecommendations(householdInput, analysis));
    }
  }, [householdInput, analysis]);

  // Load demo preset handler
  const handleLoadDemoPreset = (presetKey: string) => {
    const preset = DEMO_PRESETS[presetKey];
    if (preset) {
      const updated = { ...preset.data };
      setHouseholdInput(updated);
      const newAnalysis = analyzeHouseholdEnergy(updated);
      setRecommendations(generateFallbackRecommendations(updated, newAnalysis));
    }
  };

  // Apply simulation state changes back to household profile
  const handleApplySimulation = (sim: SimulationState) => {
    setHouseholdInput((prev) => ({
      ...prev,
      acHoursDaily: sim.acHoursDaily,
      acTemperature: sim.acTemperature,
      fanHoursDaily: sim.fanHoursDaily,
      lightingHoursDaily: sim.lightingHoursDaily,
      lightingType: sim.useAllLed ? "100_led" : prev.lightingType,
      hasSolar: sim.hasSolar,
      solarCapacityKw: sim.solarCapacityKw,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sustainabilityScore={analysis.sustainabilityScore}
        efficiencyTier={analysis.efficiencyTier}
        onLoadPreset={handleLoadDemoPreset}
        onReset={() => handleLoadDemoPreset("standard")}
        currentInput={householdInput}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            input={householdInput}
            analysis={analysis}
            prediction={prediction}
            recommendations={recommendations}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "input" && (
          <InputFormView
            input={householdInput}
            onChange={setHouseholdInput}
            onAnalyze={() => setActiveTab("analysis")}
            onLoadPreset={handleLoadDemoPreset}
            onLoadDemoData={() => handleLoadDemoPreset("indian_urban")}
            onReset={() => handleLoadDemoPreset("standard")}
          />
        )}

        {activeTab === "analysis" && (
          <AnalysisView
            input={householdInput}
            analysis={analysis}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "prediction" && (
          <PredictionView
            prediction={prediction}
            input={householdInput}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "coach" && (
          <CoachView
            input={householdInput}
            analysis={analysis}
            recommendations={recommendations}
            isLoading={isLoadingAi}
            onRefreshGemini={fetchGeminiRecommendations}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "simulator" && (
          <SimulatorView
            input={householdInput}
            onApplyToProfile={handleApplySimulation}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "education" && (
          <EducationView setActiveTab={setActiveTab} />
        )}

        {activeTab === "about" && (
          <AboutView input={householdInput} analysis={analysis} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                E
              </div>
              <span className="font-bold text-slate-900">EcoAI</span>
              <span className="text-slate-400">|</span>
              <span>1M1B Youth Sustainability Internship Project</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab("education")}
                className="hover:text-emerald-700 transition-colors cursor-pointer"
              >
                UN SDGs (7 & 13)
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className="hover:text-emerald-700 transition-colors cursor-pointer"
              >
                What-If Simulator
              </button>
              <button
                onClick={() => setActiveTab("coach")}
                className="hover:text-emerald-700 transition-colors cursor-pointer"
              >
                AI Coach
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className="hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Documentation & Methodology
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p className="text-center sm:text-left">
              <strong>Educational Disclaimer:</strong> EcoAI energy calculations and emissions metrics are generated using empirical engineering models and regional grid averages for educational awareness. Always consult licensed electricians or energy auditors for certified municipal installations.
            </p>
            <p className="shrink-0">Aligned with UN Sustainable Development Goals</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
