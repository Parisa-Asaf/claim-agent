# ACRLE — Autonomous Consumer Rights & Legal Recovery Engine
### Module 1: Foundation & Verification
**CSE471 · Group 07 · Lab Section 02 · Spring 2026 · BRAC University**

| ID | Name | Feature |
|----|------|---------|
| 23101270 | Parisa Asaf | F1 — AI Evidence Extraction |
| 22201126 | Raj Rohit Nath | F2 — Evidence Hashing |
| 23101103 | Md. Asif Ahsan Safwan | F3 — Company Intelligence |
| 22301561 | Nusrat Jahan | F4 — Automated Statute Lookup |

---

## Tech Stack
- **Language**: TypeScript
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel

---

## Project Structure

```
acrle/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── extract/route.ts   ← F1: Vision API evidence extraction
│   │   │   ├── hash/route.ts      ← F2: SHA-256 hashing
│   │   │   ├── company/route.ts   ← F3: Google Maps corporate lookup
│   │   │   └── statute/route.ts   ← F4: OpenAI statute matching
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← Main Module 1 page
│   │   └── globals.css
│   ├── components/
│   │   ├── FeatureExtract.tsx     ← F1 UI
│   │   ├── FeatureHash.tsx        ← F2 UI
│   │   ├── FeatureCompany.tsx     ← F3 UI
│   │   └── FeatureStatute.tsx     ← F4 UI
│   ├── lib/
│   │   └── prisma.ts              ← Prisma singleton
│   └── types/
│       └── index.ts               ← Shared TypeScript types
├── prisma/
│   └── schema.prisma              ← DB schema
├── .env.example                   ← Environment variable template
├── package.json
└── README.md
```

---

## Quick Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (local or [Neon](https://neon.tech) / [Supabase](https://supabase.com) free tier)

### 2. Clone & Install
```bash
cd acrle
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/acrle_db"
OPENAI_API_KEY="sk-..."
GOOGLE_VISION_API_KEY="AIza..."
GOOGLE_MAPS_API_KEY="AIza..."
```

### 4. Set Up the Database
```bash
# Create database (if local postgres)
createdb acrle_db

# Push schema & generate Prisma client
npm run db:push

# (Optional) Open visual DB browser
npm run db:studio
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## API Keys — Where to Get Them

### OpenAI API Key (Feature 4 — Required for full functionality)
1. Go to [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key
3. Add billing ($5 credit is enough for development)

### Google Vision API Key (Feature 1)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Enable **Cloud Vision API**
3. Credentials → Create API Key
4. Restrict key to Cloud Vision API

### Google Maps API Key (Feature 3)
1. Same GCP project
2. Enable **Places API** and **Maps JavaScript API**
3. Same API key works (or create separate)

> **Note**: All features have intelligent fallbacks for development — the app works without API keys using realistic demo data.

---

## API Endpoints

### POST `/api/extract`
Extract receipt data using Google Vision API.
```
FormData: { file: File, claimId?: string }
Response: { success, data: { merchantName, transactionDate, amount, currency, confidence* }, evidenceId }
```

### POST `/api/hash`
Generate SHA-256 hash for evidence integrity.
```
FormData: { file: File, claimId?: string, evidenceId?: string }
Response: { success, data: { sha256, algorithm, fileName, fileSize, timestamp, legalStatus }, evidenceId }
```

### GET `/api/hash?hash=<sha256>`
Verify a file hash against stored records.

### GET `/api/company?q=<query>`
Search corporate legal headquarters directory.
```
Response: { success, results: CompanyResult[], source: "database"|"google_maps" }
```

### POST `/api/statute`
Match grievance to applicable consumer protection laws.
```
Body: { grievanceText, grievanceType?, jurisdiction: "BD"|"EU"|"US"|"UK"|"IN"|"INTL", claimId? }
Response: { success, statutes: Statute[], lookupId, model }
```

---

## Database Schema (Module 1)

```
Evidence    — uploaded files with extracted data + SHA-256 hash
Company     — corporate legal headquarters directory
StatuteLookup — AI statute matching results
Claim       — master record linking all Module 1 artifacts
```

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

Use [Neon](https://neon.tech) (free) for PostgreSQL on Vercel.

---

## Development Notes
- All API routes work in **demo/fallback mode** when API keys are not set
- Prisma client is a singleton — no connection pool issues in dev hot-reload
- Company directory is auto-seeded with 15 real companies on first search
- SHA-256 hashing uses Node.js built-in `crypto` — no external dependency

---

## Module 3: Intelligence & Assessment (NEW)

### Feature 3 — Recovery Dashboard & Matrix
**Member: [Member-1]** | Route: `GET /api/dashboard`

A visual command center showing:
- **Total Potential Refund Value** — sum of all claimed amounts in BDT
- **Total Recovered** — verified settlements paid out
- **Recovery Rate** — animated arc gauge (%)
- **Active Claim Countdowns** — sorted by expiration date with priority color-coding
- **Financial Summary** — claimed vs recovered vs pending breakdown

**Seed Bangladesh demo data:**
```
POST /api/seed
```
Inserts 6 realistic BD companies (Grameenphone, bKash, Daraz, BRAC Bank, Robi, Pathao) + claims.

---

### Feature 4 — AI Settlement Assistant
**Member: [Member-1]** | Route: `POST /api/settlement`

Uses GPT-4o to analyze company settlement offers under **Bangladesh consumer law**:
- **Consumer Rights Protection Act 2009 (CRPA)**
- **Contract Act 1872**
- **Digital Security Act 2018**
- **BTRC Regulations**
- **Bangladesh Bank MFS Guidelines**

**Verdict types:** `FAIR` | `UNFAIR` | `PARTIAL` | `INVESTIGATE`

**Request body:**
```json
{
  "companyResponse": "We offer a 60% refund as full settlement...",
  "claimedAmount": 12500,
  "violationType": "Unauthorized Charges",
  "claimId": "optional-uuid",
  "currency": "BDT"
}
```

**Response:** fairness score (0–100), legal explanation citing BD laws, recommended action, 3 comparable BD case outcomes.

Users can then record their decision (`ACCEPTED` / `COUNTERED` / `ESCALATED`) via `PATCH /api/settlement`.

---

### New Database Models

```prisma
model Settlement       # AI analysis + company response + outcome
model ClaimOutcome     # Financial recovery tracking per claim
```

Run after pulling this update:
```bash
npx prisma db push
npx prisma generate
```
