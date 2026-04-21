# NGO Synergy Admin Dashboard

A mission-critical humanitarian coordination hub connecting field volunteers to verified crisis reports using AI-powered matching and document digitization.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4.0
- **Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **Notifications**: Sonner
- **Routing**: React Router v6
- **State Management**: React Context + TanStack Query

## Project Structure

```
src/
  api/                  # API service modules
  components/
    layout/            # Sidebar, TopBar, AppLayout
    ui/                # Shadcn-generated components
    shared/            # Reusable widgets
  pages/                # Route pages
  lib/                  # Utilities, constants, mock data
  hooks/                # Custom React hooks
  context/              # React Context providers
  types/                # TypeScript interfaces
  index.css             # Global styles
  App.tsx               # Main app component
  main.tsx              # Entry point
```

## Design System

**Theme**: Mission Control (Dark Mode)

### Colors
- Base: `#0F172A` (Slate 900)
- Surface: `#1E293B` (Slate 800)
- Border: `#334155` (Slate 700)
- Action: `#2563EB` (Blue 600)
- Urgency: `#DC2626` (Red 600)
- Success: `#16A34A` (Green 600)

### Typography
- Display: IBM Plex Mono
- Body: Inter

### Rules
- No emojis
- No rounded-full buttons (use rounded-md)
- Skeleton loaders on all data-fetching components

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Pages

- **Dashboard** (`/dashboard`) - Command Center with heat-map and live incident feed
- **Crisis Reports** (`/crisis`) - All reported incidents
- **Matching Engine** (`/matching`) - Vertex AI volunteer-to-incident matching
- **Volunteer Directory** (`/volunteers`) - Data table of available volunteers
- **Digitization Hub** (`/digitization`) - Document AI processing for field surveys
- **Verification Center** (`/verification`) - Gemini Vision verification of reports
- **Communication Hub** (`/communication`) - Admin-to-volunteer coordination
- **AI Config** (`/ai-config`) - Tune AI matching weights and urgency multipliers

## Authentication

Demo login page at `/login`. Use any email and password to authenticate.

## Mock Data

All components use mock data from `src/lib/mockData.ts`. To integrate with a real backend, update the API service files in `src/api/`.

## Features

- Real-time incident map with heatmap layer
- AI-powered volunteer matching with reasoning explanations
- Document AI integration for field survey digitization
- Gemini Vision verification for community reports
- Human-in-the-loop verification workflows
- Multi-language support (through volunteers)
- Government coordination features

## Future Phases

1. Backend API integration (Node.js/Express)
2. Google Maps API integration
3. Google Vertex AI integration
4. Document AI integration
5. Firebase Cloud Messaging for volunteer notifications
6. Real-time WebSocket updates

## License

Internal Use Only - NGO Synergy
