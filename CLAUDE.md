# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FomeZero is a Point of Sale (POS) system with an ASP.NET Core 9.0 backend and Angular 19 frontend. The system manages customers, sales, payments, and provides dashboard analytics. All UI is in Portuguese (Brazil).

## Development Commands

### Backend (from `FomeZero/` directory)
```bash
dotnet run                    # Run API server (port 5106)
dotnet build                  # Build project
dotnet ef database update     # Apply EF Core migrations
```

### Frontend (from `frontend/` directory)
```bash
npm install                   # Install dependencies
ng serve                      # Dev server (port 4207)
ng build                      # Production build
ng test                       # Run unit tests
```

## Architecture

### Backend Structure
```
FomeZero/
├── Controllers/      # API endpoints
├── Services/         # Business logic
├── Repositories/     # Data access layer
├── Interfaces/       # Service & repository contracts
├── Entities/         # Database models (GUID IDs)
├── Data/             # DbContext, migrations, seed data
└── DTOs/             # Data transfer objects
```

**Patterns:**
- Repository pattern with DI
- Async/await throughout
- Validation returns `(Result, Error)` tuples from services
- JWT authentication (8-hour expiration)
- Auto-auditing via SaveChangesAsync override (CreatedAt/UpdatedAt)
- PostgreSQL database

### Frontend Structure
```
frontend/src/app/
├── components/       # Standalone UI components
├── services/         # HTTP services for API calls
├── models/           # TypeScript interfaces
├── guards/           # Route guards (authGuard)
└── interceptors/     # HTTP interceptors (auth token injection)
```

**Patterns:**
- All components use `standalone: true`
- State management with Angular Signals (`signal()`, `computed()`)
- Angular Material for UI
- Lazy-loaded routes
- Inline templates with SCSS

## Key Configuration

- Backend API: `http://localhost:5106/api`
- Frontend dev: `http://localhost:4207`
- Database: PostgreSQL (`fomezero`)
- Default admin: `admin@fomezero.com` / `123456` (auto-created on first run)
- Locale: pt-BR

## Core Business Entities

- **Customer**: Name, WhatsApp, active status, credit tracking
- **Sale**: Multiple items, multiple payment methods, partial payments
- **Snack**: Menu items with prices
- **PaymentMethod**: Cash, PIX, Debit/Credit cards (pre-seeded)
- **User**: Email (unique), BCrypt-hashed passwords

## Authentication Flow

1. POST `/api/auth/login` with email/password
2. JWT token returned and stored in localStorage
3. `authInterceptor` injects Bearer token in requests
4. `authGuard` protects routes, redirects to `/login` if unauthenticated
