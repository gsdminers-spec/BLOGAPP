# ASICREPAIR.IN Blog Orchestrator - Technical Context

> **Purpose:** This document serves as the comprehensive "Brain Dump" of the application's intention, architecture, and integration details. Use this context to "feed" LLMs for development or documentation tasks.

---

## 🚀 Project Identity

**App Name:** ASICREPAIR Admin Dashboard
**Primary Goal:** Automate the research, writing, and publishing of high-quality, technical repair guides for ASIC miners (Antminer, Whatsminer, etc.) to drive SEO traffic and repair service leads.
**Core Philosophy:** "The Committee" - Automated agents should mimic a human editorial team (Researcher, Architect, Verifier, Writer), but human oversight is mandatory at key checkpoints.

---

## 🛠️ System Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Service Role for backend ops)
- **Hosting:** Vercel (Admin App), Hostinger (Public Static Site)

### Key Directories
- **`app/`**: Next.js App Router structure.
  - **`api/`**: Server-side logic (Research, Publishing, Cron).
  - **`components/`**: Reusable UI (BlogTree, ResearchWorkspace).
- **`lib/ai/`**: The "Brain" of the operation. Contains AI agent logic.
- **`lib/supabase.ts`**: Types and Client initialization.

---

## 🧠 The AI Engine: "The Committee"

The application uses a sophisticated multi-step AI pipeline to ensure content quality.

### 1. Research Phase (`/api/research` -> `action: 'research'`)
*   **Goal:** Gather raw, high-signal technical data.
*   **Providers:** Tavily (General + Reddit/StackOverflow), Serper (Google).
*   **Logic ("Smart Feed"):**
    - Executes parallel searches.
    - Filters results for quality (length, domain authority).
    - Boosts high-signal domains: `reddit.com`, `bitcointalk.org`, `zeusbtc.com`.
    - **Output:** A "Structured Raw Feed" (Markdown) of top 15 sources. Explicitly bypasses summarization to preserve technical nuance for the writer.

### 2. Drafting Phase (`/api/research` -> `action: 'draft'`)
*   **Goal:** Turn raw data into a published-ready article.
*   **The Committee (`lib/ai/committee.ts`):**
    1.  **The SEO Architect (Groq - Llama 3.3)**: Analyzes research and creates a structured H1/H2/H3 outline with keyword targeting.
    2.  **The Fact Verifier (OpenRouter - Chimera R1)**: Cross-checks the outline against the research feed. (Soft-fail: Logs warnings but allows generation to proceed).
    3.  **The Writer (Groq - Llama 3.3)**: Generates the 2000+ word article using a "Repair Technician" persona. 
        - *Fallback:* Downgrades to Llama 3.1 8b if the 70b model fails/times out.
    4.  **The Safety Net (Gemini)**: `lib/ai/openrouter.ts` contains a "Council" logic that falls back to Gemini 2.0 Flash if other providers fail (used in broader generation tasks).

---

## 🔄 The Publishing Workflow

### 1. The Pipeline
1.  **Blog Tree**: Topics are organized by Phase > Category > Subcategory.
2.  **Research**: User triggers research or manually inputs data.
3.  **Generation**: The Committee generates content.
4.  **Articles DB**: Drafts are saved to Supabase `articles` table.
5.  **Publish Queue**: Articles are moved to `publish_queue` with a scheduled date/time.

### 2. Deployment (`app/api/publish/route.ts`)
When "Publish Now" is clicked or the schedule hits:
1.  **Status Sync**: Updates `articles` and `publish_queue` tables in Supabase.
2.  **Public Sync**: Upserts the content to the public-facing `blog_articles` table.
    - **Markdown Transformation**: Converts Markdown to HTML using `marked` before storage, ensuring consistent rendering on the static site.
3.  **Trigger Rebuild**:
    - Calls **GitHub Actions API** (`deploy.yml`).
    - Triggers a Repository Dispatch event.
    - GitHub Action rebuilds the static Next.js website and deploys it (likely via FTP/SFTP to Hostinger) to reflect the new content live.

---

## 🗄️ Database Schema Summary

- **`phases`, `categories`, `subcategories`, `topics`**: Hierarchical content organization.
- **`articles`**: Internal drafts/completed articles.
- **`publish_queue`**: Scheduling queue.
- **`blog_articles`**: Public-facing table (synced from `articles`).
- **`keywords`**: SEO keyword tracking.

---

## 📍 Integration Points

- **Tavily / Serper**: External Search APIs.
- **Groq API**: Primary LLM inference (Llama 3.3).
- **OpenRouter API**: Specialized reasoning models (DeepSeek/Chimera).
- **Google Gemini API**: Fallback/Safety net model.
- **GitHub API**: Triggering deployments.
- **Supabase**: Central data store and auth provider.
