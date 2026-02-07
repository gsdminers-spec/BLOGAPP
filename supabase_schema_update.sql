-- 1. Create the ENUM type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_status') THEN
        CREATE TYPE article_status AS ENUM ('draft', 'ready', 'scheduled', 'published');
    ELSE
        -- If it exists, try to add 'draft' to it (suppress error if exists)
        BEGIN
            ALTER TYPE article_status ADD VALUE 'draft';
        EXCEPTION
            WHEN duplicate_object THEN null; -- Value already exists
            WHEN OTHERS THEN raise notice 'Error adding value to enum: %', SQLERRM;
        END;
    END IF;
END$$;

-- 2. Ensure 'articles' table has 'category' and 'status' columns
DO $$
BEGIN
    -- Add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'category') THEN
        ALTER TABLE articles ADD COLUMN category TEXT;
    END IF;

    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'status') THEN
        ALTER TABLE articles ADD COLUMN status article_status DEFAULT 'ready';
    END IF;
END$$;

-- 3. Ensure 'blog_articles' has 'category' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_articles' AND column_name = 'category') THEN
        ALTER TABLE blog_articles ADD COLUMN category TEXT;
    END IF;
END$$;

-- 4. Create Index (Safe to run multiple times with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category);

-- 5. Optional: Insert 'Internal linking' phase if missing (Data check)
-- This assumes you have a 'phases' table. 
-- Uncomment if you want to force-insert the phase data.
/*
INSERT INTO phases (name, "order", article_count)
SELECT 'Internal linking', 5, 0
WHERE NOT EXISTS (SELECT 1 FROM phases WHERE name = 'Internal linking');
*/
