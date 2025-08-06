import { FriendshipStatus } from '@/friendship/friendship.schema';
import { users, friendships } from '../db/schema';
export { users, friendships };

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SafeUser = Omit<User, 'password'>;

export type UserProfile = SafeUser & {
    friendshipStatus: FriendshipStatus;
};
