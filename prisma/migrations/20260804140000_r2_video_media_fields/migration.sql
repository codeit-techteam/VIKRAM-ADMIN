-- AlterEnum VideoPlacement
ALTER TYPE "VideoPlacement" ADD VALUE IF NOT EXISTS 'HOME_HERO_VIDEO';
ALTER TYPE "VideoPlacement" ADD VALUE IF NOT EXISTS 'TUTORIALS';

-- AlterTable videos
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "storage_key" VARCHAR(500);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "public_url" VARCHAR(2000);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "thumbnail_key" VARCHAR(500);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "mime_type" VARCHAR(100);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "cta_label" VARCHAR(100);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMP(3);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "created_by" UUID;

ALTER TABLE "videos" ALTER COLUMN "video_url" TYPE VARCHAR(2000);
ALTER TABLE "videos" ALTER COLUMN "thumbnail_url" TYPE VARCHAR(2000);
ALTER TABLE "videos" ALTER COLUMN "link_url" TYPE VARCHAR(1000);

-- Backfill published from visibility flags
UPDATE "videos"
SET "published" = TRUE
WHERE "deleted_at" IS NULL
  AND "is_visible" = TRUE
  AND "status" = 'ACTIVE';

-- Prefer HOME_HERO_VIDEO for existing HOME placements used as hero
UPDATE "videos"
SET "placement" = 'HOME_HERO_VIDEO'
WHERE "placement" = 'HOME'
  AND "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "videos_placement_published_priority_idx"
  ON "videos"("placement", "published", "priority");
