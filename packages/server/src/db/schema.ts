import { pgTable, index, foreignKey, unique, check, serial, integer, timestamp, varchar, text, boolean, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contentType = pgEnum("content_type", ['text', 'video', 'image', 'file'])
export const conversationType = pgEnum("conversation_type", ['direct', 'group'])
export const fileType = pgEnum("file_type", ['image', 'video', 'document'])
export const friendshipStatusType = pgEnum("friendship_status_type", ['pending', 'accepted', 'blocked'])
export const genderType = pgEnum("gender_type", ['male', 'female'])
export const notificationRelatedType = pgEnum("notification_related_type", ['posts', 'comments', 'friendships', 'events', 'post_reactions', 'comment_reactions'])
export const participantStatusType = pgEnum("participant_status_type", ['invited', 'going', 'declined'])
export const postContentType = pgEnum("post_content_type", ['photo', 'video'])
export const privacyLevelType = pgEnum("privacy_level_type", ['public', 'friends', 'private'])
export const reportStatusType = pgEnum("report_status_type", ['pending', 'reviewing', 'resolved', 'dismissed'])
export const userRoleType = pgEnum("user_role_type", ['user', 'admin'])
export const userStatusType = pgEnum("user_status_type", ['active', 'inactive', 'suspended', 'banned'])


export const friendships = pgTable("friendships", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	friendId: integer("friend_id").notNull(),
	status: friendshipStatusType().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_friendships_friend_id").using("btree", table.friendId.asc().nullsLast().op("int4_ops")),
	index("idx_friendships_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_friendships_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.friendId],
			foreignColumns: [users.id],
			name: "friendships_friend_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "friendships_user_id_fkey"
		}).onDelete("cascade"),
	unique("friendships_user_id_friend_id_key").on(table.userId, table.friendId),
	check("friendships_check", sql`user_id <> friend_id`),
]);

export const eventCategories = pgTable("event_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_event_categories_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("event_categories_name_key").on(table.name),
]);

export const postReactions = pgTable("post_reactions", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_post_reactions_post_id").using("btree", table.postId.asc().nullsLast().op("int4_ops")),
	index("idx_post_reactions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_reactions_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_reactions_user_id_fkey"
		}).onDelete("cascade"),
	unique("post_reactions_post_id_user_id_key").on(table.postId, table.userId),
]);

export const conversationParticipants = pgTable("conversation_participants", {
	id: serial().primaryKey().notNull(),
	conversationId: integer("conversation_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	nickname: varchar({ length: 100 }),
	role: varchar({ length: 20 }).default('member').notNull(),
}, (table) => [
	index("idx_conversation_participants_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("idx_conversation_participants_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "conversation_participants_conversation_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversation_participants_user_id_fkey"
		}).onDelete("cascade"),
	unique("conversation_participants_conversation_id_user_id_key").on(table.conversationId, table.userId),
]);

export const comments = pgTable("comments", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	userId: integer("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	parentId: integer("parent_id"),
}, (table) => [
	index("idx_comments_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_comments_parent_id").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("idx_comments_post_id").using("btree", table.postId.asc().nullsLast().op("int4_ops")),
	index("idx_comments_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "comments_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "comments_parent_id_fkey"
		}).onDelete("cascade"),
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	organizerId: integer("organizer_id").notNull(),
	categoryId: integer("category_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	location: varchar({ length: 255 }),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	privacyLevel: privacyLevelType("privacy_level").default('private'),
	maxParticipants: integer("max_participants"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_events_category_id").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_events_organizer_id").using("btree", table.organizerId.asc().nullsLast().op("int4_ops")),
	index("idx_events_privacy_level").using("btree", table.privacyLevel.asc().nullsLast().op("enum_ops")),
	index("idx_events_start_time").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [eventCategories.id],
			name: "events_category_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizerId],
			foreignColumns: [users.id],
			name: "events_organizer_id_fkey"
		}).onDelete("cascade"),
]);

