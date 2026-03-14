# FluxCred (by team Spartans)

AGENTIC ESCROW is a high-performance, autonomous quality assurance and virtual escrow protocol. It automates trust in the gig economy by using AI agents to verify deliverables and trigger instant payouts the millisecond the "Definition of Done" is met.

## Key Features

- **Autonomous Quality Assurance (AQA)**: AI-driven verification of milestones using Google Gemini, eliminating manual review bottlenecks.
- **Milestone Engine**: Algorithmic conversion of high-level project goals into detailed, manageable milestones with cryptographic precision.
- **Virtual Escrow Protocol**: Automated fund locking and release based on real-time AQA validation.
- **Professional Fidelity Index (PFI)**: On-chain reputation tracking that creates a trustless meritocracy for freelancers and employers.
- **Command Center HUD**: A futuristic, terminal-inspired dashboard with real-time telemetry and system status monitoring.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: PostgreSQL with Prisma ORM 6.x
- **Authentication**: Clerk (Managed Auth & Role-based Access)
- **Artificial Intelligence**: Google Gemini (via `@google/genai`)
- **Graphics**: Three.js + React Three Fiber (for immersive 3D elements)
- **Deployment**: Netlify / Vercel

## Prerequisites

- **Node.js**: v20 or higher
- **PostgreSQL**: Local instance or hosted connection string
- **API Keys**:
  - [Clerk API Keys](https://clerk.com)
  - [Google Gemini API Key](https://aistudio.google.com/)

## Getting Started

### 1. Clone the Protocol
```bash
git clone https://github.com/Aarav-bit/BitByBit.git
cd BitByBit
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key (Required for AQA) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Initialization
```bash
npx prisma generate
npx prisma db push
```

### 5. Launch Protocol
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the uplink node.

## Architecture Overview

### Core Modules
- `app/api/`: Autonomous route handlers for project generation, jointing, and submission.
- `components/`: UI layer containing the futuristic HUD, Project Terminal, and Registry cards.
- `lib/`: Core logic including AQA evaluation, PFI scoring, and database singleton pattern.
- `prisma/`: Database schema and migration tracking.

### Request Lifecycle (AQA Flow)
1. **Freelancer Submission**: Work content is posted to `/api/milestones/submit`.
2. **AI Evaluation**: The AQA engine (Gemini) compares content against the milestone's *Definition of Done*.
3. **Verdict Generation**: A structured PASS/FAIL result is returned with detailed feedback.
4. **Instant Settlement**: If PASS, the virtual escrow releases funds to the freelancer and boosts their PFI score.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server with hot-reload |
| `npm run build` | Generates Prisma client and builds for production |
| `npm run start` | Starts the production server |
| `npx tsx scripts/seed-projects.ts` | Seeds the database with demo protocol nodes |

## Troubleshooting

- **Gemini Failures**: If `GEMINI_API_KEY` is missing, the system uses a mock fallback for development. For full AQA features, ensure a valid key is provided.
- **Database Connection**: Ensure your PostgreSQL instance is running and the `DATABASE_URL` matches your local credentials.
- **Clerk Auth**: If redirected to the login page repeatedly, verify your Clerk publishable keys and environment variable prefixing.

## License
FLUXCRED PROTOCOL // VER-0.1.0-ALPHA // AGENTIC ESCROW LAYER
