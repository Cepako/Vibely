import { db } from '../db';
import {
    conversations,
    conversationParticipants,
    messages,
    messageAttachments,
    users,
} from '../db/schema';
import { and, eq, desc, inArray, sql, ne } from 'drizzle-orm';
import {
    CreateMessageType,
    CreateConversationType,
    UpdateParticipantNicknameType,
    UpdateConversationNameType,
} from './message.schema';
import {
    MessageWithSender,
    ConversationWithDetails,
    MessageAttachment,
} from './message.model';
import { FileInput } from '../utils/handleFileUpload';
import { handleFileUpload } from '../utils/handleFileUpload';
import { NotificationService } from '../notification/notification.service';
import { websocketManager } from '../ws/websocketManager';
import UserService from '@/user/user.service';
import { FriendshipService } from '@/friendship/friendship.service';

interface IMessageService {
    createMessage(
        userId: number,
        data: CreateMessageType,
        file?: FileInput
    ): Promise<MessageWithSender>;

    getMessages(
        userId: number,
        conversationId: number,
        limit?: number,
        offset?: number
    ): Promise<MessageWithSender[]>;

    markMessagesAsRead(userId: number, messageIds: number[]): Promise<void>;

    createConversation(
        userId: number,
        data: CreateConversationType
    ): Promise<ConversationWithDetails>;

    getUserConversations(
        userId: number,
        limit?: number,
        offset?: number
    ): Promise<ConversationWithDetails[]>;

    getConversationById(
        userId: number,
        conversationId: number
    ): Promise<ConversationWithDetails | null>;

    deleteMessage(userId: number, messageId: number): Promise<void>;

    leaveConversation(userId: number, conversationId: number): Promise<void>;

    updateConversation(
        userId: number,
        conversationId: number,
        data: UpdateConversationNameType
    ): Promise<ConversationWithDetails>;

    updateParticipantNickname(
        userId: number,
        conversationId: number,
        data: UpdateParticipantNicknameType
    ): Promise<void>;

    addParticipantToConversation(
        userId: number,
        conversationId: number,
        newParticipantId: number
    ): Promise<void>;

    removeParticipantFromConversation(
        userId: number,
        conversationId: number,
        participantId: number
    ): Promise<void>;
}

export class MessageService implements IMessageService {
    private notificationService: NotificationService;
    private userService: UserService;
    private friendshipService: FriendshipService;

    constructor() {
        this.notificationService = new NotificationService();
        this.friendshipService = new FriendshipService();
        this.userService = new UserService(this.friendshipService);
    }

    async createMessage(
        userId: number,
        data: CreateMessageType,
        file?: FileInput
    ): Promise<MessageWithSender> {
        try {
            const createdRows = await db
                .insert(messages)
                .values({
                    conversationId: data.conversationId,
                    senderId: userId,
                    content: data.content ?? null,
                    contentType: data.contentType ?? 'text',
                    isRead: false,
                })
                .returning();

            const created = createdRows[0];
            if (!created) {
                throw new Error('Failed to create message');
            }

            const attachments: MessageAttachment[] = [];
            if (file) {
                const fileUrl = await handleFileUpload(file, {
                    allowedTypes: [
                        'image/',
                        'video/',
                        'application/',
                        'text/',
                        'audio/',
                    ],
                    maxSizeInMB: 50,
                    subFolder: 'messages',
                });

                let fileType: 'image' | 'video' | 'document' = 'document';

                if (file.mimetype?.startsWith('image/')) {
                    fileType = 'image';
                } else if (file.mimetype?.startsWith('video/')) {
                    fileType = 'video';
                } else {
                    fileType = 'document';
                }

                const inserted = await db
                    .insert(messageAttachments)
                    .values({
                        messageId: created.id,
                        fileUrl,
                        fileType,
                        fileSize: file.buffer?.length ?? 0,
                        originalFileName: file.filename ?? null,
                    } as any)
                    .returning();

                const att = inserted[0];
                if (att) {
                    attachments.push({
                        id: att.id,
                        messageId: att.messageId,
                        fileUrl: att.fileUrl,
                        fileType: att.fileType,
                        fileSize: att.fileSize,
                        originalFileName: att.originalFileName ?? null,
                        createdAt: att.createdAt ?? new Date().toISOString(),
                    });
                }
            }

            const sender = await this.userService.findUserById(
                created.senderId
            );

            const messageWithSender: MessageWithSender = {
                id: created.id,
                conversationId: created.conversationId,
                senderId: created.senderId,
                content: created.content ?? null,
                contentType: created.contentType,
                isRead: created.isRead ?? false,
                createdAt: created.createdAt ?? new Date().toISOString(),
                sender: {
                    id: userId,
                    name: sender?.name ?? '',
                    surname: sender?.surname ?? '',
                    profilePictureUrl: sender?.profilePictureUrl ?? null,
                },
                ...(attachments.length > 0 ? { attachments } : {}),
            };

            this.broadcastMessageToConversation(
                data.conversationId,
                messageWithSender
            );

            const recipients = await db
                .select({ userId: conversationParticipants.userId })
                .from(conversationParticipants)
                .where(
                    and(
                        eq(
                            conversationParticipants.conversationId,
                            data.conversationId
                        ),
                        ne(conversationParticipants.userId, userId)
                    )
                );

            for (const recipient of recipients) {
                this.notificationService.createNewMessageNotification(
                    recipient.userId
                );
            }

            return messageWithSender;
        } catch (err) {
            throw new Error(`Failed to create message: ${err}`);
        }
    }

