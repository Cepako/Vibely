import { db } from '../db';
import {
    users,
    friendships,
    events,
    eventParticipants,
    posts,
    userInterests,
} from '../db/schema';
import {
    and,
    eq,
    or,
    inArray,
    notInArray,
    desc,
    asc,
    gte,
    lte,
    sql,
} from 'drizzle-orm';
import { FriendshipService } from '../friendship/friendship.service';
import { EventService, EventWithDetails } from '../event/event.service';

interface PotentialFriend {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
    bio?: string | null;
    city?: string | null;
    region?: string | null;
    mutualFriendsCount: number;
    mutualInterestsCount: number;
    matchScore: number;
    commonInterests: Array<{
        id: number;
        name: string;
    }>;
}

interface ExploreFilters {
    location?: {
        city?: string;
        region?: string;
    };
    interests?: number[];
    ageRange?: {
        min?: number;
        max?: number;
    };
    gender?: 'male' | 'female';
}

interface EventFilters {
    categoryId?: number;
    location?: string;
    dateRange?: {
        start?: string;
        end?: string;
    };
    privacyLevel?: 'public' | 'friends';
}

interface TrendingPost {
    id: number;
    userId: number;
    content: string;
    contentType: string;
    contentUrl: string;
    privacyLevel: string;
    createdAt: string;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
}

interface TrendingContent {
    posts: TrendingPost[];
    events: EventWithDetails[];
}

interface IExploreService {
    getPotentialFriends(
        userId: number,
        limit?: number,
        filters?: ExploreFilters
    ): Promise<PotentialFriend[]>;
    getRecommendedEvents(
        userId: number,
        limit?: number,
        filters?: EventFilters
    ): Promise<EventWithDetails[]>;
    getTrendingContent(
        userId: number,
        limit?: number
    ): Promise<TrendingContent>;
    searchPeople(
        userId: number,
        query: string,
        filters?: ExploreFilters
    ): Promise<PotentialFriend[]>;
    getInterestBasedRecommendations(
        userId: number,
        limit?: number
    ): Promise<{
        friends: PotentialFriend[];
        events: EventWithDetails[];
    }>;
}

export class ExploreService implements IExploreService {
    private friendshipService: FriendshipService;
    private eventService: EventService;

    constructor() {
        this.friendshipService = new FriendshipService();
        this.eventService = new EventService();
    }

    async getPotentialFriends(
        userId: number,
        limit: number = 20,
        filters?: ExploreFilters
    ): Promise<PotentialFriend[]> {
        try {
            // Get user's existing relationships to exclude
            const existingRelationships = await db.query.friendships.findMany({
                where: or(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, userId)
                ),
            });

            const excludedUserIds = existingRelationships.map((rel) =>
                rel.userId === userId ? rel.friendId : rel.userId
            );
            excludedUserIds.push(userId); // Exclude self

            // Get user's interests for matching
            const currentUserInterests = await db.query.userInterests.findMany({
                where: eq(userInterests.userId, userId),
                with: {
                    interest: true,
                },
            });
            const userInterestIds = currentUserInterests.map(
                (ui) => ui.interestId
            );

            // Build base query conditions
            let whereConditions = [
                notInArray(users.id, excludedUserIds),
                eq(users.status, 'active'),
            ];

            // Apply filters
            if (filters?.location?.city) {
                whereConditions.push(eq(users.city, filters.location.city));
            }
            if (filters?.location?.region) {
                whereConditions.push(eq(users.region, filters.location.region));
            }
            if (filters?.gender) {
                whereConditions.push(eq(users.gender, filters.gender));
            }

            // Age filter (calculate from date of birth)
            if (filters?.ageRange?.min || filters?.ageRange?.max) {
                const today = new Date();
                if (filters.ageRange.max) {
                    const minBirthDate = new Date(
                        today.getFullYear() - filters.ageRange.max,
                        today.getMonth(),
                        today.getDate()
                    );
                    whereConditions.push(
                        gte(users.dateOfBirth, minBirthDate.toISOString())
                    );
                }
            }

            // Get potential friends
            const potentialUsers = await db.query.users.findMany({
                where: and(...whereConditions),
                columns: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true,
                    bio: true,
                    city: true,
                    region: true,
                },
                limit: limit * 3, // Get more to filter and rank
            });

