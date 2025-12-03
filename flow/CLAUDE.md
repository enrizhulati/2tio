# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

2TurnItOn (2TIO) is a utility setup flow that helps users set up water, electricity, and internet services when moving to a new address. It's a Next.js 14 application deployed to Netlify serving Texas addresses.

## Commands

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run dev -- -p 3001   # Start on specific port

# Build & Deploy
npm run build            # Build for production
npm run lint             # Run ESLint

# Testing (Playwright)
npm run test             # Run all tests
npm run test:ui          # Run tests with UI
npm run test:headed      # Run tests in headed mode
npx playwright test flow.spec.ts --project=Desktop  # Run single test file
```

## Architecture

### 5-Step Flow
1. **Step1Address** - Address entry with ERCOT autocomplete, date picker, ESIID selection for electricity
2. **Step2Profile** - User profile collection (name, email, phone)
3. **Step3Services** - Service selection (water required, electricity/internet optional) with plan picker
4. **Step4Verify** - Identity verification with SSN, DOB, document uploads
5. **Step5Review** - Order confirmation and submission

### State Management
Single Zustand store (`src/store/flowStore.ts`) manages all flow state:
- Address/move-in date, ESIID matches
- User profile
- Service selections and plans
- Cart state (synced with 2TIO API)
- Checkout steps and answers

### API Integration (`src/lib/api/twotion.ts`)
- **2TIO Consumer API**: Plans, cart, checkout, order submission
- **ERCOT API**: Address autocomplete (ESIID lookup), usage profiles with Zillow home data
- Plans are enriched with annual cost calculations based on usage profiles

### Key Types (`src/types/flow.ts`)
- `FlowState` - Complete store interface with all state and actions
- `ServicePlan` - Plan data with provider info, pricing, features
- `ESIID` - Electric Service Identifier for Texas addresses
- `TwotionCheckoutStep` - Dynamic checkout questions from API

## Design System

Uses Practical UI guidelines. Reference `/practical-ui/references/` for detailed guidance.

### Brand Colors (Tailwind + CSS variables)
- **coral** `#FF6F61` - Primary accent
- **teal** `#20C997` - Success/CTA
- Neutrals: darkest, dark, medium, light, lightest

### Spacing (8pt base)
XS=8, S=16, M=24, L=32, XL=48, XXL=80

### Typography Scale
H1=44px, H2=35px, H3=28px, H4=22px, Body=18px, Small=16px

## Component Organization
- `src/components/flow/` - Step components (Step1-5, FlowLayout)
- `src/components/ui/` - Reusable UI components (Button, RadioGroup, UsageChart, etc.)

## Testing
Playwright tests in `e2e/` directory test against `http://127.0.0.1:3001`. Tests run with webServer that auto-starts the dev server.