    async getMessages(
        userId: number,
        conversationId: number,
        limit = 50,
        offset = 0
    ): Promise<MessageWithSender[]> {
        try {
            const participation =
                await db.query.conversationParticipants.findFirst({
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                });

            if (!participation) {
                throw new Error(
                    'User is not a participant of this conversation'
                );
            }

            const messagesResult = await db.query.messages.findMany({
                where: eq(messages.conversationId, conversationId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    messageAttachments: true,
                },
                orderBy: [desc(messages.createdAt)],
                limit,
                offset,
            });

            return messagesResult
                .map((msg) => ({
                    id: msg.id,
                    conversationId: msg.conversationId,
                    senderId: msg.senderId,
                    content: msg.content,
                    contentType: msg.contentType as 'text' | 'image' | 'video',
                    isRead: msg.isRead || false,
                    createdAt: msg.createdAt || new Date().toISOString(),
                    sender: {
                        ...msg.user,
                    },
                    ...(msg.messageAttachments.length > 0 && {
                        attachments: msg.messageAttachments.map((att) => ({
                            id: att.id,
                            messageId: att.messageId,
                            fileUrl: att.fileUrl,
                            fileType: att.fileType,
                            fileSize: att.fileSize,
                            originalFileName: att.originalFileName ?? null,
                            createdAt:
                                att.createdAt || new Date().toISOString(),
                        })),
                    }),
                }))
                .reverse();
        } catch (error) {
            throw new Error(`Failed to get messages: ${error}`);
        }
    }

    async markMessagesAsRead(
        userId: number,
        messageIds: number[]
    ): Promise<void> {
        try {
            await db
                .update(messages)
                .set({
                    isRead: true,
                })
                .where(
                    and(
                        inArray(messages.id, messageIds),
                        ne(messages.senderId, userId)
                    )
                );
        } catch (error) {
            throw new Error(`Failed to mark messages as read: ${error}`);
        }
    }

