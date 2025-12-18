# ChargeSense - EV Charging Recommendation System

## Overview

ChargeSense is a full-stack, mobile-first EV Charging Recommendation System designed for the Indian EV ecosystem. The application helps users find compatible charging stations based on their vehicle type, location, and range preferences.

Core features include:
- User authentication with Supabase
- Comprehensive Indian EV vehicle catalog (95+ scooters, bikes, cars)
- GPS-based location detection with range filtering
- Charging station recommendations with compatibility filtering
- Interactive map with Leaflet showing nearby stations
- Charging session simulation with wallet payments
- Analytics tracking for charging history
- **NEW: Dynamic landing page** with Ather-style animations and transitions
- **NEW: Wallet system** with UPI payment integration (Google Pay, PhonePe, Paytm)
- **NEW: Brand-specific filtering** (Ather Grid stations only for Ather vehicles)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side navigation (lightweight alternative to React Router)
- **State Management**: React Context for auth, location, and wallet state; TanStack React Query for server state
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

2. **Vehicle-First Flow**: Selected vehicle controls charger compatibility, charging speed estimates, and station filtering - changing vehicle immediately recomputes all results

3. **Range as Hard Constraint**: User-specified range (km) strictly filters stations - out-of-range stations never appear in lists or on map

4. **Haversine Distance Calculation**: All station distances calculated from user's GPS location using Haversine formula

5. **Connector Compatibility Logic**: Cars can charge at stations with matching connector types (CCS2/Type 2); brand-specific stations (like Ather Grid) only available for matching vehicle brands

6. **Wallet-First Payments**: Users can add funds via UPI (Google Pay, PhonePe, Paytm) and pay for charging directly from the app. Payment modal after charging session with "Pay at Counter" fallback option.

7. **Dynamic Landing Page**: New home page with animated feature carousel, stats display, and Ather-inspired gradient design. Old vehicle dashboard moved to "My Vehicle" section.

## App Navigation
- `/` - Login page
- `/home` - Dynamic landing page with app features
- `/my-vehicle` - Vehicle dashboard with battery status and range settings
- `/recommendations` - Nearby charger recommendations
- `/wallet` - Wallet management with UPI payments
- `/session` - Active charging session with live stats
- `/map` - Interactive map view
- `/profile` - User profile

## External Dependencies

### Authentication & Database
- **Supabase**: Authentication (email/password) and potential PostgreSQL backend
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Mapping Services
- **Leaflet**: Interactive map rendering with OpenStreetMap tiles
- **Nominatim**: Reverse geocoding for location names (free OpenStreetMap service)

### Database
- **PostgreSQL**: Primary database via Drizzle ORM
- Environment variable: `DATABASE_URL`

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `leaflet` / `react-leaflet`: Map components
- `framer-motion`: Animations
- `recharts`: Analytics charts
- `wouter`: Client-side routing