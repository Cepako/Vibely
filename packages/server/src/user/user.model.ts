import { users } from '../db/schema';
export { users };

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
