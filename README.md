<p align="center">
  <img src="public/icon.svg" alt="Insight-Out Logo" width="60" />
</p>

<h1 align="center">Insight-Out</h1>

<p align="center">
  <strong>AI-Powered Feedback Categorization & Sentiment Analysis Platform</strong>
</p>

<p align="center">
  Transform unstructured customer feedback into actionable insights — automatically.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#database-schema">Database Schema</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Overview

**Insight-Out** is a full-stack SaaS platform that helps product teams make sense of customer feedback at scale. Upload thousands of feedback entries via CSV, and let AI automatically categorize, analyze sentiment, extract keywords, and generate actionable summaries — all from a beautiful, interactive dashboard.

---

## Features

### 🤖 AI-Powered Categorization
Feedback is automatically classified into meaningful categories:
`Bug` · `Feature Request` · `Performance` · `UI/UX` · `Positive Feedback` · `Pricing` · `Support` · `Praise` · `Other`

### 😊 Sentiment Analysis
Every piece of feedback is scored as **Positive**, **Neutral**, or **Negative** to help you gauge overall customer mood.

### 📤 Bulk CSV Upload
Upload thousands of feedback entries at once. The system processes them in bulk with AI categorization and sentiment analysis applied automatically.

### 📊 Powerful Analytics Dashboard
Interactive charts and visualizations for:
- Category distribution breakdowns
- Sentiment trend analysis
- Keyword frequency tracking
- Feedback volume over time

### 📝 AI-Generated Summaries
Generate concise, AI-powered summaries from large volumes of feedback to quickly understand the big picture.

### 📥 CSV Export
Export your categorized and analyzed data to CSV for external reporting or deeper integrations.

### 👥 Multi-Tenant Team Management
- **Organization-based** isolation — each team sees only their own data
- **Role-Based Access Control**: `Admin` · `Manager` · `Member`
- **Team invitations** via email with secure, expiring invite tokens

### 🔐 Authentication & Security
- Credentials-based auth via **NextAuth.js** (JWT strategy)
- OTP-based email verification
- Password reset flow with secure OTP
- Session versioning for forced logout on password change
- **Rate limiting** via Upstash Redis

---

## Tech Stack