export const eventParticipants = pgTable("event_participants", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	userId: integer("user_id").notNull(),
	status: participantStatusType().default('invited').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_event_participants_event_id").using("btree", table.eventId.asc().nullsLast().op("int4_ops")),
	index("idx_event_participants_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_event_participants_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_participants_event_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "event_participants_user_id_fkey"
		}).onDelete("cascade"),
	unique("event_participants_event_id_user_id_key").on(table.eventId, table.userId),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: notificationRelatedType().notNull(),
	content: text().notNull(),
	relatedId: integer("related_id"),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_notifications_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_notifications_is_read").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const interests = pgTable("interests", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_interests_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("interests_name_key").on(table.name),
]);

export const posts = pgTable("posts", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	content: text().notNull(),
	contentType: postContentType("content_type").default('photo'),
	privacyLevel: privacyLevelType("privacy_level").default('public'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	contentUrl: varchar("content_url", { length: 255 }).notNull(),
}, (table) => [
	index("idx_posts_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_posts_privacy_level").using("btree", table.privacyLevel.asc().nullsLast().op("enum_ops")),
	index("idx_posts_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "posts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	type: conversationType().default('direct').notNull(),
	name: varchar({ length: 100 }),
}, (table) => [
	index("idx_conversations_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
]);

export const messageAttachments = pgTable("message_attachments", {
	id: serial().primaryKey().notNull(),
	messageId: integer("message_id").notNull(),
	fileUrl: varchar("file_url", { length: 255 }).notNull(),
	fileType: fileType("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	originalFileName: varchar("original_file_name", { length: 255 }),
}, (table) => [
	index("idx_message_attachments_message_id").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "message_attachments_message_id_fkey"
		}).onDelete("cascade"),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	conversationId: integer("conversation_id").notNull(),
	senderId: integer("sender_id").notNull(),
	content: text(),
	contentType: contentType("content_type").default('text'),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("idx_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_fkey"
		}).onDelete("cascade"),
]);

export const userReports = pgTable("user_reports", {
	id: serial().primaryKey().notNull(),
	reporterId: integer("reporter_id").notNull(),
	reportedId: integer("reported_id").notNull(),
	reason: text().notNull(),
	status: reportStatusType().default('pending'),
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_reports_reported_id").using("btree", table.reportedId.asc().nullsLast().op("int4_ops")),
	index("idx_user_reports_reporter_id").using("btree", table.reporterId.asc().nullsLast().op("int4_ops")),
	index("idx_user_reports_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.reportedId],
			foreignColumns: [users.id],
			name: "user_reports_reported_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "user_reports_reporter_id_fkey"
		}).onDelete("cascade"),
	check("user_reports_check", sql`reporter_id <> reported_id`),
]);

export const userBlocks = pgTable("user_blocks", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	blockedBy: integer("blocked_by").notNull(),
	reason: text(),
	endDate: timestamp("end_date", { mode: 'string' }),
	isPermanent: boolean("is_permanent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_blocks_blocked_by").using("btree", table.blockedBy.asc().nullsLast().op("int4_ops")),
	index("idx_user_blocks_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "user_blocks_blocked_by_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_blocks_user_id_fkey"
		}).onDelete("cascade"),
	check("user_blocks_check", sql`user_id <> blocked_by`),
]);

export const userInterests = pgTable("user_interests", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	interestId: integer("interest_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_interests_interest_id").using("btree", table.interestId.asc().nullsLast().op("int4_ops")),
	index("idx_user_interests_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.interestId],
			foreignColumns: [interests.id],
			name: "user_interests_interest_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_interests_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_interests_user_id_interest_id_key").on(table.userId, table.interestId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	surname: varchar({ length: 100 }).notNull(),
	gender: genderType().notNull(),
	profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
	bio: text(),
	city: varchar({ length: 100 }),
	region: varchar({ length: 100 }),
	dateOfBirth: date("date_of_birth").notNull(),
	status: userStatusType().default('active').notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	role: userRoleType().default('user').notNull(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	unique("users_email_key").on(table.email),
]);

export const commentReactions = pgTable("comment_reactions", {
	id: serial().primaryKey().notNull(),
	commentId: integer("comment_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_comment_reactions_comment_id").using("btree", table.commentId.asc().nullsLast().op("int4_ops")),
	index("idx_comment_reactions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "comment_reactions_comment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comment_reactions_user_id_fkey"
		}).onDelete("cascade"),
	unique("comment_reactions_comment_id_user_id_key").on(table.commentId, table.userId),
]);
