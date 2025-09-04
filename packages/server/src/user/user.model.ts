import { FriendshipStatus } from '@/friendship/friendship.schema';
import { users, friendships, userInterests, interests } from '../db/schema';
export { users, friendships, userInterests };

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SafeUser = Omit<User, 'password'>;

export type Interest = typeof interests.$inferSelect;

export type UserProfile = SafeUser & {
    friendshipStatus: FriendshipStatus;
    interests: Interest[];
};
