import { Type, Static } from '@sinclair/typebox';

// Request query schemas
const GetPotentialFriendsQuerySchema = Type.Object({
    limit: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
    city: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    region: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    interests: Type.Optional(Type.String({ pattern: '^\\d+(,\\d+)*$' })),
    minAge: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
    maxAge: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
    gender: Type.Optional(
        Type.Union([Type.Literal('male'), Type.Literal('female')])
    ),
});

const GetRecommendedEventsQuerySchema = Type.Object({
    limit: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
    categoryId: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
    location: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
    privacyLevel: Type.Optional(
        Type.Union([Type.Literal('public'), Type.Literal('friends')])
    ),
});

const GetTrendingContentQuerySchema = Type.Object({
    limit: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
});

const SearchPeopleQuerySchema = Type.Object({
    q: Type.String({ minLength: 2, maxLength: 100 }),
    city: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    region: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    gender: Type.Optional(
        Type.Union([Type.Literal('male'), Type.Literal('female')])
    ),
});

const GetInterestBasedQuerySchema = Type.Object({
    limit: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
});

const GetPopularInterestsQuerySchema = Type.Object({
    limit: Type.Optional(Type.String({ pattern: '^[1-9]\\d*$' })),
});

// Response schemas
const ErrorResponseSchema = Type.Object({
    success: Type.Literal(false),
    error: Type.String(),
    code: Type.Optional(Type.String()),
});

const PaginationSchema = Type.Object({
    count: Type.Number(),
    limit: Type.Number(),
});

const InterestSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
});

const PotentialFriendSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    surname: Type.String(),
    profilePictureUrl: Type.Union([Type.String(), Type.Null()]),
    bio: Type.Union([Type.String(), Type.Null()]),
    city: Type.Union([Type.String(), Type.Null()]),
    region: Type.Union([Type.String(), Type.Null()]),
    mutualFriendsCount: Type.Number(),
    mutualInterestsCount: Type.Number(),
    matchScore: Type.Number(),
    commonInterests: Type.Array(InterestSchema),
});

const UserBasicSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    surname: Type.String(),
    profilePictureUrl: Type.Union([Type.String(), Type.Null()]),
});

const TrendingPostSchema = Type.Object({
    id: Type.Number(),
    userId: Type.Number(),
    content: Type.String(),
    contentType: Type.String(),
    contentUrl: Type.String(),
    privacyLevel: Type.String(),
    createdAt: Type.String(),
    user: UserBasicSchema,
    likeCount: Type.Number(),
    commentCount: Type.Number(),
    isLiked: Type.Boolean(),
});

const TrendingContentSchema = Type.Object({
    posts: Type.Array(TrendingPostSchema),
    events: Type.Array(Type.Any()), // Simplified to avoid circular refs
});

const InterestBasedRecommendationsSchema = Type.Object({
    friends: Type.Array(PotentialFriendSchema),
    events: Type.Array(Type.Any()), // Simplified to avoid circular refs
});

const ExploreStatsSchema = Type.Object({
    potentialFriendsCount: Type.Number(),
    upcomingEventsCount: Type.Number(),
    userInterestsCount: Type.Number(),
});

const PopularInterestSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    userCount: Type.Number(),
});

const LocationSuggestionsSchema = Type.Object({
    cities: Type.Array(
        Type.Object({
            name: Type.String(),
            userCount: Type.Number(),
        })
    ),
    regions: Type.Array(
        Type.Object({
            name: Type.String(),
            userCount: Type.Number(),
        })
    ),
});

// Success response wrappers
const SuccessResponse = <T>(dataSchema: T) =>
    Type.Object({
        success: Type.Literal(true),
        data: dataSchema,
    });

const PaginatedResponse = <T>(dataSchema: T) =>
    Type.Object({
        success: Type.Literal(true),
        data: dataSchema,
        pagination: PaginationSchema,
    });

const SearchResponse = <T>(dataSchema: T) =>
    Type.Object({
        success: Type.Literal(true),
        data: dataSchema,
        query: Type.String(),
    });

const InterestBasedPaginatedResponse = Type.Object({
    success: Type.Literal(true),
    data: InterestBasedRecommendationsSchema,
    pagination: Type.Object({
        friendsCount: Type.Number(),
        eventsCount: Type.Number(),
        limit: Type.Number(),
    }),
});

// Common error responses
const CommonErrorResponses = {
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema,
};

// Route schemas for Fastify
export const ExploreRouteSchemas = {
    getPotentialFriends: {
        querystring: GetPotentialFriendsQuerySchema,
        response: {
            200: PaginatedResponse(Type.Array(PotentialFriendSchema)),
            ...CommonErrorResponses,
        },
    },

    getRecommendedEvents: {
        querystring: GetRecommendedEventsQuerySchema,
        response: {
            200: PaginatedResponse(Type.Array(Type.Any())), // Using Any for EventWithDetails
            ...CommonErrorResponses,
        },
    },

    getTrendingContent: {
        querystring: GetTrendingContentQuerySchema,
        response: {
            200: SuccessResponse(TrendingContentSchema),
            ...CommonErrorResponses,
        },
    },

    searchPeople: {
        querystring: SearchPeopleQuerySchema,
        response: {
            200: SearchResponse(Type.Array(PotentialFriendSchema)),
            ...CommonErrorResponses,
        },
    },

    getInterestBased: {
        querystring: GetInterestBasedQuerySchema,
        response: {
            200: InterestBasedPaginatedResponse,
            ...CommonErrorResponses,
        },
    },

    getExploreStats: {
        response: {
            200: SuccessResponse(ExploreStatsSchema),
            ...CommonErrorResponses,
        },
    },

    getPopularInterests: {
        querystring: GetPopularInterestsQuerySchema,
        response: {
            200: SuccessResponse(Type.Array(PopularInterestSchema)),
            ...CommonErrorResponses,
        },
    },

    getLocationSuggestions: {
        response: {
            200: SuccessResponse(LocationSuggestionsSchema),
            ...CommonErrorResponses,
        },
    },
};

// TypeScript types from schemas
export type GetPotentialFriendsQuery = Static<
    typeof GetPotentialFriendsQuerySchema
>;
export type GetRecommendedEventsQuery = Static<
    typeof GetRecommendedEventsQuerySchema
>;
export type GetTrendingContentQuery = Static<
    typeof GetTrendingContentQuerySchema
>;
export type SearchPeopleQuery = Static<typeof SearchPeopleQuerySchema>;
export type GetInterestBasedQuery = Static<typeof GetInterestBasedQuerySchema>;
export type GetPopularInterestsQuery = Static<
    typeof GetPopularInterestsQuerySchema
>;

export type PotentialFriend = Static<typeof PotentialFriendSchema>;
export type TrendingPost = Static<typeof TrendingPostSchema>;
export type TrendingContent = Static<typeof TrendingContentSchema>;
export type InterestBasedRecommendations = Static<
    typeof InterestBasedRecommendationsSchema
>;
export type ExploreStats = Static<typeof ExploreStatsSchema>;
export type PopularInterest = Static<typeof PopularInterestSchema>;
export type LocationSuggestions = Static<typeof LocationSuggestionsSchema>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