            // Calculate match scores and get additional data
            const potentialFriendsWithScores = await Promise.all(
                potentialUsers.map(async (user) => {
                    // Get mutual friends count
                    const mutualFriendsCount = await this.getMutualFriendsCount(
                        userId,
                        user.id
                    );

                    // Get user's interests for mutual interests calculation
                    const candidateInterests =
                        await db.query.userInterests.findMany({
                            where: eq(userInterests.userId, user.id),
                            with: {
                                interest: true,
                            },
                        });

                    const candidateInterestIds = candidateInterests.map(
                        (ui) => ui.interestId
                    );

                    // Calculate mutual interests
                    const mutualInterestIds = userInterestIds.filter((id) =>
                        candidateInterestIds.includes(id)
                    );
                    const mutualInterestsCount = mutualInterestIds.length;

                    // Get common interests details
                    const commonInterests = currentUserInterests
                        .filter((ui) =>
                            mutualInterestIds.includes(ui.interestId)
                        )
                        .map((ui) => ({
                            id: ui.interest.id,
                            name: ui.interest.name,
                        }));

                    // Calculate match score (weighted algorithm)
                    const matchScore = this.calculateMatchScore({
                        mutualFriendsCount,
                        mutualInterestsCount,
                        sameCity: user.city === filters?.location?.city,
                        sameRegion: user.region === filters?.location?.region,
                    });

                    // Apply interest filter if specified
                    if (filters?.interests && filters.interests.length > 0) {
                        const hasMatchingInterest = filters.interests.some(
                            (id) => candidateInterestIds.includes(id)
                        );
                        if (!hasMatchingInterest) {
                            return null; // Filter out if no matching interests
                        }
                    }

                    return {
                        ...user,
                        mutualFriendsCount,
                        mutualInterestsCount,
                        matchScore,
                        commonInterests,
                    } as PotentialFriend;
                })
            );

