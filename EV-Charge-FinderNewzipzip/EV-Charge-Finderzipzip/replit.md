# ChargeSense - EV Charging Recommendation System

## Overview

ChargeSense is a full-stack, mobile-first EV Charging Recommendation System designed for the Indian EV ecosystem. The application provides intelligent charging station recommendations based on user location, vehicle range, charger compatibility, and real-time availability. The UI follows Ather Energy's clean, minimal, dark design philosophy.

Core features include:
- User authentication with Supabase
- Comprehensive Indian EV vehicle catalog (scooters, bikes, cars)
- GPS-based location detection with range filtering
- Charging station recommendations with compatibility filtering
- Interactive map with Leaflet showing nearby stations
- Charging session simulation and analytics tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side navigation (lightweight alternative to React Router)
- **State Management**: React Context for auth and location state, TanStack React Query for server state
- **Styling**: Tailwind CSS with custom dark theme (Ather-inspired design), Framer Motion for animations
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Maps**: Leaflet for interactive map rendering with custom markers

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Build System**: Custom build script using esbuild for server bundling, Vite for client
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Storage Interface**: Abstracted storage layer in `server/storage.ts` supporting in-memory or database backends
- **Client Data**: Mock data in `client/src/lib/mockData.ts` for vehicles and stations

### Authentication
- **Provider**: Supabase Auth (email/password)
- **Session Management**: Supabase session persistence
- **Context**: AuthContext provides user state throughout the app
- **Fallback**: Graceful degradation when Supabase is not configured

### Key Design Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases (`@/`, `@shared/`, `@assets/`)

2. **Mobile-First Layout**: MobileLayout component with bottom navigation, max-width container for consistent mobile experience

3. **Vehicle-Centric Filtering**: All recommendations depend on selected vehicle's charger compatibility, connector type, and range

4. **Range as Hard Constraint**: Haversine distance calculation filters stations strictly within user-specified radius

5. **Strict Recommendation Pipeline**: Location resolution → Distance calculation → Range filtering → Compatibility filtering → Ranking

## External Dependencies

### Third-Party Services
- **Supabase**: Authentication and potential database (requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- **OpenStreetMap/Nominatim**: Reverse geocoding for location names
- **Google Maps**: Deep-link navigation to charging stations

### Database
- **PostgreSQL**: Required for production (set via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations in `./migrations` directory

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `leaflet` / `react-leaflet`: Map rendering
- `framer-motion`: Animations
- `recharts`: Analytics charts
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express`: HTTP server
- `@supabase/supabase-js`: Authentication client

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_SUPABASE_URL`: Supabase project URL (optional, enables auth)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (optional, enables auth)

## Recent Changes

### December 18, 2025
- **Dataset Expanded**: Updated vehicle catalog from 47 to 103 vehicles using imported Excel dataset
  - 44 cars, 16 bikes, 35 scooters from the new dataset
  - Data sourced from `data.xlsx` with fields: id, brand, model, category, battery_capacity, full_range, charger_type, charge_time_fast, charge_time_normal, cost_per_kWh
- **Supabase Connected**: Configured Supabase authentication with project URL `sdevnxszkmpjeaycegqy.supabase.co`