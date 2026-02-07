-- Create the table for SEO Keywords
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phrase TEXT NOT NULL,
    url TEXT NOT NULL,
    tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users (or service role)
-- Adjust 'public' to 'authenticated' depending on your auth setup.
-- For now, allowing all access for simplicity in the admin app context.
CREATE POLICY "Enable all access for all users" ON seo_keywords
    FOR ALL USING (true) WITH CHECK (true);
