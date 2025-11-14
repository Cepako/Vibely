CREATE TYPE "public"."content_type" AS ENUM('text', 'video', 'image', 'file');--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('image', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."friendship_status_type" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."gender_type" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."notification_related_type" AS ENUM('posts', 'comments', 'friendships', 'events', 'post_reactions', 'comment_reactions');--> statement-breakpoint
CREATE TYPE "public"."participant_status_type" AS ENUM('invited', 'going', 'declined');--> statement-breakpoint
CREATE TYPE "public"."post_content_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."privacy_level_type" AS ENUM('public', 'friends', 'private');--> statement-breakpoint
CREATE TABLE "comment_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "comment_reactions_comment_id_user_id_key" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"nickname" varchar(100),
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	CONSTRAINT "conversation_participants_conversation_id_user_id_key" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"type" "conversation_type" DEFAULT 'direct' NOT NULL,
	"name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "event_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "participant_status_type" DEFAULT 'invited' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "event_participants_event_id_user_id_key" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizer_id" integer NOT NULL,
	"category_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"privacy_level" "privacy_level_type" DEFAULT 'private',
	"max_participants" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"status" "friendship_status_type" NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "friendships_user_id_friend_id_key" UNIQUE("user_id","friend_id"),
	CONSTRAINT "friendships_check" CHECK (user_id <> friend_id)
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "interests_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"file_url" varchar(255) NOT NULL,
	"file_type" "file_type" NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"original_file_name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text,
	"content_type" "content_type" DEFAULT 'text',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_related_type" NOT NULL,
	"content" text NOT NULL,
	"related_id" integer,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "post_reactions_post_id_user_id_key" UNIQUE("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"content_type" "post_content_type" DEFAULT 'photo',
	"privacy_level" "privacy_level_type" DEFAULT 'public',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"content_url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"interest_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_interests_user_id_interest_id_key" UNIQUE("user_id","interest_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"surname" varchar(100) NOT NULL,
	"gender" "gender_type" NOT NULL,
	"profile_picture_url" varchar(255),
	"bio" text,
	"city" varchar(100),
	"region" varchar(100),
	"date_of_birth" date NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"refresh_token" text,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_comment_reactions_comment_id" ON "comment_reactions" USING btree ("comment_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_comment_reactions_user_id" ON "comment_reactions" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_created_at" ON "comments" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_parent_id" ON "comments" USING btree ("parent_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_post_id" ON "comments" USING btree ("post_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_conversation_id" ON "conversation_participants" USING btree ("conversation_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_user_id" ON "conversation_participants" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_type" ON "conversations" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_event_categories_name" ON "event_categories" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_event_participants_event_id" ON "event_participants" USING btree ("event_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_event_participants_status" ON "event_participants" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_event_participants_user_id" ON "event_participants" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_events_category_id" ON "events" USING btree ("category_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_events_organizer_id" ON "events" USING btree ("organizer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_events_privacy_level" ON "events" USING btree ("privacy_level" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_events_start_time" ON "events" USING btree ("start_time" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_friendships_friend_id" ON "friendships" USING btree ("friend_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_friendships_status" ON "friendships" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_friendships_user_id" ON "friendships" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_interests_name" ON "interests" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_message_attachments_message_id" ON "message_attachments" USING btree ("message_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_post_reactions_post_id" ON "post_reactions" USING btree ("post_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_post_reactions_user_id" ON "post_reactions" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_created_at" ON "posts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_privacy_level" ON "posts" USING btree ("privacy_level" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_user_id" ON "posts" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_interests_interest_id" ON "user_interests" USING btree ("interest_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_interests_user_id" ON "user_interests" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);