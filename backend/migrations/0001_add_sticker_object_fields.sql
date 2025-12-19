ALTER TABLE "stickers" ADD COLUMN "objectKey" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "mimeType" text NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "size" bigint NOT NULL;