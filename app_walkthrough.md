+# 🚀 ASICREPAIR.IN Blog Admin App — Complete Walkthrough

## App Overview

An internal blog administration system for generating and publishing ASIC miner repair articles. The app follows a structured pipeline from topic selection to final publication.

---

## 📋 Menu Structure (8 Items)

| # | Icon | Page | Purpose |
|---|------|------|---------|
| 1 | 🏠 | Dashboard | Stats, quick actions |
| 2 | 🌳 | Blog Tree | Content roadmap (4 phases) |
| 3 | 🔬 | Research | Web scraping + AI research |
| 4 | ✨ | Generate Prompt | Gemini creates Claude prompt |
| 5 | 📋 | Claude Output | Paste & save Claude articles |
| 6 | 📝 | Articles | View completed articles |
| 7 | 🚀 | Publish | Schedule & push to website |
| 8 | 🔑 | Keywords | Keyword approval system |
| 🚪 | Logout | Clear session |

---

## 🔄 Complete Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Blog Tree   │────▶│   Research   │────▶│  Generate Prompt │
│              │     │              │     │                  │
│ • 4 Phases   │     │ • Search bar │     │ • Gemini AI      │
│ • Drill down │     │ • Web scrape │     │ • Copy prompt    │
│ • Send topic │     │ • AI summary │     │ • Manual Claude  │
└──────────────┘     └──────────────┘     └──────────────────┘
                                                   │
                                                   ▼ (Manual: Claude)
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Publish    │◀────│   Articles   │◀────│  Claude Output   │
│              │     │              │     │                  │
│ • Scheduler  │     │ • View list  │     │ • Select title   │
│ • Timer      │     │ • Preview    │     │ • Paste article  │
│ • Supabase   │     │ • Copy       │     │ • Add to list    │
└──────────────┘     └──────────────┘     └──────────────────┘
```

---

## 📱 Page Specifications

### 1. 🏠 Dashboard
**Location:** Inline in `app/page.tsx`
**Data Layer:** `lib/supabase.ts` (`getDashboardStats()`)

| Element | Details |
|---------|---------|
| **Stats Cards** | Articles created, Pending topics, Ready to publish, Published |
| **Recent Activity** | Latest actions taken |
| **Quick Links** | Jump to Blog Tree, Research |
| **Data Source** | Supabase tables, real-time |

---

### 2. 🌳 Blog Tree
**Component:** `app/components/BlogTree.tsx`

#### Main Page (4 Phase Cards)

```
┌─────────────────────┐  ┌─────────────────────┐
│ 📁 PHASE 1          │  │ 📁 PHASE 2          │
│ Hashboard Not       │  │ Repair Insights     │
│ Detected            │  │ & Case Studies      │
│                     │  │                     │
│ 80 Articles         │  │ 30 Articles         │
│ 3 Categories        │  │ 3 Categories        │
│ 8 Sub-categories    │  │ -                   │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ 📁 PHASE 3          │  │ 📁 PHASE 4          │
│ Seasonal &          │  │ Repair Decisions    │
│ Environmental       │  │ & Operations        │
│                     │  │                     │
│ 10 Articles         │  │ 10 Articles         │
│ -                   │  │ -                   │
└─────────────────────┘  └─────────────────────┘

☰ Menu: Add Phase | Rename Phase | Delete Phase
```

#### Phase Detail Page (Categories)

Click Phase 1 → Shows:
```
📁 PHASE 1: Hashboard Not Detected

├── ⚡ ANTMINER (20 articles) → Click to expand
├── ⚡ WHATSMINER (15 articles) → Click to expand  
└── ⚡ AVALON (5 articles) → Click to expand

Actions: Add Category | Rename | Delete
```

#### Category Page (Sub-categories)

Click ANTMINER → Shows:
```
⚡ ANTMINER

├── 📂 S-Series (9 articles)
├── 📂 T-Series (2 articles)
├── 📂 L-Series (3 articles)
├── 📂 K-Series (2 articles)
├── 📂 D-Series (2 articles)
├── 📂 E-Series (1 article)
└── 📂 General (1 article)

Actions: Add Sub-category | Rename | Delete
```

#### Sub-category Page (Topics)

Click S-Series → Shows:
```
📂 S-Series (SHA-256 Bitcoin Miners)

| # | Topic Title | Status | Actions |
|---|-------------|--------|---------|
| 1 | Antminer S21 Pro Hashboard Not Detected | Pending | 📤 Send to Research |
| 2 | Antminer S21 Hydro "0 ASIC Chip" Error | Pending | 📤 Send to Research |
| 3 | Antminer S19 XP Hashboard Missing | Done | ✅ View Article |
...

