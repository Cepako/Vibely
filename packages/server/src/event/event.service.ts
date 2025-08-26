import { db } from '../db';
import {
    events,
    eventParticipants,
    eventCategories,
    friendships,
} from '../db/schema';
import { and, eq, or, inArray, desc, asc, gte, lte } from 'drizzle-orm';
import createError from '@fastify/error';
import { NotificationService } from '../notification/notification.service';
import { FriendshipService } from '../friendship/friendship.service';

export interface CreateEventData {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
    categoryId?: number;
    privacyLevel: 'public' | 'friends' | 'private';
    maxParticipants?: number;
    invitedFriends?: number[];
}

export interface UpdateEventData {
    title?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    categoryId?: number;
    privacyLevel?: 'public' | 'friends' | 'private';
    maxParticipants?: number;
}

export interface EventWithDetails {
    id: number;
    organizerId: number;
    categoryId?: number | null;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string;
    endTime?: string | null;
    privacyLevel: 'public' | 'friends' | 'private';
    maxParticipants?: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    organizer: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    category?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
    participants: Array<{
        id: number;
        userId: number;
        status: 'invited' | 'going' | 'declined';
        createdAt: string | null;
        user: {
            id: number;
            name: string;
            surname: string;
            profilePictureUrl?: string | null;
        };
    }>;
    participantCounts: {
        total: number;
        going: number;
        declined: number;
        invited: number;
    };
    currentUserStatus?: 'invited' | 'going' | 'declined' | 'not_invited';
    canEdit: boolean;
}

interface IEventService {
    createEvent(
        userId: number,
        data: CreateEventData
    ): Promise<EventWithDetails>;
    updateEvent(
        userId: number,
        eventId: number,
        data: UpdateEventData
    ): Promise<EventWithDetails>;
    deleteEvent(userId: number, eventId: number): Promise<void>;
    getEventById(
        eventId: number,
        currentUserId?: number
    ): Promise<EventWithDetails | null>;
    getUserEvents(
        userId: number,
        currentUserId?: number
    ): Promise<EventWithDetails[]>;
    getUpcomingEvents(
        userId: number,
        limit?: number
    ): Promise<EventWithDetails[]>;
    getPublicEvents(
        userId: number,
        limit?: number,
        categoryId?: number
    ): Promise<EventWithDetails[]>;
    inviteUsersToEvent(
        organizerId: number,
        eventId: number,
        userIds: number[]
    ): Promise<void>;
    respondToEventInvitation(
        userId: number,
        eventId: number,
        status: 'going' | 'declined'
    ): Promise<void>;
    removeParticipant(
        organizerId: number,
        eventId: number,
        participantId: number
    ): Promise<void>;
    getEventParticipants(
        eventId: number,
        currentUserId?: number
    ): Promise<EventWithDetails['participants']>;
    searchEvents(
        userId: number,
        query: string,
        filters?: EventSearchFilters
    ): Promise<EventWithDetails[]>;
}

export interface EventSearchFilters {
    categoryId?: number;
    privacyLevel?: 'public' | 'friends' | 'private';
    startDate?: string;
    endDate?: string;
    location?: string;
}

export class EventService implements IEventService {
    private notificationService: NotificationService;
    private friendshipService: FriendshipService;

    constructor() {
        this.notificationService = new NotificationService();
        this.friendshipService = new FriendshipService();
    }

