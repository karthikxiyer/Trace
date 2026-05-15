ALTER TABLE links ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_links_search ON links USING GIN(search_vector);

CREATE OR REPLACE TRIGGER links_search_vector_update
BEFORE INSERT OR UPDATE OF title, description ON links
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title, description);

-- Backfill existing rows
UPDATE links SET title = title WHERE title IS NOT NULL;