Topic Actions: Send to Research | Rename | Delete
```

---

### 3. 🔬 Research
**Components:** `app/components/ResearchWorkspace.tsx`, `app/components/ResearchViewer.tsx`
**API:** `app/api/scraper/search/route.ts`

#### Input Methods
1. **From Blog Tree** → Topic auto-fills in search
2. **Manual** → Type topic in search bar

#### UI Layout
```
┌────────────────────────────────────────────────────┐
│ 🔬 Research                                        │
├────────────────────────────────────────────────────┤
│ Topic: [Antminer S19 Pro Hashboard Not Detected]   │
│                                    [🔍 Search]      │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📊 Research Results                                │
│ ┌────────────────────────────────────────────────┐ │
│ │ Key Findings:                                  │ │
│ │ • Common causes: EEPROM failure, chip damage   │ │
│ │ • Voltage range: 0.31V - 0.32V × chip groups   │ │
│ │ • Test equipment: PicoBT, PT3 tester           │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 📚 Sources (8 found)                               │
│ ┌────────────────────────────────────────────────┐ │
│ │ 1. zeusbtc.com - S19 Hashboard Repair Guide    │ │
│ │ 2. bitmain.com - Official Troubleshooting      │ │
│ │ 3. d-central.tech - Diagnosis Walkthrough      │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 🧠 AI Summary                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ The Antminer S19 Pro hashboard detection issue │ │
│ │ typically stems from EEPROM corruption or...   │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [🔄 Search Again] [📋 Copy] [➡️ Push to Prompt]    │
└────────────────────────────────────────────────────┘
```

---

### 4. ✨ Generate Prompt

#### Input
- Receives research data from Research page
- Or manual input

#### Output
```
┌────────────────────────────────────────────────────┐
│ ✨ Generate Prompt                                 │
├────────────────────────────────────────────────────┤
│ Topic: Antminer S19 Pro Hashboard Not Detected     │
│                                                    │
│ Research Context: (from previous step)             │
│ ┌────────────────────────────────────────────────┐ │
│ │ • 8 sources analyzed                           │ │
│ │ • Key terms: EEPROM, CLK signal, domain voltage│ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│                         [🧠 Generate with Gemini]   │
├────────────────────────────────────────────────────┤
│ 📝 Claude-Ready Prompt:                            │
│ ┌────────────────────────────────────────────────┐ │
│ │ You are an expert ASIC miner repair technician │ │
│ │ writing for ASICREPAIR.IN. Write a 2000+ word  │ │
│ │ authoritative guide on "Antminer S19 Pro       │ │
│ │ Hashboard Not Detected" covering:              │ │
│ │                                                │ │
│ │ 1. Symptom identification                      │ │
│ │ 2. Root cause analysis (EEPROM, chip damage)   │ │
│ │ 3. Step-by-step diagnosis                      │ │
│ │ 4. Repair procedures                           │ │
│ │ 5. When to seek professional help              │ │
│ │ ...                                            │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│                              [📋 Copy to Clipboard] │
└────────────────────────────────────────────────────┘
```

**User Action:** Copy prompt → Paste into Claude manually → Get article

---

### 5. 📋 Claude Output
**Component:** `app/components/ClaudeOutput.tsx`

#### Purpose
Paste the article generated by Claude and save it to Articles

#### UI Layout
```
┌────────────────────────────────────────────────────┐
│ 📋 Claude Output                                   │
├────────────────────────────────────────────────────┤
│                                                    │
│ 1. Select Topic Title:                             │
│ ┌────────────────────────────────────────────────┐ │
│ │ ▼ Antminer S19 Pro Hashboard Not Detected      │ │
│ │   Antminer S21 Hydro "0 ASIC Chip" Error       │ │
│ │   WhatsMiner M50S Hashboard Error              │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 2. Paste Final Blog:                               │
│ ┌────────────────────────────────────────────────┐ │
│ │                                                │ │
│ │ # Antminer S19 Pro Hashboard Not Detected      │ │
│ │                                                │ │
│ │ The Antminer S19 Pro is one of the most        │ │
│ │ powerful Bitcoin mining machines available...  │ │
│ │                                                │ │
│ │ ## Common Symptoms                             │ │
│ │ - Kernel logs showing "0 ASIC chip"            │ │
│ │ - Missing chain errors                         │ │
│ │ ...                                            │ │
│ │                                                │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 3.                    [✅ Add Final Blog to Articles] │
└────────────────────────────────────────────────────┘
```

---

### 6. 📝 Articles

#### Purpose
Database of all completed articles from Claude Output

#### UI Layout
```
┌────────────────────────────────────────────────────┐
│ 📝 Articles (12 completed)                         │
├────────────────────────────────────────────────────┤
│                                                    │
│ | # | Title | Category | Date | Actions |          │
│ |---|-------|----------|------|---------|          │
│ | 1 | S19 Pro Hashboard Not Detected | Phase 1 |   │
│ |   | 01/18/2026 | 👁️ View | 📋 Copy | 🚀 Publish | │
│ | 2 | M50S Hashboard Error | Phase 1 |             │
│ |   | 01/17/2026 | 👁️ View | 📋 Copy | 🚀 Publish | │
│ | 3 | Thermal Shutdown Guide | Phase 2 |           │
│ |   | 01/16/2026 | 👁️ View | 📋 Copy | 🚀 Publish | │
│                                                    │
└────────────────────────────────────────────────────┘

