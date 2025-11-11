import { FastifyInstance } from 'fastify';
import { ExploreController } from './explore.controller';
import { ExploreRouteSchemas } from './explore.schema';
import { AuthService } from '@/auth/auth.service';
import { createAuthGuard } from '@/hooks/authGuard';

export async function exploreRoutes(fastify: FastifyInstance) {
    const exploreController = new ExploreController();
    const authService = new AuthService();

    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    // Get potential friends
    fastify.get(
        '/friends/potential',
        {
            schema: {
                ...ExploreRouteSchemas.getPotentialFriends,
                tags: ['Explore'],
                summary:
                    'Get potential friends based on mutual connections and interests',
                description:
                    'Returns a list of potential friends with match scores based on mutual friends, shared interests, and location.',
            },
        },
        exploreController.getPotentialFriends.bind(exploreController)
    );

    // Get recommended events
    fastify.get(
        '/events/recommended',
        {
            schema: {
                ...ExploreRouteSchemas.getRecommendedEvents,
                tags: ['Explore'],
                summary: 'Get recommended events',
                description:
                    'Returns personalized event recommendations based on user interests and social connections.',
            },
        },
        exploreController.getRecommendedEvents.bind(exploreController)
    );

    // Get trending content
    fastify.get(
        '/trending',
        {
            schema: {
                ...ExploreRouteSchemas.getTrendingContent,
                tags: ['Explore'],
                summary: 'Get trending content',
                description:
                    'Returns trending posts and events based on engagement metrics.',
            },
        },
        exploreController.getTrendingContent.bind(exploreController)
    );

    // Search people
    fastify.get(
        '/people/search',
        {
            schema: {
                ...ExploreRouteSchemas.searchPeople,
                tags: ['Explore'],
                summary: 'Search for people',
                description: 'Search for users by name with optional filters.',
            },
        },
        exploreController.searchPeople.bind(exploreController)
    );

    // Get interest-based recommendations
    fastify.get(
        '/recommendations/interests',
        {
            schema: {
                ...ExploreRouteSchemas.getInterestBased,
                tags: ['Explore'],
                summary: 'Get interest-based recommendations',
                description:
                    'Returns friend and event recommendations based on user interests.',
            },
        },
        exploreController.getInterestBasedRecommendations.bind(
            exploreController
        )
    );

    // Get explore stats
    fastify.get(
        '/stats',
        {
            schema: {
                ...ExploreRouteSchemas.getExploreStats,
                tags: ['Explore'],
                summary: 'Get explore statistics',
                description:
                    'Returns statistics about available content in explore section.',
            },
        },
        exploreController.getExploreStats.bind(exploreController)
    );

    // Get popular interests
    fastify.get(
        '/interests/popular',
        {
            schema: {
                ...ExploreRouteSchemas.getPopularInterests,
                tags: ['Explore'],
                summary: 'Get popular interests',
                description: 'Returns most popular interests among users.',
            },
        },
        async (_, reply) => {
            reply.code(200).send({
                success: true,
                data: [],
            });
        }
    );

    // Get location-based suggestions
    fastify.get(
        '/locations/popular',
        {
            schema: {
                ...ExploreRouteSchemas.getLocationSuggestions,
                tags: ['Explore'],
                summary: 'Get popular locations',
                description: 'Returns popular cities and regions among users.',
            },
        },
        async (_, reply) => {
            reply.code(200).send({
                success: true,
                data: {
                    cities: [],
                    regions: [],
                },
            });
        }
    );
}
