ALTER TABLE "user_photos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_photos" CASCADE;--> statement-breakpoint
ALTER TABLE "post_reactions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "gender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "date_of_birth" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content_url" varchar(255);