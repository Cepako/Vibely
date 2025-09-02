import { FastifyReply, FastifyRequest } from 'fastify';
import { ExploreService } from './explore.service';
import createError from '@fastify/error';
import {
    GetPotentialFriendsQuery,
    GetRecommendedEventsQuery,
    GetTrendingContentQuery,
    SearchPeopleQuery,
    GetInterestBasedQuery,
} from './explore.schema';

export class ExploreController {
    private exploreService: ExploreService;

    constructor() {
        this.exploreService = new ExploreService();
    }

    async getPotentialFriends(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            const query = request.query as GetPotentialFriendsQuery;
            const limit = parseInt(query.limit || '20');

            // Validate limit
            if (limit <= 0 || limit > 100) {
                const InvalidLimit = createError(
                    'INVALID_LIMIT',
                    'Limit must be between 1 and 100',
                    400
                );
                throw new InvalidLimit();
            }

            // Parse interests array if provided
            let interests: number[] | undefined;
            if (query.interests) {
                try {
                    interests = query.interests
                        .split(',')
                        .map((id) => parseInt(id.trim()));
                    if (interests.some((id) => isNaN(id))) {
                        throw new Error('Invalid interest ID format');
                    }
                } catch (error) {
                    const InvalidInterests = createError(
                        'INVALID_INTERESTS',
                        'Interest IDs must be comma-separated numbers',
                        400
                    );
                    throw new InvalidInterests();
                }
            }

            // Parse age range
            let ageRange: { min?: number; max?: number } | undefined;
            if (query.minAge || query.maxAge) {
                ageRange = {};
                if (query.minAge) {
                    const minAge = parseInt(query.minAge);
                    if (isNaN(minAge) || minAge < 13 || minAge > 120) {
                        const InvalidMinAge = createError(
                            'INVALID_MIN_AGE',
                            'Minimum age must be between 13 and 120',
                            400
                        );
                        throw new InvalidMinAge();
                    }
                    ageRange.min = minAge;
                }
                if (query.maxAge) {
                    const maxAge = parseInt(query.maxAge);
                    if (isNaN(maxAge) || maxAge < 13 || maxAge > 120) {
                        const InvalidMaxAge = createError(
                            'INVALID_MAX_AGE',
                            'Maximum age must be between 13 and 120',
                            400
                        );
                        throw new InvalidMaxAge();
                    }
                    ageRange.max = maxAge;
                }

                if (
                    ageRange.min &&
                    ageRange.max &&
                    ageRange.min >= ageRange.max
                ) {
                    const InvalidAgeRange = createError(
                        'INVALID_AGE_RANGE',
                        'Minimum age must be less than maximum age',
                        400
                    );
                    throw new InvalidAgeRange();
                }
            }

            const filters = {
                location: {
                    city: query.city?.trim(),
                    region: query.region?.trim(),
                },
                interests,
                ageRange,
                gender: query.gender,
            };

            const potentialFriends =
                await this.exploreService.getPotentialFriends(
                    request.user.id,
                    limit,
                    filters
                );

            reply.code(200).send({
                success: true,
                data: potentialFriends,
                pagination: {
                    count: potentialFriends.length,
                    limit,
                },
            });
        } catch (error: any) {
            console.error('Get potential friends controller error:', error);

            if (error.statusCode) {
                reply.code(error.statusCode).send({
                    success: false,
                    error: error.message,
                    code: error.code,
                });
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    }

    async getRecommendedEvents(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            const query = request.query as GetRecommendedEventsQuery;
            const limit = parseInt(query.limit || '20');

            if (limit <= 0 || limit > 100) {
                const InvalidLimit = createError(
                    'INVALID_LIMIT',
                    'Limit must be between 1 and 100',
                    400
                );
                throw new InvalidLimit();
            }

            // Parse and validate categoryId if provided
            let categoryId: number | undefined;
            if (query.categoryId) {
                categoryId = parseInt(query.categoryId);
                if (isNaN(categoryId)) {
                    const InvalidCategoryId = createError(
                        'INVALID_CATEGORY_ID',
                        'Category ID must be a valid number',
                        400
                    );
                    throw new InvalidCategoryId();
                }
            }

            // Validate date formats if provided
            if (query.startDate && isNaN(Date.parse(query.startDate))) {
                const InvalidStartDate = createError(
                    'INVALID_START_DATE',
                    'Start date must be a valid ISO date string',
                    400
                );
                throw new InvalidStartDate();
            }

            if (query.endDate && isNaN(Date.parse(query.endDate))) {
                const InvalidEndDate = createError(
                    'INVALID_END_DATE',
                    'End date must be a valid ISO date string',
                    400
                );
                throw new InvalidEndDate();
            }

            const filters = {
                categoryId,
                location: query.location?.trim(),
                dateRange:
                    query.startDate || query.endDate
                        ? {
                              start: query.startDate,
                              end: query.endDate,
                          }
                        : undefined,
                privacyLevel: query.privacyLevel,
            };

            const recommendedEvents =
                await this.exploreService.getRecommendedEvents(
                    request.user.id,
                    limit,
                    filters
                );

            reply.code(200).send({
                success: true,
                data: recommendedEvents,
                pagination: {
                    count: recommendedEvents.length,
                    limit,
                },
            });
        } catch (error: any) {
            console.error('Get recommended events controller error:', error);

            if (error.statusCode) {
                reply.code(error.statusCode).send({
                    success: false,
                    error: error.message,
                    code: error.code,
                });
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    }

    async getTrendingContent(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            const query = request.query as GetTrendingContentQuery;
            const limit = parseInt(query.limit || '10');

            if (limit <= 0 || limit > 50) {
                const InvalidLimit = createError(
                    'INVALID_LIMIT',
                    'Limit must be between 1 and 50',
                    400
                );
                throw new InvalidLimit();
            }

            const trendingContent =
                await this.exploreService.getTrendingContent(
                    request.user.id,
                    limit
                );

            reply.code(200).send({
                success: true,
                data: trendingContent,
            });
        } catch (error: any) {
            console.error('Get trending content controller error:', error);

            if (error.statusCode) {
                reply.code(error.statusCode).send({
                    success: false,
                    error: error.message,
                    code: error.code,
                });
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    }

    async searchPeople(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            const query = request.query as SearchPeopleQuery;

            if (!query.q || !query.q.trim()) {
                const MissingQuery = createError(
                    'MISSING_QUERY',
                    'Search query is required',
                    400
                );
                throw new MissingQuery();
            }

            if (query.q.trim().length < 2) {
                const InvalidQuery = createError(
                    'INVALID_QUERY',
                    'Search query must be at least 2 characters long',
                    400
                );
                throw new InvalidQuery();
            }

            const filters = {
                location: {
                    city: query.city?.trim(),
                    region: query.region?.trim(),
                },
                gender: query.gender,
            };

            const searchResults = await this.exploreService.searchPeople(
                request.user.id,
                query.q.trim(),
                filters
            );

            reply.code(200).send({
                success: true,
                data: searchResults,
                query: query.q.trim(),
            });
        } catch (error: any) {
            console.error('Search people controller error:', error);

            if (error.statusCode) {
                reply.code(error.statusCode).send({
                    success: false,
                    error: error.message,
                    code: error.code,
                });
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    }

    async getInterestBasedRecommendations(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            const query = request.query as GetInterestBasedQuery;
            const limit = parseInt(query.limit || '10');

            if (limit <= 0 || limit > 50) {
                const InvalidLimit = createError(
                    'INVALID_LIMIT',
                    'Limit must be between 1 and 50',
                    400
                );
                throw new InvalidLimit();
            }

            const recommendations =
                await this.exploreService.getInterestBasedRecommendations(
                    request.user.id,
                    limit
                );

            reply.code(200).send({
                success: true,
                data: recommendations,
                pagination: {
                    friendsCount: recommendations.friends.length,
                    eventsCount: recommendations.events.length,
                    limit,
                },
            });
        } catch (error: any) {
            console.error(
                'Get interest-based recommendations controller error:',
                error
            );

            if (error.statusCode) {
                reply.code(error.statusCode).send({
                    success: false,
                    error: error.message,
                    code: error.code,
                });
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    }

    // Additional utility endpoints
    async getExploreStats(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            if (!request.user) {
                const Unauthorized = createError(
                    'UNAUTHORIZED',
                    'Authentication required',
                    401
                );
                throw new Unauthorized();
            }

            // This could include stats like:
            // - Number of potential friends available
            // - Number of upcoming events
            // - User's interests count
            // etc.

            const stats = {
                potentialFriendsCount: 0, // Would need to implement count query
                upcomingEventsCount: 0, // Would need to implement count query
                userInterestsCount: 0, // Would need to implement count query
            };

            reply.code(200).send({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            console.error('Get explore stats controller error:', error);
            reply.code(500).send({
                success: false,
                error: 'Internal server error',
            });
        }
    }
}
