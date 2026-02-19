-- Add author columns to articles table for SEO E-E-A-T support
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS author_name text DEFAULT 'ASICREPAIR.in Team',
ADD COLUMN IF NOT EXISTS author_url text DEFAULT 'https://asicrepair.in';

-- Comment on columns
COMMENT ON COLUMN articles.author_name IS 'Name of the author for SEO/Schema purposes';
COMMENT ON COLUMN articles.author_url IS 'URL to the author profile or social media';
