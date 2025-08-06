import { Static, Type } from '@sinclair/typebox';

export const FriendshipStatusSchema = Type.Union([
    Type.Literal('pending'),
    Type.Literal('accepted'),
    Type.Literal('rejected'),
    Type.Literal('blocked'),
    Type.Literal('self'),
    Type.Literal('none'),
    Type.Literal('blocked_by_you'),
    Type.Literal('blocked_by_them'),
    Type.Literal('pending_sent'),
    Type.Literal('pending_received'),
]);

export type FriendshipStatus = Static<typeof FriendshipStatusSchema>;
