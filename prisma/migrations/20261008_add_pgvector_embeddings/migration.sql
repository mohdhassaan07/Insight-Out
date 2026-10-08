-- Add embedding column (768 dimensions for Google text-embedding-004)
ALTER TABLE "Feedback" ADD COLUMN "embedding" vector(768);

-- Create HNSW index for fast cosine similarity search
CREATE INDEX "Feedback_embedding_idx" ON "Feedback"
USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
