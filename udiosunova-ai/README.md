# SOUNDNOVA AI 🌌
> **Your AI music, restored and ready to export.**
> An advanced, premium AI Audio Studio platform designed for sound engineers, producers, and AI music creators to import public streams, preserve metadata, convert formats, and organize collections in one dark-blue, neon-lit professional studio environment.

---

## 🎨 Visual & Aesthetic Pairings
- **Dark Slate Backgrounds**: Styled using rich gray-blacks (`#030712`) and deep ocean blues (`#071426`).
- **Neon Cyan Flares**: Responsive interactive borders and playhead indicators utilizing high-contrast glowing hues (`#38BDF8`).
- **Glassmorphism Design**: Frosted glass panels layered with subtle dark borders (`rgba(56, 189, 248, 0.25)`) and micro-shadows.
- **Precision Waveforms**: Fully interactive, canvas-based visual waveforms with real-time seek capability, elapsed/total timers, and fluid playhead tracking.

---

## 🏗️ Folder Architecture (Monorepo Blueprint)

The platform is architected for maximum scale and modular deployment:

```text
soundnova-ai/
  apps/
    web/                   # Next.js 14 / React Frontend Portal
      app/                 # Layouts, Page routes
      components/          # WaveformPlayer, MetadataPanel, LegalViews
      lib/                 # Api fetch managers, state hooks
      styles/              # Tailwind CSS global styles
    api/                   # Express + tsx RESTful API Service
      src/
        routes/            # API endpoints & controllers
        controllers/       # Import, Upload, Download managers
        services/          # Signed URLs, FFmpeg transcoders
        workers/           # Job queue processors
        queues/            # BullMQ handlers
  packages/
    database/
      prisma/
        schema.prisma      # DB definitions and relations
    shared/
      types/               # Declared enums and model interfaces
  storage/                 # Temp cache mounts
  docker-compose.yml       # Docker deployment profiles
  soundnova_db.json        # Persistent JSON local file database
```

---

## 🗄️ Database Schemas (Prisma Definition)

The database layers are fully compatible with any relational DBMS (PostgreSQL) via Prisma ORM.

### Enums
- **`Plan`**: `FREE`, `PLUS`, `PRO`
- **`AudioStatus`**: `PENDING`, `PROCESSING`, `COMPLETE`, `FAILED`
- **`AudioJobType`**: `IMPORT`, `CONVERT`, `MASTER`, `STEMS`, `RESTORE`, `WAVEFORM`
- **`AudioJobStatus`**: `QUEUED`, `PROCESSING`, `COMPLETE`, `FAILED`
- **`Visibility`**: `PRIVATE`, `PUBLIC`

### Prisma Models
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  image     String?
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AudioAsset {
  id              String      @id @default(uuid())
  userId          String
  title           String
  artist          String
  coverUrl        String
  sourceUrl       String
  sourcePlatform  String
  duration        Float
  originalFileUrl String
  mp3FileUrl      String
  wavFileUrl      String
  flacFileUrl     String
  waveformJsonUrl String
  status          AudioStatus @default(PENDING)
  visibility      Visibility  @default(PUBLIC)
  errorMessage    String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  expiresAt       DateTime?
}

model AudioJob {
  id           String         @id @default(uuid())
  audioAssetId String
  type         AudioJobType
  status       AudioJobStatus @default(QUEUED)
  progress     Int            @default(0)
  message      String?
  errorMessage String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model DownloadLog {
  id           String   @id @default(uuid())
  userId       String
  audioAssetId String
  format       String
  ipAddress    String
  userAgent    String
  createdAt    DateTime @default(now())
}

model AbuseLog {
  id        String   @id @default(uuid())
  userId    String
  ipAddress String
  reason    String
  sourceUrl String
  createdAt DateTime @default(now())
}
```

---

## 🔒 Security & Anti-Abuse Implementations
1. **SSRF and Protocol Sanity**:
   - Strictly blocks requests targeting `localhost`, loopbacks `127.0.0.1`, link-local `169.254.x.x`, and private subnets (`10.x.x.x`, `192.168.x.x`, `172.16.x.x`).
   - Rejects non-web protocols like `ftp://`, `file://`, and `gopher://`.
2. **Download Abuse Rate-Limiter**:
   - Implements transactional download history trackers mapped to client IPs.
   - Throttles download rates if a user triggers more than 5 high-fidelity downloads per minute, logging infraction entries in `AbuseLog` to deter scripts.
3. **MIME & Upload Restrictions**:
   - Enforces standard file extensions and audio MIME types.
   - Enforces hard capacity cutoffs per user tier (Free: 50MB, Plus: 250MB, Pro: 1GB).

---

## 🛠️ Instructions for Running Locally

To experience SoundNova AI in your local dev environment:

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Steps
1. Clone your project workspace files.
2. In the root directory, install all required dependencies:
   ```bash
   npm install
   ```
3. Start the Express backend + Vite client dev server concurrently on port 3000:
   ```bash
   npm run dev
   ```
4. Access the web platform at `http://localhost:3000`.

---

## 🚀 Guidelines for Cloud Deployment

### 1. Frontend Client (Vercel)
- Set up a new project on Vercel pointing to the `soundnova-ai/apps/web` folder or repository root.
- Ensure the Build Command is configured to use the root `npm run build` command.
- Set up the environment variable `NEXT_PUBLIC_APP_URL` matching your Vercel URL.

### 2. Express Server (Railway / Render / Cloud Run)
- Provision a Node.js container service on Railway or Render.
- Configure the environment variables specified in `.env.example`, mapping your `DATABASE_URL` (pointing to a PostgreSQL node) and `REDIS_URL`.
- Port binding must be set to `3000` (Render/Railway binds `$PORT` automatically).

### 3. File Storage (Cloudflare R2 or AWS S3)
- Provision a bucket in Cloudflare R2 or AWS S3.
- Map the keys (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET`) to the Express container environment.
- Point `R2_PUBLIC_URL` to your custom assets subdomain (e.g., `https://cdn.soundnova.ai`) to serve processed files directly.

---

## ⚖️ Legal Policy Disclaimer
*SOUNDNOVA AI is not affiliated with Udio, Suno, Neural Analog or any mentioned platform. All trademarks belong to their respective owners. Users are responsible for ensuring they have the rights to import, upload, process and download any content.*
