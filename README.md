# 🏢 CivicPulse AI — Smart City Municipal Operating System (Civic OS)

[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-blue?logo=google&logoColor=white)](https://aistudio.google.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CivicPulse AI** (known in VS Code workspace as **CIVICPULSE AI**) is an immersive, full-stack municipal operating system bridging the gap between residents and city councils. Equipped with high-speed, multi-model AI workflows, live spatial analytics, and immutable ledger logging, CivicPulse AI transforms citizen concerns into standardized, trackable, and auditable municipal work orders.

---

## 🌟 Highlights & Key Features

### 🎙️ 1. Multi-Modal Issue Reporter & Geolocation
*   **Voice and Photo Inputs**: Citizens can record voice complaints or upload high-resolution defect images with simulated upload status bars.
*   **AI Dialect Translation**: Translates regional colloquialisms, slang, and over 50 languages into standardized technical reports using the `@google/genai` model suite.
*   **Auto Severity & Routing**: Automatically extracts critical data, geolocates targets, determines category, and calculates urgency.
*   **Interactive Pin Dropper**: Pinpoint hazards directly on an interactive 2D matrix command center map, with real-time latitude/longitude detection and GPS simulation support.
*   **Duplicate Report Block**: Automatically scans for nearby active reports of similar category within 50 meters, prompting residents to upvote the existing report to save city budget.

### 📊 2. Dynamic City Command Center & Resolution Pipeline
*   **Zonal Heatmaps**: Visually map infrastructure defects across categories like Roads, Water, Power, Waste, and Parks. Click on any hotspot node to display a detailed resolution drawer.
*   **Interactive Status Pipeline**: Track the step-by-step resolution of any issue (Reported ➔ Under Review ➔ Verified ➔ Assigned ➔ In Progress ➔ Resolved) with authentic contractor assignment details and live timestamps.
*   **Community Dialogue Hub**: Upvote unresolved problems and contribute comments to live community discussion timelines with persistent citizen/authority dialogue streams.
*   **Authority Dispatch Desk**: Administrator & analyst personas can directly assign contractor teams (e.g., *Brihanmumbai Lighting Corp*, *Zonal PWD Squad Alpha*) and publish on-chain resolutions.
*   **Predictive AI Diagnostics**: Trigger proactive deep audits to predict infrastructure failure rates before they disrupt citizens.

### 🛡️ 3. Immutable Blockchain-Sealed Logs
*   **Tamper-Proof Audit Trail**: All events (submission, assignment, budget approval, resolution) are compiled into simulated blockchain blocks.
*   **Cryptographic Verification**: High-contrast block visualizer allows any citizen or auditor to verify ledger integrity.

### 🎮 4. Gamified Engagement & Civic Actions
*   **Daily Ward Attendance**: Users can check in daily to build their attendance streak and earn experience points.
*   **Daily Ward Trivia**: Interactive quizzes centered on municipal knowledge, waste segregation, and community standards (e.g., correct bins for recyclables) to test and reward residents.
*   **Dynamic Leaderboard**: Features top civic contributors, with **Shaik Sihaam Anjum** leading as the premier "Ward Guardian" with the highest score.
*   **Persona Sandbox**: Instantly pivot perspective between **Resident**, **Municipal Analyst**, and **Administrator** modes to test different authorization workflows and visual dashboards in real-time.

---

## 🛠️ Technology Stack

### Core Frontend & UI
*   **React 18 & Vite**: Built for responsive, low-overhead interactions.
*   **Tailwind CSS (v4)**: Modern utilities providing high-contrast accessibility.
*   **Motion**: Powering beautiful, hardware-accelerated state transitions and slide animations.
*   **Three.js**: Visualizing fluid 3D orbital departments and active ledger particle streams.
*   **Recharts**: Modern responsive charts displaying real-time city stats and resolution performance.

### Backend & AI Architecture
*   **Node.js & Express**: High-performance RESTful API endpoints running on port `3000`.
*   **Google Gemini SDK (`@google/genai`)**: Dynamic content analysis, schema-enforced JSON generation, and translation.
*   **Model Fallback & Rotation**: Custom retry logic incorporating `gemini-3.5-flash`, `gemini-3.1-flash-lite`, and standard model pools to bypass API spikes seamlessly.

---

## 📦 Local Installation & Development

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Workspace
```bash
git clone https://github.com/<your-username>/CivicPulse-Ai.git
cd CivicPulse-Ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Launch the App
To run the full-stack development server with live Vite HMR routing:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the dashboard.

### 5. Production Build
Compiles frontend assets to optimized static bundles and compiles the Express backend into a single `dist/server.cjs` bundle with `esbuild`:
```bash
npm run build
npm start
```

---

## 🚀 How to Commit and Push to Your Existing GitHub Repository

If you have already created the remote repository **`CivicPulse-Ai`** on GitHub, use these commands in your local workspace terminal (VS Code) to cleanly push this updated project:

### 1. Initialize Git (If not already initialized)
```bash
git init
```

### 2. Add Your Remote Repository Link
Substitute your actual GitHub username where `<your-username>` is shown:
```bash
git remote add origin https://github.com/<your-username>/CivicPulse-Ai.git
```
*Note: If git reports `remote origin already exists`, update it with:*
```bash
git remote set-url origin https://github.com/<your-username>/CivicPulse-Ai.git
```

### 3. Stage and Commit Your Workspace Files
```bash
# Stage all project files (including the updated README and requirements.txt)
git add .

# Create the update commit
git commit -m "feat: updated CivicPulse AI with robust model fallback, requirements.txt, and complete documentation"
```

### 4. Push to GitHub
```bash
# Rename default branch to main (standard)
git branch -M main

# Force-push to overwrite any stale previous deleted commits, aligning remote with your active workspace
git push -u origin main --force
```

---

## 📜 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