👁️ View = Preview as it appears on website (same format)
📋 Copy = Copy article content
🚀 Publish = Move to Publish Hub
```

---

### 7. 🚀 Publish Hub
**Component:** `app/components/PublishHub.tsx`

#### Purpose
Schedule and push articles to Supabase (goes live on website)

#### UI Layout
```
┌────────────────────────────────────────────────────┐
│ 🚀 Publish Hub                                     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Ready to Publish (3 articles)                      │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ 📄 S19 Pro Hashboard Not Detected              │ │
│ │    Category: Phase 1 > Antminer > S-Series     │ │
│ │                                                │ │
│ │    Schedule: [📅 Date] [🕐 Time]                │ │
│ │              [Jan 20, 2026] [10:00 AM]         │ │
│ │                                                │ │
│ │    [⏰ Schedule] [🚀 Publish Now]               │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ 📄 M50S Hashboard Error                        │ │
│ │    ... (similar layout)                        │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ ────────────────────────────────────────────────── │
│ Scheduled (2 articles)                             │
│ • S21 Hydro Guide → Jan 22, 2026 @ 9:00 AM        │
│ • Thermal Paste Guide → Jan 25, 2026 @ 11:00 AM   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 8. 🔑 Keywords

#### Purpose
High-value keyword research and approval system (NOT automated SEO)

#### UI Layout
```
┌────────────────────────────────────────────────────┐
│ 🔑 Keyword Research                                │
├────────────────────────────────────────────────────┤
│ [+ Add Keyword]                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ | Keyword | Model | Category | Volume | Status |   │
│ |---------|-------|----------|--------|--------|   │
│ | s19 pro hashboard repair | S19 Pro | Hashboard | │
│ |   High | ✅ Approved |                           │
│ | whatsminer m30s error 202 | M30S | PSU |         │
│ |   Medium | ⏳ Pending |                          │
│ | avalon miner not starting | Avalon | General |   │
│ |   Low | ❌ Rejected |                            │
│                                                    │
├────────────────────────────────────────────────────┤
│ Keyword Details (click to expand):                 │
│                                                    │
│ Keyword: s19 pro hashboard repair                  │
│ ASIC Model: Antminer S19 Pro                       │
│ Failure Category: Hashboard                        │
│ Repair Intent: ✅ Hardware failure implied         │
│ Search Volume: High (API hint)                     │
│ Admin Notes: "Priority - common issue in India"   │
│ Decision: [✅ Approve] [❌ Reject]                  │
└────────────────────────────────────────────────────┘
```

**Key Rules:**
- API data is advisory only (shows volume hints)
- All decisions are MANUAL
- Focus: Repair intent > Traffic volume
- Output: Approved keywords → become blog topics

---

## 🗄️ Database Schema (Supabase)

```sql
-- Blog Tree Structure
phases (id, name, order, article_count)
categories (id, phase_id, name, article_count)
subcategories (id, category_id, name, article_count)
topics (id, subcategory_id, title, status, research_data)

-- Articles Pipeline
articles (id, topic_id, title, content, status, created_at, publish_date)

-- Keywords
keywords (id, phrase, model, category, intent_indicators, volume, notes, status)

-- Scheduled Publishing
publish_queue (id, article_id, scheduled_date, scheduled_time, status)
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 |
| Database | Supabase |
| Data Layer | `lib/supabase.ts` |
| AI | Google Gemini API |
| Deployment | Vercel |
| External AI | Claude (manual) |

