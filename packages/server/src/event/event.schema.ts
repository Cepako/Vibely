import { Type, Static } from '@sinclair/typebox';

// Enum types
export const PrivacyLevelEnum = Type.Union([
    Type.Literal('public'),
    Type.Literal('friends'),
    Type.Literal('private'),
]);

export const ParticipantStatusEnum = Type.Union([
    Type.Literal('invited'),
    Type.Literal('going'),
    Type.Literal('declined'),
]);

// Create Event Schema
export const CreateEventSchema = Type.Object({
    title: Type.String({ minLength: 1, maxLength: 255 }),
    description: Type.Optional(Type.String({ maxLength: 1000 })),
    location: Type.Optional(Type.String({ maxLength: 255 })),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    categoryId: Type.Optional(Type.Integer({ minimum: 1 })),
    privacyLevel: PrivacyLevelEnum,
    maxParticipants: Type.Optional(Type.Integer({ minimum: 1 })),
    invitedFriends: Type.Optional(Type.Array(Type.Integer({ minimum: 1 }))),
});

// Update Event Schema
export const UpdateEventSchema = Type.Object({
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    description: Type.Optional(Type.String({ maxLength: 1000 })),
    location: Type.Optional(Type.String({ maxLength: 255 })),
    startTime: Type.Optional(Type.String({ format: 'date-time' })),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    categoryId: Type.Optional(Type.Integer({ minimum: 1 })),
    privacyLevel: Type.Optional(PrivacyLevelEnum),
    maxParticipants: Type.Optional(Type.Integer({ minimum: 1 })),
});

// Event Search Schema
export const EventSearchSchema = Type.Object({
    query: Type.String({ minLength: 1 }),
    categoryId: Type.Optional(Type.Integer({ minimum: 1 })),
    privacyLevel: Type.Optional(PrivacyLevelEnum),
    startDate: Type.Optional(Type.String({ format: 'date-time' })),
    endDate: Type.Optional(Type.String({ format: 'date-time' })),
    location: Type.Optional(Type.String()),
});

// Invite Users Schema
export const InviteUsersSchema = Type.Object({
    userIds: Type.Array(Type.Integer({ minimum: 1 }), { minItems: 1 }),
});

// Respond to Invitation Schema
export const RespondToInvitationSchema = Type.Object({
    status: Type.Union([Type.Literal('going'), Type.Literal('declined')]),
});

// Event Category Schema
export const CreateEventCategorySchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    description: Type.Optional(Type.String({ maxLength: 500 })),
});

// Query Parameters Schemas
export const GetPublicEventsQuerySchema = Type.Object({
    limit: Type.Optional(Type.String()),
    categoryId: Type.Optional(Type.String()),
});

export const GetUpcomingEventsQuerySchema = Type.Object({
    limit: Type.Optional(Type.String()),
});

// Event Params Schemas
export const EventParamsSchema = Type.Object({
    eventId: Type.String(),
});

export const UserEventParamsSchema = Type.Object({
    userId: Type.String(),
});

export const RemoveParticipantParamsSchema = Type.Object({
    eventId: Type.String(),
    participantId: Type.String(),
});

// Type definitions
export type CreateEventInput = Static<typeof CreateEventSchema>;
export type UpdateEventInput = Static<typeof UpdateEventSchema>;
export type EventSearchInput = Static<typeof EventSearchSchema>;
export type InviteUsersInput = Static<typeof InviteUsersSchema>;
export type RespondToInvitationInput = Static<typeof RespondToInvitationSchema>;
export type CreateEventCategoryInput = Static<typeof CreateEventCategorySchema>;

export type PrivacyLevel = Static<typeof PrivacyLevelEnum>;
export type ParticipantStatus = Static<typeof ParticipantStatusEnum>;