    async createEvent(
        userId: number,
        data: CreateEventData
    ): Promise<EventWithDetails> {
        try {
            // Validate start time is in the future
            const startTime = new Date(data.startTime);
            if (startTime <= new Date()) {
                const InvalidDate = createError(
                    'INVALID_START_TIME',
                    'Event start time must be in the future',
                    400
                );
                throw new InvalidDate();
            }

            // Validate end time is after start time if provided
            if (data.endTime) {
                const endTime = new Date(data.endTime);
                if (endTime <= startTime) {
                    const InvalidEndTime = createError(
                        'INVALID_END_TIME',
                        'Event end time must be after start time',
                        400
                    );
                    throw new InvalidEndTime();
                }
            }

            // Validate category exists if provided
            if (data.categoryId) {
                const category = await db.query.eventCategories.findFirst({
                    where: eq(eventCategories.id, data.categoryId),
                });
                if (!category) {
                    const CategoryNotFound = createError(
                        'CATEGORY_NOT_FOUND',
                        'Event category not found',
                        404
                    );
                    throw new CategoryNotFound();
                }
            }

            // Create the event
            const [newEvent] = await db
                .insert(events)
                .values({
                    organizerId: userId,
                    title: data.title.trim(),
                    description: data.description?.trim() || null,
                    location: data.location?.trim() || null,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    categoryId: data.categoryId || null,
                    privacyLevel: data.privacyLevel,
                    maxParticipants: data.maxParticipants || null,
                })
                .returning();

            if (!newEvent) {
                throw new Error('Failed to create event');
            }

            // Add organizer as a participant with 'going' status
            await db.insert(eventParticipants).values({
                eventId: newEvent.id,
                userId,
                status: 'going',
            });

            // Invite friends if specified
            if (data.invitedFriends && data.invitedFriends.length > 0) {
                await this.inviteUsersToEvent(
                    userId,
                    newEvent.id,
                    data.invitedFriends
                );
            }

            return (await this.getEventById(
                newEvent.id,
                userId
            )) as EventWithDetails;
        } catch (error) {
            console.error('Create event error:', error);
            throw error;
        }
    }

