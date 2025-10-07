import { Type } from '@sinclair/typebox';

export const MessageContentType = Type.Union([
    Type.Literal('text'),
    Type.Literal('image'),
    Type.Literal('video'),
]);

export const ConversationType = Type.Union([
    Type.Literal('direct'),
    Type.Literal('group'),
]);

export const CreateMessageSchema = Type.Object({
    conversationId: Type.Number(),
    content: Type.String({ minLength: 1, maxLength: 2000 }),
    contentType: Type.Optional(MessageContentType),
});

export const CreateConversationSchema = Type.Object({
    participantIds: Type.Array(Type.Number(), { minItems: 1, maxItems: 50 }),
    type: Type.Optional(ConversationType),
});

export const UpdateConversationNameSchema = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

export const UpdateParticipantNicknameSchema = Type.Object({
    conversationId: Type.Number(),
    userId: Type.Number(),
    nickname: Type.String({ minLength: 1, maxLength: 100 }),
});

export const MarkAsReadSchema = Type.Object({
    messageIds: Type.Array(Type.Number(), { minItems: 1 }),
});

export const GetMessagesQuerySchema = Type.Object({
    conversationId: Type.Number(),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    offset: Type.Optional(Type.Number({ minimum: 0 })),
});

export const GetConversationsQuerySchema = Type.Object({
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50 })),
    offset: Type.Optional(Type.Number({ minimum: 0 })),
});

export type CreateMessageType = {
    conversationId: number;
    content: string;
    contentType?: 'text' | 'image' | 'video';
};

export type CreateConversationType = {
    participantIds: number[];
    type?: 'direct' | 'group';
};

export type UpdateConversationNameType = {
    name?: string;
};

export type UpdateParticipantNicknameType = {
    userId: number;
    nickname: string;
};

export type MarkAsReadType = {
    messageIds: number[];
};

export type GetMessagesQueryType = {
    conversationId: number;
    limit?: number;
    offset?: number;
};

export type GetConversationsQueryType = {
    limit?: number;
    offset?: number;
};