// Event model types
export interface EventBase {
    id: number;
    organizerId: number;
    categoryId?: number | null;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string;
    endTime?: string | null;
    privacyLevel: PrivacyLevel;
    maxParticipants?: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface EventOrganizer {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
}

export interface EventCategory {
    id: number;
    name: string;
    description?: string | null;
}

export interface EventParticipant {
    id: number;
    userId: number;
    status: ParticipantStatus;
    createdAt: string | null;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
}

export interface ParticipantCounts {
    total: number;
    going: number;
    declined: number;
    invited: number;
}

export interface EventWithDetails extends EventBase {
    organizer: EventOrganizer;
    category?: EventCategory | null;
    participants: EventParticipant[];
    participantCounts: ParticipantCounts;
    currentUserStatus?: ParticipantStatus | 'not_invited';
    canEdit: boolean;
}

// Response schemas
export const ApiResponseSchema = <T extends any>(dataSchema: T) =>
    Type.Object({
        success: Type.Boolean(),
        data: Type.Optional(dataSchema),
        message: Type.Optional(Type.String()),
        error: Type.Optional(Type.String()),
    });

export const EventResponseSchema = Type.Object({
    id: Type.Integer(),
    organizerId: Type.Integer(),
    categoryId: Type.Union([Type.Integer(), Type.Null()]),
    title: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    location: Type.Union([Type.String(), Type.Null()]),
    startTime: Type.String(),
    endTime: Type.Union([Type.String(), Type.Null()]),
    privacyLevel: PrivacyLevelEnum,
    maxParticipants: Type.Union([Type.Integer(), Type.Null()]),
    createdAt: Type.Union([Type.String(), Type.Null()]),
    updatedAt: Type.Union([Type.String(), Type.Null()]),
    organizer: Type.Object({
        id: Type.Integer(),
        name: Type.String(),
        surname: Type.String(),
        profilePictureUrl: Type.Union([Type.String(), Type.Null()]),
    }),
    category: Type.Union([
        Type.Object({
            id: Type.Integer(),
            name: Type.String(),
            description: Type.Union([Type.String(), Type.Null()]),
        }),
        Type.Null(),
    ]),
    participants: Type.Array(
        Type.Object({
            id: Type.Integer(),
            userId: Type.Integer(),
            status: ParticipantStatusEnum,
            createdAt: Type.Union([Type.String(), Type.Null()]),
            user: Type.Object({
                id: Type.Integer(),
                name: Type.String(),
                surname: Type.String(),
                profilePictureUrl: Type.Union([Type.String(), Type.Null()]),
            }),
        })
    ),
    participantCounts: Type.Object({
        total: Type.Integer(),
        going: Type.Integer(),
        declined: Type.Integer(),
        invited: Type.Integer(),
    }),
    currentUserStatus: Type.Optional(
        Type.Union([ParticipantStatusEnum, Type.Literal('not_invited')])
    ),
    canEdit: Type.Boolean(),
});

export const EventCategoryResponseSchema = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
});

// Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// WebSocket event types for real-time updates
export interface EventInvitationNotification {
    type: 'event_invitation';
    eventId: number;
    eventTitle: string;
    organizerId: number;
    organizerName: string;
}

export interface EventUpdateNotification {
    type: 'event_update';
    eventId: number;
    eventTitle: string;
    changes: Partial<EventBase>;
}

export interface EventParticipantUpdateNotification {
    type: 'event_participant_update';
    eventId: number;
    eventTitle: string;
    participantId: number;
    participantName: string;
    status: ParticipantStatus;
}

// Validation utility functions
export const validateDateTime = (dateTime: string): boolean => {
    const date = new Date(dateTime);
    return !isNaN(date.getTime()) && date > new Date();
};

export const validateDateRange = (
    startTime?: string,
    endTime?: string
): boolean => {
    if (!startTime || !endTime) return true;
    return new Date(endTime) > new Date(startTime);
};

// Custom validation functions for business logic
export const validateCreateEventData = (data: CreateEventInput): string[] => {
    const errors: string[] = [];

    // Validate start time is in the future
    if (!validateDateTime(data.startTime)) {
        errors.push('Start time must be in the future');
    }

    // Validate end time is after start time
    if (data.endTime && !validateDateRange(data.startTime, data.endTime)) {
        errors.push('End time must be after start time');
    }

    return errors;
};

export const validateUpdateEventData = (data: UpdateEventInput): string[] => {
    const errors: string[] = [];

    // Validate start time is in the future if provided
    if (data.startTime && !validateDateTime(data.startTime)) {
        errors.push('Start time must be in the future');
    }

    // Validate end time is after start time if both provided
    if (
        data.startTime &&
        data.endTime &&
        !validateDateRange(data.startTime, data.endTime)
    ) {
        errors.push('End time must be after start time');
    }

    return errors;
};

// Error types
export class EventValidationError extends Error {
    constructor(
        message: string,
        public field?: string
    ) {
        super(message);
        this.name = 'EventValidationError';
    }
}

export class EventNotFoundError extends Error {
    constructor(eventId: number) {
        super(`Event with ID ${eventId} not found`);
        this.name = 'EventNotFoundError';
    }
}

export class EventPermissionError extends Error {
    constructor(
        message: string = 'You do not have permission to perform this action'
    ) {
        super(message);
        this.name = 'EventPermissionError';
    }
}

export class EventCapacityError extends Error {
    constructor(message: string = 'Event has reached maximum capacity') {
        super(message);
        this.name = 'EventCapacityError';
    }
}
