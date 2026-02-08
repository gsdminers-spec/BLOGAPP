-- Add slug column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'slug') THEN
        ALTER TABLE articles ADD COLUMN slug TEXT UNIQUE;
    END IF;
END$$;

-- Backfill slugs for existing articles based on title
UPDATE articles
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Ensure no trailing/leading dashes from the regex replacement
UPDATE articles
SET slug = trim(both '-' from slug)
WHERE slug IS NULL;
