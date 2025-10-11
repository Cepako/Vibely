import { relations } from "drizzle-orm/relations";
import { users, friendships, notifications, posts, postReactions, conversations, conversationParticipants, comments, eventCategories, events, eventParticipants, messages, messageAttachments, userReports, userBlocks, interests, userInterests, commentReactions } from "./schema";

export const friendshipsRelations = relations(friendships, ({one}) => ({
	user_friendId: one(users, {
		fields: [friendships.friendId],
		references: [users.id],
		relationName: "friendships_friendId_users_id"
	}),
	user_userId: one(users, {
		fields: [friendships.userId],
		references: [users.id],
		relationName: "friendships_userId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	friendships_friendId: many(friendships, {
		relationName: "friendships_friendId_users_id"
	}),
	friendships_userId: many(friendships, {
		relationName: "friendships_userId_users_id"
	}),
	notifications: many(notifications),
	postReactions: many(postReactions),
	conversationParticipants: many(conversationParticipants),
	comments: many(comments),
	events: many(events),
	eventParticipants: many(eventParticipants),
	posts: many(posts),
	messages: many(messages),
	userReports_reportedId: many(userReports, {
		relationName: "userReports_reportedId_users_id"
	}),
	userReports_reporterId: many(userReports, {
		relationName: "userReports_reporterId_users_id"
	}),
	userBlocks_blockedBy: many(userBlocks, {
		relationName: "userBlocks_blockedBy_users_id"
	}),
	userBlocks_userId: many(userBlocks, {
		relationName: "userBlocks_userId_users_id"
	}),
	userInterests: many(userInterests),
	commentReactions: many(commentReactions),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const postReactionsRelations = relations(postReactions, ({one}) => ({
	post: one(posts, {
		fields: [postReactions.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postReactions.userId],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	postReactions: many(postReactions),
	comments: many(comments),
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationParticipants.userId],
		references: [users.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	conversationParticipants: many(conversationParticipants),
	messages: many(messages),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	comment: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "comments_parentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentId_comments_id"
	}),
	commentReactions: many(commentReactions),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventCategory: one(eventCategories, {
		fields: [events.categoryId],
		references: [eventCategories.id]
	}),
	user: one(users, {
		fields: [events.organizerId],
		references: [users.id]
	}),
	eventParticipants: many(eventParticipants),
}));

export const eventCategoriesRelations = relations(eventCategories, ({many}) => ({
	events: many(events),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({one}) => ({
	event: one(events, {
		fields: [eventParticipants.eventId],
		references: [events.id]
	}),
	user: one(users, {
		fields: [eventParticipants.userId],
		references: [users.id]
	}),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({one}) => ({
	message: one(messages, {
		fields: [messageAttachments.messageId],
		references: [messages.id]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	messageAttachments: many(messageAttachments),
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
}));

export const userReportsRelations = relations(userReports, ({one}) => ({
	user_reportedId: one(users, {
		fields: [userReports.reportedId],
		references: [users.id],
		relationName: "userReports_reportedId_users_id"
	}),
	user_reporterId: one(users, {
		fields: [userReports.reporterId],
		references: [users.id],
		relationName: "userReports_reporterId_users_id"
	}),
}));

export const userBlocksRelations = relations(userBlocks, ({one}) => ({
	user_blockedBy: one(users, {
		fields: [userBlocks.blockedBy],
		references: [users.id],
		relationName: "userBlocks_blockedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [userBlocks.userId],
		references: [users.id],
		relationName: "userBlocks_userId_users_id"
	}),
}));

export const userInterestsRelations = relations(userInterests, ({one}) => ({
	interest: one(interests, {
		fields: [userInterests.interestId],
		references: [interests.id]
	}),
	user: one(users, {
		fields: [userInterests.userId],
		references: [users.id]
	}),
}));

export const interestsRelations = relations(interests, ({many}) => ({
	userInterests: many(userInterests),
}));

export const commentReactionsRelations = relations(commentReactions, ({one}) => ({
	comment: one(comments, {
		fields: [commentReactions.commentId],
		references: [comments.id]
	}),
	user: one(users, {
		fields: [commentReactions.userId],
		references: [users.id]
	}),
}));