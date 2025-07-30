import { posts, comments, postReactions } from '../db/schema';
export { posts, comments, postReactions };

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
