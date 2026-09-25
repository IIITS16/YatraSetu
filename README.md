# 🇮🇳 YatraSetu 
**The Digital Trust and Enforcement Layer for Indian Tourism**

YatraSetu is a unified tourism safety, trust, fraud-detection, and government enforcement platform. It creates a trusted digital bridge between **Tourists, Verified Businesses, and Government Authorities**.

## 🚨 The Problem
Tourists (both domestic and international) frequently encounter:
- **Fake/Unregistered Guides** offering substandard or unsafe experiences.
- **Overcharging & GST Fraud** via fake, tampered, or mathematically manipulated bills.
- **Information Asymmetry:** Tourists do not know if a business is legitimate, or how/where to safely report a scam.
- **Inefficient Government Enforcement:** Authorities rely on manual, random physical inspections rather than data-driven, risk-prioritized enforcement.

## 💡 The Solution: "Verify Before You Trust"
YatraSetu eliminates this friction by providing a single platform for tourists to verify services, detect suspicious transactions, and report problems. Simultaneously, it gives government authorities actionable, risk-based intelligence to investigate hotspots.

**The Workflow:** `VERIFY → TRANSACT → DETECT → REPORT → PRIORITIZE → INVESTIGATE`

## ✨ Core Features
- 🛡️ **Cryptographic Guide Verification:** Guides carry a government-issued QR code containing a cryptographically signed JWT. Tourists scan it to instantly verify their official status, languages, and rating.
- 🗺️ **Verified Business Discovery:** Location-based search (powered by OpenStreetMap & Leaflet) allows tourists to find nearby verified hotels, restaurants, and transport services in real-time.
- 🧾 **AI-Powered Bill Scanning (Fraud Detection):** Powered by Google Gemini AI, the app scans invoices to check for GSTIN validity, mathematical anomalies (tax miscalculations), and obsolete taxes, generating an automated Risk Score.
- ⚖️ **Human-in-the-Loop Enforcement:** YatraSetu acts as an intelligence layer. High-risk reports and uploaded evidence are prioritized on a dedicated **Inspector Dashboard** for human investigation, ensuring no business is penalized purely by an algorithm.
- 🚨 **Automated Redressal Warnings:** Proactive warnings can be dispatched to verified businesses if a high-risk anomaly is detected, encouraging instant refunds/resolution without requiring police escalation.

## 🇮🇳 National Impact & Economic Value (Why this matters)

- **📈 Increased GDP & Tourism Growth:** When tourists feel safe and can verify services, trust increases. Higher trust directly leads to better international ratings, repeat visits, and a massive boost to India's tourism GDP.
- **💰 Securing GST & Stopping Tax Leakage:** The AI bill scanner catches tampered math, obsolete taxes, and fake GSTINs. This ensures that the tax collected from tourists actually reaches the government treasury, formalizing the economy.
- **🚫 Drastically Reducing Corruption:** By giving tourists a transparent tool to verify prices and report anomalies instantly, local scams, touts, and systemic overcharging networks are dismantled.
- **🎯 Smart, Data-Driven Raids (Zero Wasted Effort):** Instead of government inspectors manually checking random cafes and hotels, YatraSetu provides them with an **Intelligence Heatmap**. Inspectors get clear, categorized data on exact regions and specific businesses that have high-risk fraud scores, making enforcement 10x more efficient.
- **🌟 Boosting "Incredible India" Image:** Solves the core anxiety of foreign tourists by giving them a reliable, official digital safety net. A seamless, scam-free experience translates to organic global marketing for the country.

## 💻 Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Leaflet (Maps)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **AI & Data:** Google Gemini API (OCR & Fraud Logic), Overpass API (OpenStreetMap)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Google Gemini API Key

### Installation

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
2. **Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DB_USER=your_postgres_user
   DB_PASS=your_postgres_password
   DB_NAME=yatrasetu
   DB_HOST=localhost
   DB_PORT=5432
   GEMINI_API_KEY=your_gemini_key
   ```
3. **Initialize Database & Start**
   ```bash
   node migrate.js
   npm start
   ```

4. **Setup Frontend**
   ```bash
   # In a new terminal, from the root folder
   npm install
   npm run dev
   ```

---
*Built to make India easier and safer to explore, while making the tourism ecosystem more transparent and data-driven.*