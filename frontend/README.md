# KM100 Inventory System — Frontend Application

Official client-side web application for **KM100 Skills and Training Center, Inc.** built with React 18, TypeScript, Tailwind CSS, Vite, and Supabase client integration.

## 📁 Directory Structure
```
frontend/
├── public/                 # Static assets, branding, and offline vendor bundles
│   ├── standalone/         # Offline standalone bundles
│   ├── favicon.ico
│   ├── favicon.png
│   ├── logo.png
│   └── robots.txt
├── src/                    # TypeScript / React application source
│   ├── components/         # Modular React UI components
│   ├── data/               # Default institutional mock & seed datasets
│   ├── services/           # Supabase inventory service layer
│   ├── types/              # TypeScript contracts and declarations
│   └── utils/              # Excel export/import, auth, and state utilities
├── index.html              # Single page application entry point
├── package.json            # Frontend dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Institutional brand color palette & styles
├── vite.config.ts          # Vite build and dev server config
└── vitest.config.ts        # Vitest test suite configuration
```

## 🚀 Running the Frontend

### Development Server
```bash
npm run dev
```
Runs the Vite development server at `http://localhost:3000`.

### Typecheck & Production Build
```bash
npm run build
```
Compiles TypeScript and creates optimized production artifacts in `frontend/dist/`.

### Run Test Suite
```bash
npm test
```
Runs the Vitest unit tests for Excel, CSV, and inventory utilities.
