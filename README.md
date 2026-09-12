# EcoAI: AI-Powered Energy Consumption and Carbon Footprint Prediction System

**1M1B (1 Million for 1 Billion) Youth Sustainability Internship Project**  
*A complete working AI-for-Sustainability web application designed to help households track electricity consumption, estimate carbon emissions, predict future energy usage, and receive personalized AI recommendations.*

---

## 1. Problem Statement
Residential buildings account for over 25% of global electricity consumption and a substantial proportion of global greenhouse gas emissions. However, the majority of households have virtually zero granular visibility into:
- Which specific appliances drive the bulk of their monthly utility bill.
- How thermostat choices (such as 18°C vs. 24°C) drastically increase compressor duty cycles.
- The direct conversion between kilowatt-hours (kWh) consumed and kilograms of carbon dioxide (CO2) emitted by regional electricity generation grids.
- How actionable behavioral and technological modifications can deliver measurable financial and environmental savings.

## 2. Proposed Solution
**EcoAI** provides an end-to-end intelligent energy management interface for households:
1. **Appliance-Level Energy Modeling:** Empirically breaks down electricity consumption across Air Conditioning, Ventilation, Refrigeration, Lighting, Water Heating, Electronics, and Standby (vampire) loads.
2. **AI-Powered Sustainability Coach:** Leverages Google Gemini (`gemini-3.8-flash`) through a secure full-stack server architecture to deliver prioritized, context-aware efficiency advice with transparent distinction between calculated savings and behavioral guidance.
3. **Transparent Predictive Forecasting:** Employs a multivariable seasonal regression algorithm based on Cooling Degree Days (CDD), occupancy factors, and calendar variances to forecast next-month electricity demand.
4. **Interactive What-If Simulator:** Allows users to adjust sliders in real-time (AC runtime, thermostat temperature, LED lighting conversion, geyser timers, rooftop solar PV capacity) and observe immediate savings in dollars and CO2 avoided.
5. **Sustainability Health Scoring:** Evaluates households on a transparent 0–100 scale across 5 core efficiency pillars.
6. **UN Sustainable Development Goals Integration:** Direct educational alignment with SDG 7 (Affordable and Clean Energy), SDG 13 (Climate Action), and SDG 12 (Responsible Consumption and Production).

---

## 3. AI Elements Used

### A. Generative AI Coach (`@google/genai` & `gemini-3.8-flash`)
- **Server-Side Security:** All Gemini API interactions occur strictly through server-side Express routes (`/api/gemini/recommendations`), ensuring API keys are never exposed to the client bundle.
- **Structured Synthesis:** Sends comprehensive household telemetry (equipment profiles, top consumer shares, tariffs, solar status) to Gemini to generate prioritized action items, high-impact suggestions, and zero-cost quick wins.
- **Robust Fallback Engine:** Features an algorithmic fallback coach with deterministic savings equations so that the application remains 100% functional even if the Gemini API key is unconfigured or offline.

### B. Machine Learning / Statistical Prediction Model
- Rather than falsely claiming an untraceable black-box neural network inside the browser, EcoAI uses a **transparent Cooling Degree Day (CDD) multivariable regression model**:
  $$\text{Predicted kWh} = \text{Baseline Load} + (\text{Cooling Load} \times \Delta_{\text{seasonal}} \times 0.35) + \text{Occupancy Delta} + \text{Days Delta}$$
- This models real-world physics: compressor runtimes shift as ambient seasonal temperatures rise or fall.

---

## 4. Carbon Footprint Estimation Methodology
Carbon emissions are computed using transparent regional grid emission factors:
$$\text{CO}_2\ (\text{kg}) = \text{Net Monthly kWh} \times \text{Regional Emission Factor}\ (\text{kg CO}_2/\text{kWh})$$

Where:
- **Net Monthly kWh** = $\max(0, \text{Gross Consumption} - \text{Solar Generation})$
- **Regional Emission Factors** include configurable presets:
  - Default / Global Average: ~0.70 kg CO2/kWh
  - Coal-Heavy Grids (e.g., India national average): ~0.75 kg CO2/kWh
  - US National Average (EIA): ~0.39 kg CO2/kWh
  - European Union Grid Mix: ~0.23 kg CO2/kWh
  - Clean Hydro / Nuclear Mix: ~0.12 kg CO2/kWh

Real-world equivalencies (trees required for sequestration, gasoline car kilometers driven, and smartphone charges) provide tangible ecological context for students and families.

---

## 5. Technology Stack
- **Client Framework:** React 19, TypeScript
- **Styling & Design System:** Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans typography
- **Data Visualizations:** Recharts (Donuts, Bar Charts, Composed Trend Forecasts)
- **Backend API & Server:** Node.js, Express 4.x with Vite SPA middleware
- **AI SDK:** `@google/genai` with model `gemini-3.8-flash`
- **Execution Runtime:** Node.js 22+

---

## 6. How to Run the Project

### Prerequisites
- Node.js 20+ installed
- npm or pnpm

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure your Gemini API key in .env
echo 'GEMINI_API_KEY="your-gemini-api-key"' > .env

# 3. Start development server (serves on http://0.0.0.0:3000)
npm run dev

# 4. Production build
npm run build
npm start
```

---

## 7. Main Evaluator Journey (1M1B Internship Demo)
1. **Load Demo Presets:** Click "Load Demo Data" to load realistic profiles (e.g., "Moderate Family", "High-Usage Household", "Eco-Conscious Solar Home").
2. **Examine Energy Analysis:** Review the appliance contribution table, pie chart distributions, and cost breakdowns.
3. **Inspect AI Prediction:** Review the predicted next-month energy draw, 90% confidence interval, and seasonal driving factors.
4. **Consult AI Sustainability Coach:** Review customized recommendations generated by Gemini 3.8 Flash or test regeneration.
5. **Run What-If Simulation:** Drag the AC hours, thermostat temperature (+6%/°C efficiency), and solar capacity sliders to observe real-time cost and CO2 differences.
6. **Apply to Profile:** Click "Apply to My Profile" to see simulated changes propagate across the entire dashboard.
7. **Export / Print:** Access the About tab to print or export an executive summary report for academic evaluation.

---

## 8. Limitations & Assumptions
- **User-Reported Data:** Appliance runtimes are based on user estimates rather than hardware-level smart meter clamp telemetry.
- **Static Grid Factor:** Grid emission factors represent annual regional averages rather than minute-by-minute marginal emissions.
- **Prototype Status:** Designed for educational and consumer behavioral training as part of the 1M1B internship.

---

## 9. Future Enhancements
- IoT hardware integration with smart plugs (Zigbee, Matter, Shelly) for automated real-time power logging.
- Integration with OpenWeatherMap / NOAA APIs for live ambient degree-day feeds.
- Time-of-Use (ToU) utility tariff scheduling for battery storage and EV charging optimization.

---

*Developed with pride for the 1M1B Youth Sustainability Internship.*
