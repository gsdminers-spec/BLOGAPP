-- Add author columns to blog_articles table (Live Content)
ALTER TABLE blog_articles
ADD COLUMN IF NOT EXISTS author_name text DEFAULT 'ASICREPAIR.in Team',
ADD COLUMN IF NOT EXISTS author_url text DEFAULT 'https://asicrepair.in';

-- Comment on columns
COMMENT ON COLUMN blog_articles.author_name IS 'Name of the author for SEO/Schema purposes';
COMMENT ON COLUMN blog_articles.author_url IS 'URL to the author profile or social media';
