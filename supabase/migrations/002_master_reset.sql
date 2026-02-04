-- ============================================================
-- ASICREPAIR Admin App - MASTER DATABASE RESET
-- ⚠️ WARNING: This will DELETE ALL EXISTING DATA
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: DROP ALL OLD TABLES (in correct order to respect foreign keys)
-- ============================================================

DROP TABLE IF EXISTS publish_queue CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS repair_tickets CASCADE;

-- Keep 'profiles' table if using Supabase Auth

-- STEP 2: ENABLE UUID EXTENSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 3: CREATE FRESH TABLES
-- ============================================================

-- 3.1 PHASES (Phase 1-4)
CREATE TABLE phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 CATEGORIES (e.g., ANTMINER, WHATSMINER under Phase 1)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 SUBCATEGORIES (e.g., S-Series, T-Series under ANTMINER)
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 TOPICS (Individual article titles)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
    research_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 ARTICLES (Completed blog posts)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    publish_date TIMESTAMPTZ
);

-- 3.6 KEYWORDS (Research & qualification)
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phrase VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    category VARCHAR(100),
    intent_indicators JSONB,
    volume VARCHAR(20) DEFAULT 'medium' CHECK (volume IN ('low', 'medium', 'high')),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 PUBLISH QUEUE (Scheduled publishing)
CREATE TABLE publish_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: CREATE INDEXES
-- ============================================================

CREATE INDEX idx_phases_order ON phases("order");
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_keywords_status ON keywords(status);
CREATE INDEX idx_publish_queue_date ON publish_queue(scheduled_date, scheduled_time);

-- STEP 5: SEED 4 PHASES
-- ============================================================

INSERT INTO phases (name, description, "order") VALUES
('PHASE 1: Hashboard Not Detected', '80 Articles - Model-specific hashboard errors', 1),
('PHASE 2: Repair Insights', '30 Articles - Overheating, Low Hashrate, PSU', 2),
('PHASE 3: Environmental Damage', '10 Articles - Monsoon, Summer, Dust, Flood', 3),
('PHASE 4: Repair Decisions', '10 Articles - Cost, DIY vs Pro, Parts Sourcing', 4);

-- ============================================================
-- ✅ SETUP COMPLETE!
-- 
-- Tables created: phases, categories, subcategories, topics, 
--                 articles, keywords, publish_queue
-- 
-- Next: Run the seed script from the app to populate 130 topics
-- Or manually add categories/topics via the Blog Tree UI
-- ============================================================
