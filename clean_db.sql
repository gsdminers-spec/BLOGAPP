-- 1. CLEAR RESEARCH DATA
-- This removes the heavy JSON payloads from the 'topics' table for completed items.
-- Since research is now session-based, keeping this historical data is waste.
UPDATE topics 
SET research_data = NULL 
WHERE status IN ('researched', 'drafted', 'published');

-- 2. CLEANUP PUBLISH LOGS
-- detailed logs of old publish jobs are not needed.
DELETE FROM publish_queue 
WHERE status = 'published' 
AND created_at < NOW() - INTERVAL '7 days';

-- 3. VACUUM (Optional)
-- Reclaims storage from dead tuples.
VACUUM (VERBOSE, ANALYZE) topics;
VACUUM (VERBOSE, ANALYZE) publish_queue;
