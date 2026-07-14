# 🏠 HOMIGO: Service On The Go
### *Premium Brand-Agnostic AMC & IoT Predictive Maintenance Platform*

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-purple?logo=vite)](https://vite.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3-blue?logo=capacitor)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**HOMIGO** is a premium, unified Annual Maintenance Contract (AMC) and predictive maintenance platform designed to bring all household appliances under a single, brand-agnostic protection plan. Inspired by the convenience of vetted, door-to-door technician dispatches (like **Urban Company**) and the reliability of hassle-free claims (like **Onsitego**), HOMIGO introduces a major paradigm shift: **IoT-enabled predictive maintenance**.

Rather than waiting for appliances to break down (reactive repair) or managing fragmented warranty contracts, homeowners can monitor, safeguard, and maintain their entire appliance ecosystem via a single high-fidelity application.

---

## 🚀 Key Features

### 📅 Brand-Agnostic Dynamic AMC Planner
- **Appliance Agnostic:** Cover ACs, Refrigerators, Washing Machines, Microwaves, Water Purifiers, etc., regardless of brand (Samsung, LG, Whirlpool, Kent, etc.).
- **Dynamic Pricing:** Subscriptions are calculated based on the appliance's original purchase price and age cohort (New, Mid-Life, Legacy).
- **Flexible Plans:** Select plans ranging from 6 months, 9 months, 1.5 years, 2 years, up to 3 years.

### 🔌 Real-Time IoT Telemetry & Anomaly Detection (TinyML)
- **Vibration & G-Force Analysis:** Tracks motor/compressor anomalies.
- **Thermal Monitoring:** Keeps tabs on overheating or cooling performance declines.
- **Current & Voltage Sensors:** Detects short cycling, continuous high-load draws, or voltage spikes.
- **TinyML Simulations:** Test anomalous thresholds in real time to trigger push alerts before failure.

### 🛠️ One-Click Service Booking & Dispatch
- **Instant Diagnostics:** Diagnostics are bundled with error codes so technicians arrive with the correct parts.
- **Verified Professionals:** Certified technicians dispatched directly to the door.

### 💳 Multi-Step Checkout Wizard
- **Pincode Verification:** Checks localized serviceability boundaries.
- **Smart Hardware Bundling:** Seamlessly add IoT smart plug packages to your plan.
- **Secure Simulation:** Verify subscriptions and install schedules mock-ups.

### 📊 Built-In Interactive Business Pitch
- **Live Strategy Deck:** Explores market opportunity (TAM/SAM/SOM), revenue model, SWOT analysis, and operational roadmap directly inside the app.

---

## 🛠️ Technology Stack
- **Core Framework:** [React 19](https://react.dev/) & [Vite 8](https://vite.dev/) (fast hot-module replacement)
- **Mobile Wrapper:** [Capacitor 8](https://capacitorjs.com/) (cross-platform deployment to Android & iOS)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) (for generating invoices and reports)
- **Styling:** Custom Vanilla CSS (located in `src/index.css` for a custom modern glassmorphic look)

---

## 📂 Directory Structure

```text
├── android/                 # Capacitor Native Android Project
├── ios/                     # Capacitor Native iOS Project
├── public/                  # Static assets & icons
├── src/
│   ├── components/
│   │   ├── AMCOverlay.jsx       # AMC details & subscriber portal
│   │   ├── AMCPlanner.jsx       # Subscription pricing calculator
│   │   ├── Account.jsx          # Profile, history, and settings
│   │   ├── BusinessPitch.jsx    # Business strategy & market metrics
│   │   ├── CartOverlay.jsx      # Checkout cart drawer
│   │   ├── CheckoutWizard.jsx   # Pincode, IoT bundling, and billing wizard
│   │   ├── Dashboard.jsx        # Smart telemetry charts & alerts
│   │   └── IoTOverlay.jsx       # TinyML simulator & sensor controller
│   ├── App.jsx                  # Root App layout and state manager
│   ├── index.css                # Global styles, variables, & design tokens
│   ├── main.jsx                 # React DOM bootstrapper
│   └── utils/
│       └── pincodeDb.js         # Serviceable area registry
├── capacitor.config.json    # Capacitor configuration
├── vite.config.js           # Vite development server settings
└── package.json             # Project dependencies & npm scripts
```

---

## ⚙️ Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)

### 🔧 Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/homigo.git
   cd homigo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 💻 Running the App Locally
Start the Vite development server:
```bash
npm run dev
```
The application will launch on your local host (usually `http://localhost:5173`).

---

## 📱 Mobile Deployment (Capacitor)

HOMIGO is configured to compile into a native mobile application using Capacitor.

### 🤖 Android Setup
1. Build the web files:
   ```bash
   npm run build
   ```
2. Sync files with the Android project:
   ```bash
   npx cap sync android
   ```
3. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
4. Build and run on an emulator or a physical device from Android Studio.

### 🍏 iOS Setup
1. Build the web files:
   ```bash
   npm run build
   ```
2. Sync files with the iOS project:
   ```bash
   npx cap sync ios
   ```
3. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
4. Run on a simulator or device via Xcode.

---

## 📈 Revenue & Business Model
HOMIGO relies on a multi-tiered monetization strategy:
1. **Dynamic Annual Maintenance Subscriptions:** Tiered pricing based on appliance purchase value and age cohort (0-2 years, 2-5 years, 5+ years).
2. **IoT Sensor Kits:** One-time purchase of telemetry nodes (smart plugs & vibration pods) paired with monthly telemetry cloud subscriptions.
3. **On-Demand Dispatch:** Pay-as-you-go service fees for users without active AMC subscriptions.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