    async updateEvent(
        userId: number,
        eventId: number,
        data: UpdateEventData
    ): Promise<EventWithDetails> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            if (event.organizerId !== userId) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'You are not authorized to edit this event',
                    403
                );
                throw new Unauthorized();
            }

            // Validate dates if provided
            if (data.startTime) {
                const startTime = new Date(data.startTime);
                if (startTime <= new Date()) {
                    const InvalidDate = createError(
                        'INVALID_START_TIME',
                        'Event start time must be in the future',
                        400
                    );
                    throw new InvalidDate();
                }
            }

            if (data.endTime && data.startTime) {
                const endTime = new Date(data.endTime);
                const startTime = new Date(data.startTime);
                if (endTime <= startTime) {
                    const InvalidEndTime = createError(
                        'INVALID_END_TIME',
                        'Event end time must be after start time',
                        400
                    );
                    throw new InvalidEndTime();
                }
            }

            // Validate category if provided
            if (data.categoryId) {
                const category = await db.query.eventCategories.findFirst({
                    where: eq(eventCategories.id, data.categoryId),
                });
                if (!category) {
                    const CategoryNotFound = createError(
                        'CATEGORY_NOT_FOUND',
                        'Event category not found',
                        404
                    );
                    throw new CategoryNotFound();
                }
            }

            const updateData: any = {
                updatedAt: new Date().toISOString(),
            };

            if (data.title !== undefined) updateData.title = data.title.trim();
            if (data.description !== undefined)
                updateData.description = data.description?.trim() || null;
            if (data.location !== undefined)
                updateData.location = data.location?.trim() || null;
            if (data.startTime !== undefined)
                updateData.startTime = data.startTime;
            if (data.endTime !== undefined)
                updateData.endTime = data.endTime || null;
            if (data.categoryId !== undefined)
                updateData.categoryId = data.categoryId || null;
            if (data.privacyLevel !== undefined)
                updateData.privacyLevel = data.privacyLevel;
            if (data.maxParticipants !== undefined)
                updateData.maxParticipants = data.maxParticipants || null;

            await db
                .update(events)
                .set(updateData)
                .where(eq(events.id, eventId));

            return (await this.getEventById(
                eventId,
                userId
            )) as EventWithDetails;
        } catch (error) {
            console.error('Update event error:', error);
            throw error;
        }
    }

    async deleteEvent(userId: number, eventId: number): Promise<void> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            if (event.organizerId !== userId) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'You are not authorized to delete this event',
                    403
                );
                throw new Unauthorized();
            }

            // Delete event (participants will be deleted by cascade)
            await db.delete(events).where(eq(events.id, eventId));
        } catch (error) {
            console.error('Delete event error:', error);
            throw error;
        }
    }

    async getEventById(
        eventId: number,
        currentUserId?: number
    ): Promise<EventWithDetails | null> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    eventCategory: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    eventParticipants: {
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
                        orderBy: [asc(eventParticipants.createdAt)],
                    },
                },
            });

            if (!event) return null;

            // Check if user can view this event
            if (
                currentUserId &&
                (await this.canUserViewEvent(event, currentUserId)) === false
            ) {
                return null;
            }

            const participants = event.eventParticipants || [];
            const participantCounts = {
                total: participants.length,
                going: participants.filter((p) => p.status === 'going').length,
                declined: participants.filter((p) => p.status === 'declined')
                    .length,
                invited: participants.filter((p) => p.status === 'invited')
                    .length,
            };

            const currentUserParticipant = currentUserId
                ? participants.find((p) => p.userId === currentUserId)
                : undefined;

            return {
                id: event.id,
                organizerId: event.organizerId,
                categoryId: event.categoryId,
                title: event.title,
                description: event.description,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                privacyLevel: event.privacyLevel as
                    | 'public'
                    | 'friends'
                    | 'private',
                maxParticipants: event.maxParticipants,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                organizer: event.user,
                category: event.eventCategory,
                participants: participants.map((p) => ({
                    id: p.id,
                    userId: p.userId,
                    status: p.status as 'invited' | 'going' | 'declined',
                    createdAt: p.createdAt,
                    user: p.user,
                })),
                participantCounts,
                currentUserStatus: currentUserParticipant
                    ? (currentUserParticipant.status as
                          | 'invited'
                          | 'going'
                          | 'declined')
                    : 'not_invited',
                canEdit: currentUserId === event.organizerId,
            };
        } catch (error) {
            console.error('Get event by ID error:', error);
            throw error;
        }
    }

    async getUserEvents(
        userId: number,
        currentUserId?: number
    ): Promise<EventWithDetails[]> {
        try {
            const userEvents = await db.query.events.findMany({
                where: eq(events.organizerId, userId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    eventCategory: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    eventParticipants: {
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
                orderBy: [desc(events.startTime)],
            });

            const eventsWithDetails: EventWithDetails[] = [];

            for (const event of userEvents) {
                // Check if current user can view this event
                if (
                    currentUserId &&
                    (await this.canUserViewEvent(event, currentUserId)) ===
                        false
                ) {
                    continue;
                }

                const participants = event.eventParticipants || [];
                const participantCounts = {
                    total: participants.length,
                    going: participants.filter((p) => p.status === 'going')
                        .length,
                    declined: participants.filter(
                        (p) => p.status === 'declined'
                    ).length,
                    invited: participants.filter((p) => p.status === 'invited')
                        .length,
                };

                const currentUserParticipant = currentUserId
                    ? participants.find((p) => p.userId === currentUserId)
                    : undefined;

                eventsWithDetails.push({
                    id: event.id,
                    organizerId: event.organizerId,
                    categoryId: event.categoryId,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    privacyLevel: event.privacyLevel as
                        | 'public'
                        | 'friends'
                        | 'private',
                    maxParticipants: event.maxParticipants,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    organizer: event.user,
                    category: event.eventCategory,
                    participants: participants.map((p) => ({
                        id: p.id,
                        userId: p.userId,
                        status: p.status as 'invited' | 'going' | 'declined',
                        createdAt: p.createdAt,
                        user: p.user,
                    })),
                    participantCounts,
                    currentUserStatus: currentUserParticipant
                        ? (currentUserParticipant.status as
                              | 'invited'
                              | 'going'
                              | 'declined')
                        : 'not_invited',
                    canEdit: currentUserId === event.organizerId,
                });
            }

            return eventsWithDetails;
        } catch (error) {
            console.error('Get user events error:', error);
            throw error;
        }
    }

    async getUpcomingEvents(
        userId: number,
        limit: number = 20
    ): Promise<EventWithDetails[]> {
        try {
            // Get events where user is a participant with 'going' status
            const participantEvents = await db.query.eventParticipants.findMany(
                {
                    where: and(
                        eq(eventParticipants.userId, userId),
                        eq(eventParticipants.status, 'going')
                    ),
                    with: {
                        event: {
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        surname: true,
                                        profilePictureUrl: true,
                                    },
                                },
                                eventCategory: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        description: true,
                                    },
                                },
                                eventParticipants: {
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
                }
            );

            // Filter upcoming events and sort by start time
            const upcomingEvents = participantEvents
                .filter((pe) => new Date(pe.event.startTime) > new Date())
                .sort(
                    (a, b) =>
                        new Date(a.event.startTime).getTime() -
                        new Date(b.event.startTime).getTime()
                )
                .slice(0, limit);

            return upcomingEvents.map((pe) => {
                const event = pe.event;
                const participants = event.eventParticipants || [];
                const participantCounts = {
                    total: participants.length,
                    going: participants.filter((p) => p.status === 'going')
                        .length,
                    declined: participants.filter(
                        (p) => p.status === 'declined'
                    ).length,
                    invited: participants.filter((p) => p.status === 'invited')
                        .length,
                };

                const currentUserParticipant = participants.find(
                    (p) => p.userId === userId
                );

                return {
                    id: event.id,
                    organizerId: event.organizerId,
                    categoryId: event.categoryId,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    privacyLevel: event.privacyLevel as
                        | 'public'
                        | 'friends'
                        | 'private',
                    maxParticipants: event.maxParticipants,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    organizer: event.user,
                    category: event.eventCategory,
                    participants: participants.map((p) => ({
                        id: p.id,
                        userId: p.userId,
                        status: p.status as 'invited' | 'going' | 'declined',
                        createdAt: p.createdAt,
                        user: p.user,
                    })),
                    participantCounts,
                    currentUserStatus: currentUserParticipant
                        ? (currentUserParticipant.status as
                              | 'invited'
                              | 'going'
                              | 'declined')
                        : 'not_invited',
                    canEdit: userId === event.organizerId,
                };
            });
        } catch (error) {
            console.error('Get upcoming events error:', error);
            throw error;
        }
    }

    async getPublicEvents(
        userId: number,
        limit: number = 20,
        categoryId?: number
    ): Promise<EventWithDetails[]> {
        try {
            const userFriends = await db.query.friendships.findMany({
                where: or(
                    and(
                        eq(friendships.userId, userId),
                        eq(friendships.status, 'accepted')
                    ),
                    and(
                        eq(friendships.friendId, userId),
                        eq(friendships.status, 'accepted')
                    )
                ),
                columns: {
                    userId: true,
                    friendId: true,
                },
            });

            const friendIds = userFriends.map((friendship) =>
                friendship.userId === userId
                    ? friendship.friendId
                    : friendship.userId
            );

            let whereCondition = and(
                gte(events.startTime, new Date().toISOString()),
                or(
                    eq(events.privacyLevel, 'public'),
                    and(
                        eq(events.privacyLevel, 'friends'),
                        inArray(events.organizerId, friendIds)
                    ),
                    eq(events.organizerId, userId)
                )
            );

            if (categoryId) {
                whereCondition = and(
                    whereCondition,
                    eq(events.categoryId, categoryId)
                );
            }

            const publicEvents = await db.query.events.findMany({
                where: whereCondition,
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    eventCategory: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    eventParticipants: {
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
                orderBy: [asc(events.startTime)],
                limit,
            });

            return publicEvents.map((event) => {
                const participants = event.eventParticipants || [];
                const participantCounts = {
                    total: participants.length,
                    going: participants.filter((p) => p.status === 'going')
                        .length,
                    declined: participants.filter(
                        (p) => p.status === 'declined'
                    ).length,
                    invited: participants.filter((p) => p.status === 'invited')
                        .length,
                };

                const currentUserParticipant = participants.find(
                    (p) => p.userId === userId
                );

                return {
                    id: event.id,
                    organizerId: event.organizerId,
                    categoryId: event.categoryId,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    privacyLevel: event.privacyLevel as
                        | 'public'
                        | 'friends'
                        | 'private',
                    maxParticipants: event.maxParticipants,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    organizer: event.user,
                    category: event.eventCategory,
                    participants: participants.map((p) => ({
                        id: p.id,
                        userId: p.userId,
                        status: p.status as 'invited' | 'going' | 'declined',
                        createdAt: p.createdAt,
                        user: p.user,
                    })),
                    participantCounts,
                    currentUserStatus: currentUserParticipant
                        ? (currentUserParticipant.status as
                              | 'invited'
                              | 'going'
                              | 'declined')
                        : 'not_invited',
                    canEdit: userId === event.organizerId,
                };
            });
        } catch (error) {
            console.error('Get public events error:', error);
            throw error;
        }
    }

    async inviteUsersToEvent(
        organizerId: number,
        eventId: number,
        userIds: number[]
    ): Promise<void> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            if (event.organizerId !== organizerId) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'You are not authorized to invite users to this event',
                    403
                );
                throw new Unauthorized();
            }

            // Check if event has reached max participants
            if (event.maxParticipants) {
                const currentParticipants =
                    await db.query.eventParticipants.findMany({
                        where: and(
                            eq(eventParticipants.eventId, eventId),
                            or(
                                eq(eventParticipants.status, 'going'),
                                eq(eventParticipants.status, 'invited')
                            )
                        ),
                    });

                if (
                    currentParticipants.length + userIds.length >
                    event.maxParticipants
                ) {
                    const MaxCapacityReached = createError(
                        'MAX_CAPACITY_REACHED',
                        'Event has reached maximum capacity',
                        400
                    );
                    throw new MaxCapacityReached();
                }
            }

            // Get existing participants to avoid duplicate invites
            const existingParticipants =
                await db.query.eventParticipants.findMany({
                    where: and(
                        eq(eventParticipants.eventId, eventId),
                        inArray(eventParticipants.userId, userIds)
                    ),
                });

            const existingUserIds = existingParticipants.map((p) => p.userId);
            const newUserIds = userIds.filter(
                (id) => !existingUserIds.includes(id)
            );

            if (newUserIds.length === 0) {
                return; // All users are already invited
            }

            // Validate that all users exist and are friends (for private events)
            if (
                event.privacyLevel === 'private' ||
                event.privacyLevel === 'friends'
            ) {
                const friends =
                    await this.friendshipService.getFriends(organizerId);
                const friendIds = friends.map((f) => f.id);
                const invalidUserIds = newUserIds.filter(
                    (id) => !friendIds.includes(id) && id !== organizerId
                );

                if (invalidUserIds.length > 0) {
                    const NotFriends = createError(
                        'NOT_FRIENDS',
                        'You can only invite friends to private events',
                        403
                    );
                    throw new NotFriends();
                }
            }

            // Create invitations
            const invitations = newUserIds.map((userId) => ({
                eventId,
                userId,
                status: 'invited' as const,
            }));

            await db.insert(eventParticipants).values(invitations);

            // Send notifications
            const organizerName = `${event.user.name} ${event.user.surname}`;
            for (const userId of newUserIds) {
                await this.notificationService.notifyEventInvitation(
                    organizerId,
                    userId,
                    organizerName,
                    event.title,
                    eventId
                );
            }
        } catch (error) {
            console.error('Invite users to event error:', error);
            throw error;
        }
    }

    async respondToEventInvitation(
        userId: number,
        eventId: number,
        status: 'going' | 'declined'
    ): Promise<void> {
        try {
            const participant = await db.query.eventParticipants.findFirst({
                where: and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.userId, userId)
                ),
            });

            if (!participant) {
                const InvitationNotFound = createError(
                    'INVITATION_NOT_FOUND',
                    'Event invitation not found',
                    404
                );
                throw new InvitationNotFound();
            }

            // Check if event has reached max participants (only for 'going' status)
            if (status === 'going') {
                const event = await db.query.events.findFirst({
                    where: eq(events.id, eventId),
                });

                if (event?.maxParticipants) {
                    const goingParticipants =
                        await db.query.eventParticipants.findMany({
                            where: and(
                                eq(eventParticipants.eventId, eventId),
                                eq(eventParticipants.status, 'going')
                            ),
                        });

                    if (goingParticipants.length >= event.maxParticipants) {
                        const MaxCapacityReached = createError(
                            'MAX_CAPACITY_REACHED',
                            'Event has reached maximum capacity',
                            400
                        );
                        throw new MaxCapacityReached();
                    }
                }
            }

            await db
                .update(eventParticipants)
                .set({
                    status,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(eventParticipants.id, participant.id));
        } catch (error) {
            console.error('Respond to event invitation error:', error);
            throw error;
        }
    }

    async removeParticipant(
        organizerId: number,
        eventId: number,
        participantId: number
    ): Promise<void> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            if (event.organizerId !== organizerId) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'You are not authorized to remove participants from this event',
                    403
                );
                throw new Unauthorized();
            }

            const participant = await db.query.eventParticipants.findFirst({
                where: and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.id, participantId)
                ),
            });

            if (!participant) {
                const ParticipantNotFound = createError(
                    'PARTICIPANT_NOT_FOUND',
                    'Participant not found',
                    404
                );
                throw new ParticipantNotFound();
            }

            // Don't allow organizer to remove themselves
            if (participant.userId === organizerId) {
                const CannotRemoveOrganizer = createError(
                    'CANNOT_REMOVE_ORGANIZER',
                    'Event organizer cannot be removed from the event',
                    400
                );
                throw new CannotRemoveOrganizer();
            }

            await db
                .delete(eventParticipants)
                .where(eq(eventParticipants.id, participantId));
        } catch (error) {
            console.error('Remove participant error:', error);
            throw error;
        }
    }

    async getEventParticipants(
        eventId: number,
        currentUserId?: number
    ): Promise<EventWithDetails['participants']> {
        try {
            // First check if the user can view this event
            if (currentUserId) {
                const event = await db.query.events.findFirst({
                    where: eq(events.id, eventId),
                });

                if (!event) {
                    const EventNotFound = createError(
                        'EVENT_NOT_FOUND',
                        'Event not found',
                        404
                    );
                    throw new EventNotFound();
                }

                if (
                    (await this.canUserViewEvent(event, currentUserId)) ===
                    false
                ) {
                    const Unauthorized = createError(
                        'UNAUTHORIZED',
                        'You are not authorized to view this event',
                        403
                    );
                    throw new Unauthorized();
                }
            }

            const participants = await db.query.eventParticipants.findMany({
                where: eq(eventParticipants.eventId, eventId),
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
                orderBy: [asc(eventParticipants.createdAt)],
            });

            return participants.map((p) => ({
                id: p.id,
                userId: p.userId,
                status: p.status as 'invited' | 'going' | 'declined',
                createdAt: p.createdAt,
                user: p.user,
            }));
        } catch (error) {
            console.error('Get event participants error:', error);
            throw error;
        }
    }

    async searchEvents(
        userId: number,
        query: string,
        filters?: EventSearchFilters
    ): Promise<EventWithDetails[]> {
        try {
            // Get user's friends for privacy filtering
            const friends = await this.friendshipService.getFriends(userId);
            const friendIds = friends.map((f) => f.id);

            let whereConditions = [];

            // Privacy conditions
            whereConditions.push(
                or(
                    eq(events.privacyLevel, 'public'),
                    and(
                        eq(events.privacyLevel, 'friends'),
                        or(
                            eq(events.organizerId, userId),
                            inArray(events.organizerId, friendIds)
                        )
                    ),
                    eq(events.organizerId, userId)
                )
            );

            // Search query (title or description)
            if (query.trim()) {
                // This is a simplified search - in production, you might want to use full-text search
                const searchTerm = `%${query.toLowerCase()}%`;
                whereConditions.push(
                    or(
                        // Note: You might need to adjust this based on your database's text search capabilities
                        eq(events.title, searchTerm),
                        eq(events.description, searchTerm),
                        eq(events.location, searchTerm)
                    )
                );
            }

            // Apply filters
            if (filters?.categoryId) {
                whereConditions.push(eq(events.categoryId, filters.categoryId));
            }

            if (filters?.privacyLevel) {
                whereConditions.push(
                    eq(events.privacyLevel, filters.privacyLevel)
                );
            }

            if (filters?.startDate) {
                whereConditions.push(gte(events.startTime, filters.startDate));
            }

            if (filters?.endDate) {
                whereConditions.push(lte(events.startTime, filters.endDate));
            }

            if (filters?.location) {
                const locationTerm = `%${filters.location.toLowerCase()}%`;
                whereConditions.push(eq(events.location, locationTerm));
            }

            const searchResults = await db.query.events.findMany({
                where: and(...whereConditions),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    eventCategory: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    eventParticipants: {
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
                orderBy: [asc(events.startTime)],
                limit: 50, // Limit search results
            });

            return searchResults.map((event) => {
                const participants = event.eventParticipants || [];
                const participantCounts = {
                    total: participants.length,
                    going: participants.filter((p) => p.status === 'going')
                        .length,
                    declined: participants.filter(
                        (p) => p.status === 'declined'
                    ).length,
                    invited: participants.filter((p) => p.status === 'invited')
                        .length,
                };

                const currentUserParticipant = participants.find(
                    (p) => p.userId === userId
                );

                return {
                    id: event.id,
                    organizerId: event.organizerId,
                    categoryId: event.categoryId,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    privacyLevel: event.privacyLevel as
                        | 'public'
                        | 'friends'
                        | 'private',
                    maxParticipants: event.maxParticipants,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    organizer: event.user,
                    category: event.eventCategory,
                    participants: participants.map((p) => ({
                        id: p.id,
                        userId: p.userId,
                        status: p.status as 'invited' | 'going' | 'declined',
                        createdAt: p.createdAt,
                        user: p.user,
                    })),
                    participantCounts,
                    currentUserStatus: currentUserParticipant
                        ? (currentUserParticipant.status as
                              | 'invited'
                              | 'going'
                              | 'declined')
                        : 'not_invited',
                    canEdit: userId === event.organizerId,
                };
            });
        } catch (error) {
            console.error('Search events error:', error);
            throw error;
        }
    }

    // Helper method to check if user can view an event
    private async canUserViewEvent(
        event: any,
        userId: number
    ): Promise<boolean> {
        if (event.privacyLevel === 'public') {
            return true;
        }

        if (event.organizerId === userId) {
            return true;
        }

        if (event.privacyLevel === 'friends') {
            const friendshipStatus =
                await this.friendshipService.getFriendshipStatus(
                    userId,
                    event.organizerId
                );
            return friendshipStatus === 'accepted';
        }

        if (event.privacyLevel === 'private') {
            // Check if user is invited
            const participant = await db.query.eventParticipants.findFirst({
                where: and(
                    eq(eventParticipants.eventId, event.id),
                    eq(eventParticipants.userId, userId)
                ),
            });
            return !!participant;
        }

        return false;
    }

    // Additional utility methods
    async getEventCategories(): Promise<
        Array<{ id: number; name: string; description?: string | null }>
    > {
        try {
            return await db.query.eventCategories.findMany({
                orderBy: [asc(eventCategories.name)],
            });
        } catch (error) {
            console.error('Get event categories error:', error);
            throw error;
        }
    }

    async createEventCategory(
        name: string,
        description?: string
    ): Promise<{ id: number; name: string; description?: string | null }> {
        try {
            const [category] = await db
                .insert(eventCategories)
                .values({
                    name: name.trim(),
                    description: description?.trim() || null,
                })
                .returning();

            if (!category) {
                throw new Error('Failed to create event category');
            }

            return category;
        } catch (error) {
            console.error('Create event category error:', error);
            throw error;
        }
    }

    async joinPublicEvent(userId: number, eventId: number): Promise<void> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            // Check if user can join this event based on privacy level
            if (event.privacyLevel === 'private') {
                const NotJoinableEvent = createError(
                    'NOT_JOINABLE_EVENT',
                    'This is a private event - you must be invited to join',
                    400
                );
                throw new NotJoinableEvent();
            }

            // For friends events, check if user is actually a friend of the organizer
            if (event.privacyLevel === 'friends') {
                const friendshipStatus =
                    await this.friendshipService.getFriendshipStatus(
                        userId,
                        event.organizerId
                    );

                if (
                    friendshipStatus !== 'accepted' &&
                    event.organizerId !== userId
                ) {
                    const NotFriendEvent = createError(
                        'NOT_FRIEND_EVENT',
                        'This is a friends-only event - you must be friends with the organizer to join',
                        403
                    );
                    throw new NotFriendEvent();
                }
            }

            // Check if user is already a participant
            const existingParticipant =
                await db.query.eventParticipants.findFirst({
                    where: and(
                        eq(eventParticipants.eventId, eventId),
                        eq(eventParticipants.userId, userId)
                    ),
                });

            if (existingParticipant) {
                // If already invited, update status to going
                if (
                    existingParticipant.status === 'invited' ||
                    existingParticipant.status === 'declined'
                ) {
                    await this.respondToEventInvitation(
                        userId,
                        eventId,
                        'going'
                    );
                }
                return;
            }

            // Check if event has reached max participants
            if (event.maxParticipants) {
                const goingParticipants =
                    await db.query.eventParticipants.findMany({
                        where: and(
                            eq(eventParticipants.eventId, eventId),
                            eq(eventParticipants.status, 'going')
                        ),
                    });

                if (goingParticipants.length >= event.maxParticipants) {
                    const MaxCapacityReached = createError(
                        'MAX_CAPACITY_REACHED',
                        'Event has reached maximum capacity',
                        400
                    );
                    throw new MaxCapacityReached();
                }
            }

            // Add user as participant with 'going' status
            await db.insert(eventParticipants).values({
                eventId,
                userId,
                status: 'going',
            });
        } catch (error) {
            console.error('Join event error:', error);
            throw error;
        }
    }

    async leaveEvent(userId: number, eventId: number): Promise<void> {
        try {
            const event = await db.query.events.findFirst({
                where: eq(events.id, eventId),
            });

            if (!event) {
                const EventNotFound = createError(
                    'EVENT_NOT_FOUND',
                    'Event not found',
                    404
                );
                throw new EventNotFound();
            }

            // Don't allow organizer to leave their own event
            if (event.organizerId === userId) {
                const CannotLeaveOwnEvent = createError(
                    'CANNOT_LEAVE_OWN_EVENT',
                    'Event organizer cannot leave their own event',
                    400
                );
                throw new CannotLeaveOwnEvent();
            }

            const participant = await db.query.eventParticipants.findFirst({
                where: and(
                    eq(eventParticipants.eventId, eventId),
                    eq(eventParticipants.userId, userId)
                ),
            });

            if (!participant) {
                const ParticipantNotFound = createError(
                    'PARTICIPANT_NOT_FOUND',
                    'You are not a participant of this event',
                    404
                );
                throw new ParticipantNotFound();
            }

            await db
                .delete(eventParticipants)
                .where(eq(eventParticipants.id, participant.id));
        } catch (error) {
            console.error('Leave event error:', error);
            throw error;
        }
    }
}
