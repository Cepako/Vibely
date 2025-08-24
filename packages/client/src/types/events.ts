export interface EventCategory {
    id: number;
    name: string;
    description?: string | null;
}

export interface EventOrganizer {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
}

export interface EventParticipant {
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
}

export interface UpdateEventData {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
    categoryId?: number;
    privacyLevel: 'public' | 'friends' | 'private';
    maxParticipants?: number;
}

export interface ParticipantCounts {
    total: number;
    going: number;
    declined: number;
    invited: number;
}

export interface Event {
    id: number;
    organizerId: number;
    categoryId?: number;
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
    privacyLevel: 'public' | 'friends' | 'private';
    maxParticipants?: number;
    createdAt: string | null;
    updatedAt: string | null;
    organizer: EventOrganizer;
    category?: EventCategory;
    participants: EventParticipant[];
    participantCounts: ParticipantCounts;
    currentUserStatus?: 'invited' | 'going' | 'declined' | 'not_invited';
    canEdit: boolean;
}

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

export interface EventFilters {
    categoryId?: number;
    privacyLevel?: 'public' | 'friends' | 'private';
    startDate?: string;
    endDate?: string;
    location?: string;
}

export type EventTab = 'discover' | 'my-events' | 'upcoming';
export type ViewMode = 'list' | 'calendar';
