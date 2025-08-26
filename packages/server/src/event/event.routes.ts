import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import { EventController } from './event.controller';
import { AuthService } from '../auth/auth.service';
import { createAuthGuard } from '../hooks/authGuard';

export async function eventRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const eventController = new EventController();

    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    // Create event
    fastify.post(
        '/create',
        {
            schema: {
                description: 'Create a new event',
                tags: ['Events'],
                body: Type.Object({
                    title: Type.String({ minLength: 1, maxLength: 255 }),
                    description: Type.Optional(
                        Type.String({ maxLength: 1000 })
                    ),
                    location: Type.Optional(Type.String({ maxLength: 255 })),
                    startTime: Type.String({ format: 'date-time' }),
                    endTime: Type.Optional(
                        Type.String({ format: 'date-time' })
                    ),
                    categoryId: Type.Optional(Type.Number({ minimum: 1 })),
                    privacyLevel: Type.Union([
                        Type.Literal('public'),
                        Type.Literal('friends'),
                        Type.Literal('private'),
                    ]),
                    maxParticipants: Type.Optional(Type.Number({ minimum: 1 })),
                    invitedFriends: Type.Optional(
                        Type.Array(Type.Number({ minimum: 1 }))
                    ),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Body: {
                    title: string;
                    description?: string;
                    location?: string;
                    startTime: string;
                    endTime?: string;
                    categoryId?: number;
                    privacyLevel: 'public' | 'friends' | 'private';
                    maxParticipants?: number;
                    invitedFriends?: number[];
                };
            }>,
            reply: FastifyReply
        ) => eventController.createEvent(req, reply)
    );

    // Update event
    fastify.put(
        '/:eventId',
        {
            schema: {
                description: 'Update an existing event',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
                body: Type.Object({
                    title: Type.Optional(
                        Type.String({ minLength: 1, maxLength: 255 })
                    ),
                    description: Type.Optional(
                        Type.String({ maxLength: 1000 })
                    ),
                    location: Type.Optional(Type.String({ maxLength: 255 })),
                    startTime: Type.Optional(
                        Type.String({ format: 'date-time' })
                    ),
                    endTime: Type.Optional(
                        Type.String({ format: 'date-time' })
                    ),
                    categoryId: Type.Optional(Type.Number({ minimum: 1 })),
                    privacyLevel: Type.Optional(
                        Type.Union([
                            Type.Literal('public'),
                            Type.Literal('friends'),
                            Type.Literal('private'),
                        ])
                    ),
                    maxParticipants: Type.Optional(Type.Number({ minimum: 1 })),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
                Body: {
                    title?: string;
                    description?: string;
                    location?: string;
                    startTime?: string;
                    endTime?: string;
                    categoryId?: number;
                    privacyLevel?: 'public' | 'friends' | 'private';
                    maxParticipants?: number;
                };
            }>,
            reply: FastifyReply
        ) => eventController.updateEvent(req, reply)
    );

    // Delete event
    fastify.delete(
        '/:eventId',
        {
            schema: {
                description: 'Delete an event',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
            }>,
            reply: FastifyReply
        ) => eventController.deleteEvent(req, reply)
    );

    // Get event by ID (no auth required for public events)
    fastify.get(
        '/:eventId',
        {
            preHandler: [], // Override the auth hook for this route
            schema: {
                description: 'Get event by ID',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
            }>,
            reply: FastifyReply
        ) => eventController.getEvent(req, reply)
    );

    // Get public events
    fastify.get(
        '/',
        {
            schema: {
                description: 'Get public events',
                tags: ['Events'],
                querystring: Type.Object({
                    limit: Type.Optional(Type.String()),
                    categoryId: Type.Optional(Type.String()),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: {
                    limit?: string;
                    categoryId?: string;
                };
            }>,
            reply: FastifyReply
        ) => eventController.getPublicEvents(req, reply)
    );

    // Search events
    fastify.get(
        '/search',
        {
            schema: {
                description: 'Search events',
                tags: ['Events'],
                querystring: Type.Object({
                    query: Type.String({ minLength: 1 }),
                    categoryId: Type.Optional(Type.String()),
                    privacyLevel: Type.Optional(
                        Type.Union([
                            Type.Literal('public'),
                            Type.Literal('friends'),
                            Type.Literal('private'),
                        ])
                    ),
                    startDate: Type.Optional(
                        Type.String({ format: 'date-time' })
                    ),
                    endDate: Type.Optional(
                        Type.String({ format: 'date-time' })
                    ),
                    location: Type.Optional(Type.String()),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: {
                    query: string;
                    categoryId?: string;
                    privacyLevel?: 'public' | 'friends' | 'private';
                    startDate?: string;
                    endDate?: string;
                    location?: string;
                };
            }>,
            reply: FastifyReply
        ) => eventController.searchEvents(req, reply)
    );

    // Get upcoming events
    fastify.get(
        '/upcoming',
        {
            schema: {
                description: 'Get upcoming events for current user',
                tags: ['Events'],
                querystring: Type.Object({
                    limit: Type.Optional(Type.String()),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: {
                    limit?: string;
                };
            }>,
            reply: FastifyReply
        ) => eventController.getUpcomingEvents(req, reply)
    );

    // Get user's events
    fastify.get(
        '/users/:userId/events',
        {
            schema: {
                description: 'Get events created by a specific user',
                tags: ['Events'],
                params: Type.Object({
                    userId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { userId: string };
            }>,
            reply: FastifyReply
        ) => eventController.getUserEvents(req, reply)
    );

    // Get current user's events
    fastify.get(
        '/my',
        {
            schema: {
                description: "Get current user's events",
                tags: ['Events'],
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) =>
            eventController.getMyEvents(req, reply)
    );

    // Invite users to event
    fastify.post(
        '/:eventId/invite',
        {
            schema: {
                description: 'Invite users to an event',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
                body: Type.Object({
                    userIds: Type.Array(Type.Number({ minimum: 1 }), {
                        minItems: 1,
                    }),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
                Body: { userIds: number[] };
            }>,
            reply: FastifyReply
        ) => eventController.inviteUsers(req, reply)
    );

    // Respond to event invitation
    fastify.post(
        '/:eventId/respond',
        {
            schema: {
                description: 'Respond to an event invitation',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
                body: Type.Object({
                    status: Type.Union([
                        Type.Literal('going'),
                        Type.Literal('declined'),
                    ]),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
                Body: { status: 'going' | 'declined' };
            }>,
            reply: FastifyReply
        ) => eventController.respondToInvitation(req, reply)
    );

    // Join public event
    fastify.post(
        '/:eventId/join',
        {
            schema: {
                description: 'Join a public event',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
            }>,
            reply: FastifyReply
        ) => eventController.joinEvent(req, reply)
    );

    // Leave event
    fastify.delete(
        '/:eventId/leave',
        {
            schema: {
                description: 'Leave an event',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
            }>,
            reply: FastifyReply
        ) => eventController.leaveEvent(req, reply)
    );

    // Remove participant from event
    fastify.delete(
        '/:eventId/participants/:participantId',
        {
            schema: {
                description:
                    'Remove a participant from an event (organizer only)',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                    participantId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string; participantId: string };
            }>,
            reply: FastifyReply
        ) => eventController.removeParticipant(req, reply)
    );

    // Get event participants
    fastify.get(
        '/:eventId/participants',
        {
            preHandler: [], // Override auth for this route to allow public access
            schema: {
                description: 'Get event participants',
                tags: ['Events'],
                params: Type.Object({
                    eventId: Type.String(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { eventId: string };
            }>,
            reply: FastifyReply
        ) => eventController.getEventParticipants(req, reply)
    );

    // Get event categories (public)
    fastify.get(
        '/categories',
        {
            preHandler: [], // No auth required
            schema: {
                description: 'Get all event categories',
                tags: ['Event Categories'],
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) =>
            eventController.getEventCategories(req, reply)
    );

    // Create event category (admin only)
    fastify.post(
        '/categories',
        {
            schema: {
                description: 'Create a new event category (admin only)',
                tags: ['Event Categories'],
                body: Type.Object({
                    name: Type.String({ minLength: 1, maxLength: 100 }),
                    description: Type.Optional(Type.String({ maxLength: 500 })),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Body: {
                    name: string;
                    description?: string;
                };
            }>,
            reply: FastifyReply
        ) => eventController.createEventCategory(req, reply)
    );
}
