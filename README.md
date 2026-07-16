# BusPawa — Full-Stack Transport Management System

A complete fleet, ticketing, parcel, and finance management system designed for Kenyan transport operators, built on a Truehost VPS stack.

## Architecture

```
buspawa/
├── backend/          NestJS API server
├── frontend/         Next.js PWA (web + admin)
├── mobile/           Flutter apps (conductor, booking agent, customer)
├── docker/           Nginx config, SSL certs
├── .github/          CI/CD pipeline
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | NestJS + TypeScript | Robust, modular, Docker-friendly |
| Database | PostgreSQL | Financial-grade data integrity |
| Cache | Redis | Session management, rate limiting |
| Frontend | Next.js (PWA) | Single codebase for admin + customer |
| Mobile | Flutter | Single codebase for conductor, agent, customer |
| Payments | M-Pesa Daraja API | Essential for Kenya |
| SMS | Africa's Talking | Local, reliable |
| Proxy | Nginx + SSL | Reverse proxy, rate limiting |
| Deploy | Docker + GitHub Actions | Automated CI/CD |

## Quick Start

### 1. Clone & configure
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Run with Docker
```bash
docker compose up -d --build
```

### 3. Access
- **API**: http://localhost:3000/api
- **Frontend**: http://localhost:3001
- **Admin panel**: http://localhost (via Nginx)

## Backend API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `GET /api/auth/profile` — Current user
- `GET /api/auth/stations` — List stations

### Tickets
- `POST /api/tickets/book` — Book a ticket
- `GET /api/tickets` — List tickets
- `GET /api/tickets/stats` — Ticketing statistics
- `GET /api/tickets/manifest/:tripId` — Trip manifest
- `PATCH /api/tickets/:ref/check-in` — Check in
- `PATCH /api/tickets/:ref/board` — Mark boarded

### Parcels
- `POST /api/parcels` — Create parcel
- `GET /api/parcels` — List parcels
- `GET /api/parcels/:trackingCode` — Track parcel
- `PATCH /api/parcels/:code/status` — Update status
- `PATCH /api/parcels/:code/assign` — Assign to trip

### Fleet
- `POST /api/fleet/vehicles` — Add vehicle
- `GET /api/fleet/vehicles` — List vehicles
- `POST /api/fleet/trips` — Schedule trip
- `GET /api/fleet/trips` — List trips
- `GET /api/fleet/stats` — Fleet statistics
- `GET /api/fleet/compliance` — Compliance alerts

### Finance
- `POST /api/finance/till/open` — Open till session
- `POST /api/finance/till/:id/items` — Add line item
- `PATCH /api/finance/till/:id/close` — Close session
- `POST /api/finance/deposits` — Submit cash deposit
- `PATCH /api/finance/deposits/:id/verify` — Verify deposit
- `GET /api/finance/summary` — Financial summary

### Employees
- `POST /api/employees` — Add employee
- `GET /api/employees` — List employees
- `GET /api/employees/stats` — HR statistics
- `GET /api/employees/expiring-documents` — Document alerts

## Mobile Apps

Three Flutter apps share a single codebase:

1. **Conductor App** — Trip manifest, passenger boarding, parcel handoff
2. **Booking Agent App** — Ticket sales, M-Pesa collection, till management
3. **Customer App** — Trip search, seat selection, M-Pesa payment

```bash
cd mobile
flutter run
```

## Deployment to Truehost VPS

### Prerequisites
- Truehost VPS with Docker installed
- Domain name pointed to VPS IP
- SSH key pair for GitHub Actions

### Steps
1. Add repository secrets in GitHub:
   - `VPS_HOST` — VPS IP address
   - `VPS_USER` — SSH username (usually `root`)
   - `VPS_SSH_KEY` — Private SSH key

2. Push to `main` branch — CI/CD auto-deploys

3. Generate SSL certificate:
```bash
docker compose exec nginx certbot --nginx -d yourdomain.com
```

### Manual deployment
```bash
ssh root@your-vps-ip
cd /opt/buspawa
git pull
docker compose down
docker compose up -d --build
```

## Environment Variables

See `.env.example` for all configuration. Key variables:
- `DATABASE_PASSWORD` — PostgreSQL password
- `JWT_SECRET` — JWT signing secret
- `MPESA_*` — M-Pesa Daraja API credentials
- `AT_*` — Africa's Talking API credentials

## License

Private — BusPawa Transport Solutions