    async createConversation(
        userId: number,
        data: CreateConversationType
    ): Promise<ConversationWithDetails> {
        try {
            const allParticipants = [...data.participantIds, userId];
            const uniqueParticipants = [...new Set(allParticipants)];

            const participantUsers = await db.query.users.findMany({
                where: inArray(users.id, uniqueParticipants),
                columns: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true,
                },
            });

            if (participantUsers.length !== uniqueParticipants.length) {
                throw new Error('Some participants not found');
            }

            const conversationType =
                data.type ||
                (uniqueParticipants.length > 2 ? 'group' : 'direct');

            if (conversationType === 'direct') {
                const existingConversation =
                    await this.findExistingConversationWithParticipants(
                        uniqueParticipants
                    );
                if (existingConversation) {
                    return existingConversation;
                }
            }

            const [newConversation] = await db
                .insert(conversations)
                .values({ type: conversationType, name: data.name || null })
                .returning();

            if (!newConversation) {
                throw new Error('Failed to create conversation');
            }

            const participantValues = uniqueParticipants.map(
                (participantId) => ({
                    conversationId: newConversation.id,
                    userId: participantId,
                    role:
                        participantId === userId && conversationType === 'group'
                            ? 'admin'
                            : 'member',
                })
            );

            await db.insert(conversationParticipants).values(participantValues);

            return (await this.getConversationById(
                userId,
                newConversation.id
            )) as ConversationWithDetails;
        } catch (error) {
            throw new Error(`Failed to create conversation: ${error}`);
        }
    }

    async getUserConversations(
        userId: number,
        limit = 20,
        offset = 0
    ): Promise<ConversationWithDetails[]> {
        try {
            const userConversations =
                await db.query.conversationParticipants.findMany({
                    where: eq(conversationParticipants.userId, userId),
                    with: {
                        conversation: {
                            with: {
                                conversationParticipants: {
                                    with: {
                                        user: {
                                            columns: {
                                                id: true,
                                                name: true,
                                                surname: true,
                                                profilePictureUrl: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [desc(conversationParticipants.createdAt)],
                    limit,
                    offset,
                });

            const conversationsWithDetails: ConversationWithDetails[] = [];

            for (const userConv of userConversations) {
                const conversation = userConv.conversation;
                if (conversation.type === 'direct') {
                    const otherParticipant =
                        conversation.conversationParticipants.find(
                            (p) => p.userId !== userId
                        );

                    if (!otherParticipant) {
                        continue;
                    }

                    const friendshipStatus =
                        await this.friendshipService.getFriendshipStatus(
                            userId,
                            otherParticipant.userId
                        );

                    if (friendshipStatus !== 'accepted') {
                        continue;
                    }
                }

                const lastMessage = await db.query.messages.findFirst({
                    where: eq(messages.conversationId, conversation.id),
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                    orderBy: [desc(messages.createdAt)],
                });

                const unreadResult = await db
                    .select({
                        count: sql<number>`count(*)::int`,
                    })
                    .from(messages)
                    .where(
                        and(
                            eq(messages.conversationId, conversation.id),
                            eq(messages.isRead, false),
                            ne(messages.senderId, userId)
                        )
                    );

                const unreadCount = unreadResult[0]?.count || 0;

                conversationsWithDetails.push({
                    id: conversation.id,
                    type: conversation.type,
                    name: conversation.name,
                    createdAt:
                        conversation.createdAt || new Date().toISOString(),
                    updatedAt:
                        conversation.updatedAt || new Date().toISOString(),
                    participants: conversation.conversationParticipants.map(
                        (cp) => ({
                            id: cp.id,
                            nickname: cp.nickname,
                            role: cp.role || 'member',
                            conversationId: cp.conversationId,
                            userId: cp.userId,
                            createdAt: cp.createdAt || new Date().toISOString(),
                            user: cp.user,
                        })
                    ),
                    lastMessage: lastMessage
                        ? {
                              id: lastMessage.id,
                              conversationId: lastMessage.conversationId,
                              senderId: lastMessage.senderId,
                              content: lastMessage.content,
                              contentType: lastMessage.contentType as
                                  | 'text'
                                  | 'image'
                                  | 'video',
                              isRead: lastMessage.isRead || false,
                              createdAt:
                                  lastMessage.createdAt ||
                                  new Date().toISOString(),
                              sender: lastMessage.user,
                          }
                        : undefined,
                    unreadCount,
                });
            }

            return conversationsWithDetails.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.updatedAt;
                const bTime = b.lastMessage?.createdAt || b.updatedAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
        } catch (error) {
            throw new Error(`Failed to get user conversations: ${error}`);
        }
    }

    async getConversationById(
        userId: number,
        conversationId: number
    ): Promise<ConversationWithDetails | null> {
        try {
            const participation =
                await db.query.conversationParticipants.findFirst({
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                });

            if (!participation) {
                return null;
            }

            const conversation = await db.query.conversations.findFirst({
                where: eq(conversations.id, conversationId),
                with: {
                    conversationParticipants: {
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    name: true,
                                    surname: true,
                                    profilePictureUrl: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!conversation) {
                return null;
            }

            if (conversation.type === 'direct') {
                const otherParticipant =
                    conversation.conversationParticipants.find(
                        (p) => p.userId !== userId
                    );

                if (!otherParticipant) {
                    return null;
                }

                const friendshipStatus =
                    await this.friendshipService.getFriendshipStatus(
                        userId,
                        otherParticipant.userId
                    );

                if (friendshipStatus !== 'accepted') {
                    return null;
                }
            }

            const lastMessage = await db.query.messages.findFirst({
                where: eq(messages.conversationId, conversationId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                },
                orderBy: [desc(messages.createdAt)],
            });

            const unreadResult = await db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(messages)
                .where(
                    and(
                        eq(messages.conversationId, conversationId),
                        eq(messages.isRead, false),
                        ne(messages.senderId, userId)
                    )
                );

            const unreadCount = unreadResult[0]?.count || 0;

            return {
                id: conversation.id,
                type: conversation.type,
                name: conversation.name,
                createdAt: conversation.createdAt || new Date().toISOString(),
                updatedAt: conversation.updatedAt || new Date().toISOString(),
                participants: conversation.conversationParticipants.map(
                    (cp) => ({
                        id: cp.id,
                        conversationId: cp.conversationId,
                        userId: cp.userId,
                        nickname: cp.nickname,
                        role: cp.role || 'member',
                        createdAt: cp.createdAt || new Date().toISOString(),
                        user: cp.user,
                    })
                ),
                lastMessage: lastMessage
                    ? {
                          id: lastMessage.id,
                          conversationId: lastMessage.conversationId,
                          senderId: lastMessage.senderId,
                          content: lastMessage.content,
                          contentType: lastMessage.contentType as
                              | 'text'
                              | 'image'
                              | 'video',
                          isRead: lastMessage.isRead || false,
                          createdAt:
                              lastMessage.createdAt || new Date().toISOString(),
                          sender: lastMessage.user,
                      }
                    : undefined,
                unreadCount,
            };
        } catch (error) {
            throw new Error(`Failed to get conversation: ${error}`);
        }
    }

    async deleteMessage(userId: number, messageId: number): Promise<void> {
        try {
            const message = await db.query.messages.findFirst({
                where: and(
                    eq(messages.id, messageId),
                    eq(messages.senderId, userId)
                ),
            });

            if (!message) {
                throw new Error('Message not found or unauthorized');
            }

            await db.delete(messages).where(eq(messages.id, messageId));
        } catch (error) {
            throw new Error(`Failed to delete message: ${error}`);
        }
    }

    async leaveConversation(
        userId: number,
        conversationId: number
    ): Promise<void> {
        try {
            await db
                .delete(conversationParticipants)
                .where(
                    and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    )
                );

            const remainingParticipants =
                await db.query.conversationParticipants.findMany({
                    where: eq(
                        conversationParticipants.conversationId,
                        conversationId
                    ),
                });

            if (remainingParticipants.length === 0) {
                await db
                    .delete(conversations)
                    .where(eq(conversations.id, conversationId));
            }
        } catch (error) {
            throw new Error(`Failed to leave conversation: ${error}`);
        }
    }

    async updateConversation(
        userId: number,
        conversationId: number,
        data: UpdateConversationNameType
    ): Promise<ConversationWithDetails> {
        try {
            const participant =
                await db.query.conversationParticipants.findFirst({
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                });

            if (!participant) {
                throw new Error(
                    'User is not a participant of this conversation'
                );
            }

            const conversation = await db.query.conversations.findFirst({
                where: eq(conversations.id, conversationId),
            });

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            await db
                .update(conversations)
                .set({
                    name: data.name !== '' ? data.name : null,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(conversations.id, conversationId));

            return (await this.getConversationById(
                userId,
                conversationId
            )) as ConversationWithDetails;
        } catch (error) {
            throw new Error(`Failed to update conversation: ${error}`);
        }
    }

    async updateParticipantNickname(
        userId: number,
        conversationId: number,
        data: UpdateParticipantNicknameType
    ): Promise<void> {
        try {
            const requesterParticipant =
                await db.query.conversationParticipants.findFirst({
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                });

            if (!requesterParticipant) {
                throw new Error(
                    'You are not a participant of this conversation'
                );
            }

            const targetParticipant =
                await db.query.conversationParticipants.findFirst({
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, data.userId)
                    ),
                });

            if (!targetParticipant) {
                throw new Error(
                    'Target user is not a participant of this conversation'
                );
            }

            await db
                .update(conversationParticipants)
                .set({
                    nickname: data.nickname !== '' ? data.nickname : null,
                })
                .where(eq(conversationParticipants.id, targetParticipant.id));
        } catch (error) {
            throw new Error(`Failed to update participant nickname: ${error}`);
        }
    }

    async addParticipantToConversation(
        userId: number,
        conversationId: number,
        newParticipantId: number
    ): Promise<void> {
        try {
            const conversation = await db.query.conversations.findFirst({
                where: eq(conversations.id, conversationId),
            });

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            if (conversation.type !== 'group') {
                throw new Error(
                    'Can only add participants to group conversations'
                );
            }

            const requester = await db.query.conversationParticipants.findFirst(
                {
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                }
            );

            if (!requester || requester.role !== 'admin') {
                throw new Error('Only admins can add participants');
            }

            const existing = await db.query.conversationParticipants.findFirst({
                where: and(
                    eq(conversationParticipants.conversationId, conversationId),
                    eq(conversationParticipants.userId, newParticipantId)
                ),
            });

            if (existing) {
                throw new Error('User is already a participant');
            }

            await db.insert(conversationParticipants).values({
                conversationId,
                userId: newParticipantId,
                role: 'member',
            });
        } catch (error) {
            throw new Error(`Failed to add participant: ${error}`);
        }
    }

    async removeParticipantFromConversation(
        userId: number,
        conversationId: number,
        participantId: number
    ): Promise<void> {
        try {
            const conversation = await db.query.conversations.findFirst({
                where: eq(conversations.id, conversationId),
            });

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            if (conversation.type !== 'group') {
                throw new Error(
                    'Can only remove participants from group conversations'
                );
            }

            const requester = await db.query.conversationParticipants.findFirst(
                {
                    where: and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, userId)
                    ),
                }
            );

            if (!requester || requester.role !== 'admin') {
                throw new Error('Only admins can remove participants');
            }

            await db
                .delete(conversationParticipants)
                .where(
                    and(
                        eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        eq(conversationParticipants.userId, participantId)
                    )
                );

            const remaining = await db.query.conversationParticipants.findMany({
                where: eq(
                    conversationParticipants.conversationId,
                    conversationId
                ),
            });

            if (remaining.length === 0) {
                await db
                    .delete(conversations)
                    .where(eq(conversations.id, conversationId));
            }
        } catch (error) {
            throw new Error(`Failed to remove participant: ${error}`);
        }
    }

    private async findExistingConversationWithParticipants(
        participantIds: number[]
    ): Promise<ConversationWithDetails | null> {
        try {
            const potentialConversations =
                await db.query.conversationParticipants.findMany({
                    where: inArray(
                        conversationParticipants.userId,
                        participantIds
                    ),
                    columns: { conversationId: true },
                });

            const conversationIds = [
                ...new Set(potentialConversations.map((p) => p.conversationId)),
            ];

            if (conversationIds.length === 0) {
                return null;
            }

            for (const conversationId of conversationIds) {
                const participantsInConv =
                    await db.query.conversationParticipants.findMany({
                        where: eq(
                            conversationParticipants.conversationId,
                            conversationId
                        ),
                        columns: { userId: true },
                    });

                const convParticipantIds = participantsInConv
                    .map((p) => p.userId)
                    .sort();
                const targetParticipantIds = [...participantIds].sort();

                if (
                    convParticipantIds.length === targetParticipantIds.length &&
                    convParticipantIds.every(
                        (id, index) => id === targetParticipantIds[index]
                    ) &&
                    participantIds.length > 1
                ) {
                    return await this.getConversationById(
                        participantIds[0]!,
                        conversationId
                    );
                }
            }

            return null;
        } catch (error) {
            console.error('Error finding existing conversation:', error);
            return null;
        }
    }

    private broadcastMessageToConversation(
        conversationId: number,
        message: MessageWithSender
    ): void {
        try {
            const connections =
                websocketManager.getChatConnections(conversationId);
            const payload = JSON.stringify({
                type: 'chat_message',
                data: message,
            });
            connections.forEach((conn) => {
                if (conn.socket.readyState === 1) {
                    // WebSocket.OPEN = 1
                    conn.socket.send(payload);
                }
            });
        } catch (error) {
            console.error('Error broadcasting message:', error);
        }
    }
}
