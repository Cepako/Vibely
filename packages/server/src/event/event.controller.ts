import { FastifyRequest, FastifyReply } from 'fastify';
import {
    EventService,
    CreateEventData,
    UpdateEventData,
    EventSearchFilters,
} from './event.service';

export class EventController {
    private eventService: EventService;

    constructor() {
        this.eventService = new EventService();
    }

    // Create a new event
    async createEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const data = request.body as CreateEventData;

            // Validate required fields
            if (!data.title || !data.startTime || !data.privacyLevel) {
                return reply.status(400).send({
                    error: 'Missing required fields: title, startTime, privacyLevel',
                });
            }

            const event = await this.eventService.createEvent(userId, data);

            reply.status(201).send({
                success: true,
                data: event,
                message: 'Event created successfully',
            });
        } catch (error: any) {
            console.error('Create event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to create event',
            });
        }
    }

    // Update an existing event
    async updateEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };
            const data = request.body as UpdateEventData;

            const event = await this.eventService.updateEvent(
                userId,
                parseInt(eventId),
                data
            );

            reply.status(200).send({
                success: true,
                data: event,
                message: 'Event updated successfully',
            });
        } catch (error: any) {
            console.error('Update event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to update event',
            });
        }
    }

    // Delete an event
    async deleteEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };

            await this.eventService.deleteEvent(userId, parseInt(eventId));

            reply.status(200).send({
                success: true,
                message: 'Event deleted successfully',
            });
        } catch (error: any) {
            console.error('Delete event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to delete event',
            });
        }
    }

    // Get event by ID
    async getEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any)?.id;
            const { eventId } = request.params as { eventId: string };

            const event = await this.eventService.getEventById(
                parseInt(eventId),
                userId
            );

            if (!event) {
                return reply.status(404).send({
                    error: 'Event not found',
                });
            }

            reply.status(200).send({
                success: true,
                data: event,
            });
        } catch (error: any) {
            console.error('Get event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get event',
            });
        }
    }

    // Get user's events
    async getUserEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const currentUserId = (request.user as any).id;
            const { userId } = request.params as { userId: string };

            const events = await this.eventService.getUserEvents(
                parseInt(userId),
                currentUserId
            );

            reply.status(200).send({
                success: true,
                data: events,
            });
        } catch (error: any) {
            console.error('Get user events controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get user events',
            });
        }
    }

    // Get current user's events
    async getMyEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;

            const events = await this.eventService.getUserEvents(
                userId,
                userId
            );

            reply.status(200).send({
                success: true,
                data: events,
            });
        } catch (error: any) {
            console.error('Get my events controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get events',
            });
        }
    }

    // Get upcoming events for current user
    async getUpcomingEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { limit } = request.query as { limit?: string };

            const events = await this.eventService.getUpcomingEvents(
                userId,
                limit ? parseInt(limit) : 20
            );

            reply.status(200).send({
                success: true,
                data: events,
            });
        } catch (error: any) {
            console.error('Get upcoming events controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get upcoming events',
            });
        }
    }

    // Get public events
    async getPublicEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { limit, categoryId } = request.query as {
                limit?: string;
                categoryId?: string;
            };

            const events = await this.eventService.getPublicEvents(
                userId,
                limit ? parseInt(limit) : 20,
                categoryId ? parseInt(categoryId) : undefined
            );

            reply.status(200).send({
                success: true,
                data: events,
            });
        } catch (error: any) {
            console.error('Get public events controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get public events',
            });
        }
    }

    // Invite users to event
    async inviteUsers(request: FastifyRequest, reply: FastifyReply) {
        try {
            const organizerId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };
            const { userIds } = request.body as { userIds: number[] };

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return reply.status(400).send({
                    error: 'userIds must be a non-empty array',
                });
            }

            await this.eventService.inviteUsersToEvent(
                organizerId,
                parseInt(eventId),
                userIds
            );

            reply.status(200).send({
                success: true,
                message: 'Users invited successfully',
            });
        } catch (error: any) {
            console.error('Invite users controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to invite users',
            });
        }
    }

    // Respond to event invitation
    async respondToInvitation(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };
            const { status } = request.body as { status: 'going' | 'declined' };

            if (!status || !['going', 'declined'].includes(status)) {
                return reply.status(400).send({
                    error: 'Status must be either "going" or "declined"',
                });
            }

            await this.eventService.respondToEventInvitation(
                userId,
                parseInt(eventId),
                status
            );

            reply.status(200).send({
                success: true,
                message: `Event invitation ${status === 'going' ? 'accepted' : 'declined'}`,
            });
        } catch (error: any) {
            console.error('Respond to invitation controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to respond to invitation',
            });
        }
    }

    // Remove participant from event
    async removeParticipant(request: FastifyRequest, reply: FastifyReply) {
        try {
            const organizerId = (request.user as any).id;
            const { eventId, participantId } = request.params as {
                eventId: string;
                participantId: string;
            };

            await this.eventService.removeParticipant(
                organizerId,
                parseInt(eventId),
                parseInt(participantId)
            );

            reply.status(200).send({
                success: true,
                message: 'Participant removed successfully',
            });
        } catch (error: any) {
            console.error('Remove participant controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to remove participant',
            });
        }
    }

    // Get event participants
    async getEventParticipants(request: FastifyRequest, reply: FastifyReply) {
        try {
            const currentUserId = (request.user as any)?.id;
            const { eventId } = request.params as { eventId: string };

            const participants = await this.eventService.getEventParticipants(
                parseInt(eventId),
                currentUserId
            );

            reply.status(200).send({
                success: true,
                data: participants,
            });
        } catch (error: any) {
            console.error('Get event participants controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get event participants',
            });
        }
    }

    // Search events
    async searchEvents(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const {
                query,
                categoryId,
                privacyLevel,
                startDate,
                endDate,
                location,
            } = request.query as {
                query?: string;
                categoryId?: string;
                privacyLevel?: 'public' | 'friends' | 'private';
                startDate?: string;
                endDate?: string;
                location?: string;
            };

            if (!query || query.trim().length === 0) {
                return reply.status(400).send({
                    error: 'Search query is required',
                });
            }

            const filters: EventSearchFilters = {};
            if (categoryId) filters.categoryId = parseInt(categoryId);
            if (privacyLevel) filters.privacyLevel = privacyLevel;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (location) filters.location = location;

            const events = await this.eventService.searchEvents(
                userId,
                query,
                filters
            );

            reply.status(200).send({
                success: true,
                data: events,
            });
        } catch (error: any) {
            console.error('Search events controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to search events',
            });
        }
    }

    // Join event
    async joinEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };

            await this.eventService.joinPublicEvent(userId, parseInt(eventId));

            reply.status(200).send({
                success: true,
                message: 'Successfully joined the event',
            });
        } catch (error: any) {
            console.error('Join public event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to join event',
            });
        }
    }

    // Leave event
    async leaveEvent(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request.user as any).id;
            const { eventId } = request.params as { eventId: string };

            await this.eventService.leaveEvent(userId, parseInt(eventId));

            reply.status(200).send({
                success: true,
                message: 'Successfully left the event',
            });
        } catch (error: any) {
            console.error('Leave event controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to leave event',
            });
        }
    }

    // Get event categories
    async getEventCategories(_: FastifyRequest, reply: FastifyReply) {
        try {
            const categories = await this.eventService.getEventCategories();

            reply.status(200).send({
                success: true,
                data: categories,
            });
        } catch (error: any) {
            console.error('Get event categories controller error:', error);
            reply.status(error.statusCode || 500).send({
                error: error.message || 'Failed to get event categories',
            });
        }
    }
}
