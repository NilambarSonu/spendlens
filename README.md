# SpendLens — AI Spend Audit Tool

Free web app that audits startup AI tool subscriptions and surfaces overspending. Built as a lead-generation asset for [Credex](https://credex.rocks) — a marketplace for discounted AI infrastructure credits.

**Who it's for:** Startup founders and engineering managers paying $200+/month across AI tools who have no way to benchmark their spend.

🚀 **Live:** https://spendlens.nilambarsonu.me
## Features

- **Interactive Multi-Tool Audit Form**: Add/remove multiple tools, configure seat count, monthly spend, and plans.
- **Deterministic Savings Audit Engine**: Programmatic analysis highlighting specific, actionable plan downgrades and tool switches.
- **AI Summary Synthesis**: Live summarized breakdown generated directly by the **Google Gemini API (`gemini-2.5-flash`)**.
- **Custom Session Auth**: Secure authentication engine backed by PBKDF2 hashing, JWT token verification, and session state tracking on Neon DB.
- **Lead Capture Mechanism**: Captures target business data (emails, company name, role) for high-savings users and schedules transactional emails.
- **Luxury Preloader**: A gorgeous 3.8s visual scanner animation welcoming users with high-fidelity glow effects and real-time execution logs.
- **Dynamic Link Previews (OG Meta)**: Dynamically generates Open Graph tags for shareable custom audit pages (`/audit/[id]`).

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components (Vanilla CSS theme palette configuration)
- **Database**: Neon DB (PostgreSQL) — stored audits, users, and captured leads
- **Email**: Resend — transactional email automation for captured leads
- **AI Summary**: Google Gemini API (`gemini-2.5-flash` model via Google AI Studio)
- **Testing**: Vitest — comprehensive unit and integration testing suite
- **CI**: GitHub Actions — automated test validation and typechecks

## Quick Start

```bash
git clone https://github.com/NilambarSonu/spendlens
cd spendlens
npm install
cp .env.example .env
# Fill in .env with your production keys
npm run dev
```

## Environment Variables

Configure these variables inside `.env`:

```env
# Neon PostgreSQL
DATABASE_URL="your_neon_postgres_connection_string"

# Google Gemini
GEMINI_API_KEY="your_google_ai_studio_api_key"

# Resend
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Running Tests

Verify code accuracy using Vitest:

```bash
npm run test
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NilambarSonu/spendlens)

Ensure you set all required environment variables within your Vercel Dashboard dashboard.
