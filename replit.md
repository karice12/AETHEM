# AETHEM - AI Prompt Engineering Platform

## Overview
AETHEM is an AI-powered prompt engineering platform that helps users craft elite prompts for LLMs using Google's Gemini AI. It features a subscription model, Firebase authentication, and a neural/cyberpunk-themed UI.

## Tech Stack
- **Frontend:** React 19 + TypeScript, Tailwind CSS 4, Framer Motion, React Router DOM v7
- **Backend:** Express.js (Node.js) with TypeScript
- **AI:** Google Gemini (`@google/genai`)
- **Auth & DB:** Firebase (Auth + Firestore)
- **Payments:** Stripe
- **Build:** Vite 6 + tsx
- **Package Manager:** npm

## Architecture
- Single server (`server.ts`) runs on port 5000, serving both the Express API and Vite dev middleware
- In production: serves the compiled `dist/` folder as static files
- API routes under `/api/gemini/*` (protected by subscription middleware) and `/api/payments/*`

## Project Structure
```
├── server.ts          # Express server + Vite dev middleware (port 5000)
├── vite.config.ts     # Vite config (allowedHosts: true for Replit proxy)
├── src/
│   ├── App.tsx        # Routing and layout
│   ├── main.tsx       # React entry point
│   ├── pages/         # Page components
│   ├── context/       # React contexts (AuthContext)
│   ├── services/      # API service layers
│   └── lib/           # Firebase init, utilities
├── firebase-applet-config.json  # Firebase project config
└── .env.example       # Required environment variables
```

## Required Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)
- `STRIPE_SECRET_KEY` - Stripe secret key (backend)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `APP_URL` - Production app URL (for Stripe redirects)

## Running the App
```
npm run dev   # Development (tsx server.ts on port 5000)
npm run build # Build frontend to dist/
```

## Deployment
- Target: autoscale
- Build: `npm run build`
- Run: `npx tsx server.ts`
- Port: 5000

## Notes
- Stripe initialization is graceful — app runs without Stripe key (checkout features disabled)
- Vite configured with `allowedHosts: true` for Replit proxy compatibility
- Firebase Admin initialized using `firebase-applet-config.json`