| Layer           | Technology                                                                 |
|-----------------|----------------------------------------------------------------------------|
| **Framework**   | [Next.js 16](https://nextjs.org/) (App Router)                            |
| **Language**    | [TypeScript](https://www.typescriptlang.org/)                              |
| **Styling**     | [Tailwind CSS v4](https://tailwindcss.com/)                                |
| **Database**    | [PostgreSQL](https://www.postgresql.org/) (Neon)                           |
| **ORM**         | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`              |
| **Auth**        | [NextAuth.js v4](https://next-auth.js.org/) (Credentials + JWT)           |
| **AI / LLM**    | [Google Gemini](https://ai.google.dev/) + [Groq](https://groq.com/)       |
| **State Mgmt**  | [Zustand](https://zustand-demo.pmnd.rs/)                                  |
| **Rate Limit**  | [Upstash Redis](https://upstash.com/)                                      |
| **Validation**  | [Zod](https://zod.dev/)                                                    |
| **Email**       | [Nodemailer](https://nodemailer.com/)                                      |
| **Fonts**       | Geist Sans & Geist Mono (via `next/font`)                                  |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or your preferred package manager)
- **PostgreSQL** database (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or local)

### 1. Clone the Repository

```bash
git clone https://github.com/mohdhassaan07/Insight-Out.git
cd Insight-Out
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI APIs
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Email (Nodemailer)
EMAIL="your-email@gmail.com"
APP_PASSWORD="your-app-password"

# Cloudinary (Profile Pictures)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
insight-out/
├── prisma/
│   ├── schema.prisma           # Database schema & models
│   └── migrations/             # Prisma migration history
├── public/                     # Static assets (icons, SVGs)
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth pages (sign in, sign up, forgot password)
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   ├── signout/
│   │   │   └── forgot-password/
│   │   ├── accept-invite/      # Invite acceptance flow
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth API route
│   │   │   └── v1/             # Versioned REST API
│   │   │       ├── feedbacks/          # CRUD for feedback entries
│   │   │       ├── fetchAllFeedbacks/  # Paginated feedback listing
│   │   │       ├── upload-csv/         # Bulk CSV upload & processing
│   │   │       ├── export-csv/         # CSV export
│   │   │       ├── getCategory/        # Category stats
│   │   │       ├── updateCategory/     # Category updates
│   │   │       ├── approveStatus/      # Feedback status approval
│   │   │       ├── generate-summary/   # AI summary generation
│   │   │       ├── team/               # Team & invite management
│   │   │       ├── me/                 # Current user profile
│   │   │       ├── updateProfile/      # Profile updates
│   │   │       ├── upadatePassword/    # Password changes
│   │   │       ├── deleteAccount/      # Account deletion
│   │   │       ├── send-otp/           # OTP delivery
│   │   │       ├── verifyOtp/          # OTP verification
│   │   │       └── forgot-password/    # Password reset
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Main dashboard (overview)
│   │   │   ├── analytics/      # Analytics & charts
│   │   │   ├── feedbacks/      # Feedback management
│   │   │   ├── upload/         # Upload page
│   │   │   └── settings/       # User & org settings
│   │   ├── generated/          # Prisma generated client
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── layout/             # Navbar, Sidebar, DashboardLayout
│   │   ├── providers/          # AuthProvider, ToastProvider
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── roles.ts            # RBAC helpers (requireSession, requireRole)
│   │   ├── rateLimiter.ts      # Upstash rate limiter
│   │   ├── invites.ts          # Invite token utilities
│   │   └── otp.ts              # OTP generation & verification
│   ├── store/
│   │   └── feedbackStore.ts    # Zustand store for feedback state
│   ├── types/
│   │   └── next-auth.d.ts      # NextAuth type extensions
│   └── proxy.ts                # Proxy utilities
├── .env                        # Environment variables (git-ignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── prisma.config.ts
```

---

## API Reference

All API routes are prefixed with `/api/v1/`.

| Method   | Endpoint               | Description                           | Auth Required |
|----------|------------------------|---------------------------------------|:------------:|
| `POST`   | `/feedbacks`           | Create a new feedback entry           | ✅           |
| `GET`    | `/fetchAllFeedbacks`   | List feedbacks (paginated/filtered)   | ✅           |
| `POST`   | `/upload-csv`          | Bulk upload feedback via CSV          | ✅           |
| `GET`    | `/export-csv`          | Export feedbacks as CSV               | ✅           |
| `GET`    | `/getCategory`         | Get category statistics               | ✅           |
| `PATCH`  | `/updateCategory`      | Update feedback category              | ✅           |
| `PATCH`  | `/approveStatus`       | Approve/update feedback status        | ✅           |
| `POST`   | `/generate-summary`    | Generate AI summary of feedbacks      | ✅           |
| `GET`    | `/me`                  | Get current user profile              | ✅           |
| `PATCH`  | `/updateProfile`       | Update user profile                   | ✅           |
| `PATCH`  | `/upadatePassword`     | Change password                       | ✅           |
| `DELETE` | `/deleteAccount`       | Delete user account                   | ✅           |
| `POST`   | `/send-otp`            | Send OTP to email                     | ❌           |
| `POST`   | `/verifyOtp`           | Verify OTP code                       | ❌           |
| `POST`   | `/forgot-password`     | Reset password via OTP                | ❌           |
| `GET`    | `/team`                | List team members & invites           | ✅ (Admin)   |
| `POST`   | `/team`                | Send team invite                      | ✅ (Admin)   |

---

## Database Schema

The application uses **PostgreSQL** with **Prisma ORM**. Here's an overview of the core models:

```mermaid
erDiagram
    Organization ||--o{ User : "has many"
    Organization ||--o{ Feedback : "has many"
    Organization ||--o{ CsvUpload : "has many"
    Organization ||--o{ Keyword : "has many"
    Organization ||--o{ OrganizationInvite : "has many"
    User ||--o{ OrganizationInvite : "invited by"

    Organization {
        String id PK
        String name
        Plan plan
        DateTime createdAt
        Int totalCSVUploads
    }

    User {
        String id PK
        String name
        String email UK
        String password
        Role role
        String organizationId FK
        String profilePic
        Int sessionVersion
    }

    Feedback {
        String id PK
        String feedback_text
        Categories primary_category
        Float confidence
        Sentiments sentiment
        String source
        Status status
        String organizationId FK
    }

    Keyword {
        String id PK
        String name
        Int count
        String organizationId FK
    }

    CsvUpload {
        String id PK
        String organizationId FK
        DateTime createdAt
    }

    OrganizationInvite {
        String id PK
        String email
        Role role
        String tokenHash UK
        DateTime expiresAt
    }
```

### Enums

| Enum           | Values                                                                                              |
|----------------|-----------------------------------------------------------------------------------------------------|
| `Plan`         | `Free` · `Pro` · `Premium`                                                                         |
| `Role`         | `Admin` · `Manager` · `Member`                                                                     |
| `Status`       | `auto_approved` · `self_approved`                                                                   |
| `Categories`   | `Bug` · `Feature_Request` · `Performance` · `UI_UX` · `Positive_Feedback` · `Pricing` · `Support` · `Praise` · `Other` |
| `Sentiments`   | `Positive` · `Neutral` · `Negative`                                                                 |

---

## How It Works

```
┌──────────────┐     CSV Upload      ┌──────────────────┐
│              │ ──────────────────▶  │                  │
│    User      │                      │   Next.js API    │
│  Dashboard   │ ◀──────────────────  │   (App Router)   │
│              │   Categorized Data   │                  │
└──────────────┘                      └────────┬─────────┘
                                               │
                                    ┌──────────▼─────────┐
                                    │                    │
                                    │  AI Engine          │
                                    │  (Gemini / Groq)   │
                                    │                    │
                                    │  • Categorization  │
                                    │  • Sentiment       │
                                    │  • Keywords        │
                                    │  • Summaries       │
                                    │                    │
                                    └──────────┬─────────┘
                                               │
                                    ┌──────────▼─────────┐
                                    │                    │
                                    │   PostgreSQL       │
                                    │   (via Prisma)     │
                                    │                    │
                                    └────────────────────┘
```

1. **Upload** — Users upload feedback via CSV or submit individual entries
2. **Process** — The AI engine (Gemini / Groq) categorizes each entry and performs sentiment analysis
3. **Store** — Results are persisted in PostgreSQL with full organization-level isolation
4. **Analyze** — The dashboard provides real-time analytics, charts, and AI-generated summaries
5. **Export** — Users can export processed data as CSV for external use

---

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start development server             |
| `npm run build`   | Build for production                 |
| `npm run start`   | Start production server              |
| `npm run lint`    | Run ESLint                           |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code passes linting and builds successfully before submitting.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/mohdhassaan07">Mohd Hassaan</a>
</p>