            // Filter out nulls and sort by match score
            const validPotentialFriends = potentialFriendsWithScores
                .filter((friend): friend is PotentialFriend => friend !== null)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit);

            return validPotentialFriends;
        } catch (error) {
            console.error('Get potential friends error:', error);
            throw new Error(`Failed to get potential friends: ${error}`);
        }
    }

    async getRecommendedEvents(
        userId: number,
        limit: number = 20,
        filters?: EventFilters
    ): Promise<EventWithDetails[]> {
        try {
            // Get user's interests for personalized recommendations
            const currentUserInterests = await db.query.userInterests.findMany({
                where: eq(userInterests.userId, userId),
            });
            const userInterestIds = currentUserInterests.map(
                (ui) => ui.interestId
            );

            // Get user's friends for friend-organized events
            const friendsList = await this.friendshipService.getFriends(userId);
            const friendIds = friendsList.map((f) => f.id);

            // Get events user is not already participating in
            const userParticipations =
                await db.query.eventParticipants.findMany({
                    where: eq(eventParticipants.userId, userId),
                });
            const participatingEventIds = userParticipations.map(
                (p) => p.eventId
            );

            // Build query conditions
            let whereConditions = [
                gte(events.startTime, new Date().toISOString()), // Future events only
                or(
                    eq(events.privacyLevel, 'public'),
                    and(
                        eq(events.privacyLevel, 'friends'),
                        inArray(events.organizerId, friendIds)
                    )
                ),
            ];

            if (participatingEventIds.length > 0) {
                whereConditions.push(
                    notInArray(events.id, participatingEventIds)
                );
            }

            // Apply filters
            if (filters?.categoryId) {
                whereConditions.push(eq(events.categoryId, filters.categoryId));
            }

            if (filters?.location) {
                whereConditions.push(
                    sql`${events.location} ILIKE ${`%${filters.location}%`}`
                );
            }

            if (filters?.dateRange?.start) {
                whereConditions.push(
                    gte(events.startTime, filters.dateRange.start)
                );
            }

            if (filters?.dateRange?.end) {
                whereConditions.push(
                    lte(events.startTime, filters.dateRange.end)
                );
            }

            if (filters?.privacyLevel) {
                whereConditions.push(
                    eq(events.privacyLevel, filters.privacyLevel)
                );
            }

            // Get recommended events
            const recommendedEvents = await db.query.events.findMany({
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
                limit: limit * 2, // Get more to rank and filter
            });

            // Convert to EventWithDetails format and calculate relevance scores
            const eventsWithDetails = await Promise.all(
                recommendedEvents.map(async (event) => {
                    const eventDetails = await this.eventService.getEventById(
                        event.id,
                        userId
                    );
                    return eventDetails;
                })
            );

            // Filter out null results and sort by relevance
            const validEvents = eventsWithDetails
                .filter((event): event is EventWithDetails => event !== null)
                .sort((a, b) => {
                    // Prioritize events by friends > events in same city > events with mutual interests
                    const aIsFriendOrganized = friendIds.includes(a.organizerId)
                        ? 10
                        : 0;
                    const bIsFriendOrganized = friendIds.includes(b.organizerId)
                        ? 10
                        : 0;

                    return (
                        bIsFriendOrganized - aIsFriendOrganized ||
                        new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                    );
                })
                .slice(0, limit);

            return validEvents;
        } catch (error) {
            console.error('Get recommended events error:', error);
            throw new Error(`Failed to get recommended events: ${error}`);
        }
    }

    async getTrendingContent(
        userId: number,
        limit: number = 10
    ): Promise<TrendingContent> {
        try {
            // Get trending posts (posts with high engagement in last 7 days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Get recent public posts
            const trendingPosts = await db.query.posts.findMany({
                where: and(
                    eq(posts.privacyLevel, 'public'),
                    gte(posts.createdAt, oneWeekAgo.toISOString())
                ),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                            profilePictureUrl: true,
                        },
                    },
                    postReactions: {
                        columns: {
                            userId: true,
                        },
                    },
                    comments: {
                        columns: {
                            id: true,
                        },
                    },
                },
                orderBy: [desc(posts.createdAt)],
                limit,
            });

            // Get trending events (events with many participants)
            const trendingEvents = await this.eventService.getPublicEvents(
                userId,
                limit
            );

            // Format trending posts
            const formattedPosts: TrendingPost[] = trendingPosts.map(
                (post) => ({
                    id: post.id,
                    userId: post.userId,
                    content: post.content,
                    contentType: post.contentType || 'photo',
                    contentUrl: post.contentUrl,
                    privacyLevel: post.privacyLevel || 'public',
                    createdAt: post.createdAt || '',
                    user: post.user,
                    likeCount: post.postReactions?.length || 0,
                    commentCount: post.comments?.length || 0,
                    isLiked:
                        post.postReactions?.some((r) => r.userId === userId) ||
                        false,
                })
            );

            return {
                posts: formattedPosts,
                events: trendingEvents.slice(0, limit),
            };
        } catch (error) {
            console.error('Get trending content error:', error);
            throw new Error(`Failed to get trending content: ${error}`);
        }
    }

    async searchPeople(
        userId: number,
        query: string,
        filters?: ExploreFilters
    ): Promise<PotentialFriend[]> {
        try {
            if (!query.trim()) {
                return [];
            }

            // Get existing relationships to exclude
            const existingRelationships = await db.query.friendships.findMany({
                where: or(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, userId)
                ),
            });

            const excludedUserIds = existingRelationships.map((rel) =>
                rel.userId === userId ? rel.friendId : rel.userId
            );
            excludedUserIds.push(userId);

            const searchTerm = `%${query.toLowerCase()}%`;

            let whereConditions = [
                notInArray(users.id, excludedUserIds),
                eq(users.status, 'active'),
                or(
                    sql`LOWER(${users.name}) LIKE ${searchTerm}`,
                    sql`LOWER(${users.surname}) LIKE ${searchTerm}`,
                    sql`LOWER(CONCAT(${users.name}, ' ', ${users.surname})) LIKE ${searchTerm}`
                ),
            ];

            // Apply filters
            if (filters?.location?.city) {
                whereConditions.push(eq(users.city, filters.location.city));
            }
            if (filters?.gender) {
                whereConditions.push(eq(users.gender, filters.gender));
            }

            const searchResults = await db.query.users.findMany({
                where: and(...whereConditions),
                columns: {
                    id: true,
                    name: true,
                    surname: true,
                    profilePictureUrl: true,
                    bio: true,
                    city: true,
                    region: true,
                },
                limit: 50,
            });

            // Calculate match scores for search results
            const resultsWithScores = await Promise.all(
                searchResults.map(async (user) => {
                    const mutualFriendsCount = await this.getMutualFriendsCount(
                        userId,
                        user.id
                    );

                    // Get current user interests
                    const currentUserInterests =
                        await db.query.userInterests.findMany({
                            where: eq(userInterests.userId, userId),
                        });

                    // Get candidate interests
                    const candidateInterests =
                        await db.query.userInterests.findMany({
                            where: eq(userInterests.userId, user.id),
                            with: {
                                interest: true,
                            },
                        });

                    const userInterestIds = currentUserInterests.map(
                        (ui) => ui.interestId
                    );
                    const candidateInterestIds = candidateInterests.map(
                        (ci) => ci.interestId
                    );
                    const mutualInterestIds = userInterestIds.filter((id) =>
                        candidateInterestIds.includes(id)
                    );

                    const commonInterests = candidateInterests
                        .filter((ci) =>
                            mutualInterestIds.includes(ci.interestId)
                        )
                        .map((ci) => ({
                            id: ci.interest.id,
                            name: ci.interest.name,
                        }));

                    const matchScore = this.calculateMatchScore({
                        mutualFriendsCount,
                        mutualInterestsCount: mutualInterestIds.length,
                        sameCity: false, // Not prioritizing location in search
                        sameRegion: false,
                    });

                    return {
                        ...user,
                        mutualFriendsCount,
                        mutualInterestsCount: mutualInterestIds.length,
                        matchScore,
                        commonInterests,
                    } as PotentialFriend;
                })
            );

            return resultsWithScores.sort(
                (a, b) => b.matchScore - a.matchScore
            );
        } catch (error) {
            console.error('Search people error:', error);
            throw new Error(`Failed to search people: ${error}`);
        }
    }

    async getInterestBasedRecommendations(
        userId: number,
        limit: number = 10
    ): Promise<{
        friends: PotentialFriend[];
        events: EventWithDetails[];
    }> {
        try {
            // Get user's interests
            const currentUserInterests = await db.query.userInterests.findMany({
                where: eq(userInterests.userId, userId),
                with: {
                    interest: true,
                },
            });

            if (currentUserInterests.length === 0) {
                // If user has no interests, return general recommendations
                const friends = await this.getPotentialFriends(userId, limit);
                const events = await this.getRecommendedEvents(userId, limit);
                return { friends, events };
            }

            const userInterestIds = currentUserInterests.map(
                (ui) => ui.interestId
            );

            // Get interest-based friend recommendations
            const interestBasedFriends = await this.getPotentialFriends(
                userId,
                limit,
                {
                    interests: userInterestIds,
                }
            );

            // Get interest-based event recommendations
            const interestBasedEvents = await this.getRecommendedEvents(
                userId,
                limit
            );

            return {
                friends: interestBasedFriends,
                events: interestBasedEvents,
            };
        } catch (error) {
            console.error('Get interest-based recommendations error:', error);
            throw new Error(
                `Failed to get interest-based recommendations: ${error}`
            );
        }
    }

    // Helper methods
    private async getMutualFriendsCount(
        userId: number,
        candidateId: number
    ): Promise<number> {
        try {
            // Get user's friends
            const userFriendships = await db.query.friendships.findMany({
                where: and(
                    or(
                        eq(friendships.userId, userId),
                        eq(friendships.friendId, userId)
                    ),
                    eq(friendships.status, 'accepted')
                ),
            });

            const userFriendIds = userFriendships.map((f) =>
                f.userId === userId ? f.friendId : f.userId
            );

            // Get candidate's friends
            const candidateFriendships = await db.query.friendships.findMany({
                where: and(
                    or(
                        eq(friendships.userId, candidateId),
                        eq(friendships.friendId, candidateId)
                    ),
                    eq(friendships.status, 'accepted')
                ),
            });

            const candidateFriendIds = candidateFriendships.map((f) =>
                f.userId === candidateId ? f.friendId : f.userId
            );

            // Count mutual friends
            return userFriendIds.filter((id) => candidateFriendIds.includes(id))
                .length;
        } catch (error) {
            console.error('Get mutual friends count error:', error);
            return 0;
        }
    }

    private calculateMatchScore(factors: {
        mutualFriendsCount: number;
        mutualInterestsCount: number;
        sameCity: boolean;
        sameRegion: boolean;
    }): number {
        let score = 0;

        // Weight factors
        score += factors.mutualFriendsCount * 10; // High weight for mutual friends
        score += factors.mutualInterestsCount * 5; // Medium weight for common interests
        score += factors.sameCity ? 3 : 0; // Bonus for same city
        score += factors.sameRegion ? 1 : 0; // Small bonus for same region

        return score;
    }
}
