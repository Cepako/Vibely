import { Static, Type } from '@sinclair/typebox';

export const FriendshipStatusSchema = Type.Union([
    Type.Literal('pending'),
    Type.Literal('accepted'),
    Type.Literal('rejected'),
    Type.Literal('blocked'),
]);

export type FriendshipStatus = Static<typeof FriendshipStatusSchema>;
