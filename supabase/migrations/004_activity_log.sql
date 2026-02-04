-- ============================================================
-- Migration 004: Activity Log
-- ============================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'LOGIN'
    target VARCHAR(50) NOT NULL, -- 'Topic', 'Article', 'Keyword', 'System'
    details TEXT,                 -- "Added topic 'S19 Pro...'"
    user_id UUID,                 -- Optional, if multiple users
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster dashboard loading
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
