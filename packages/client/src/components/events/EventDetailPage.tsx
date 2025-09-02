import {
    IconArrowLeft,
    IconClock,
    IconMapPin,
    IconUsers,
    IconCheck,
    IconX,
    IconUserPlus,
    IconUserCheck,
    IconUserX,
    IconEdit,
    IconTrash,
    IconCalendarX,
    IconCalendarCheck,
    IconTag,
} from '@tabler/icons-react';
import {
    useEventActions,
    useEventDetail,
    useEventParticipants,
} from './hooks/useEventActions';
import InviteFriendsModal from './InviteFriendsModal';
import EditEventModal from './EditEventModal';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Dialog, useDialog } from '../ui/Dialog';
import PrivacyIcon from '../post/PrivacyIcon';
import { getEventStatus, formatTimeUntilEvent } from '../../utils/eventStatus';
import { useEventCategories } from './hooks/useEventCategories';
import UserAvatar from '../ui/UserAvatar';

export default function EventDetailPage() {
    const { eventId } = useParams({ from: '/events/$eventId' });
    const navigate = useNavigate();
    const inviteFriendsDialog = useDialog(false);
    const editEventDialog = useDialog(false);
    const deleteEventDialog = useDialog(false);
    const numericEventId = eventId ? parseInt(eventId) : 0;

    const {
        data: event,
        isLoading,
        error: eventError,
        refetch: refetchEvent,
    } = useEventDetail(numericEventId);

    const {
        data: participants = [],
        isLoading: participantsLoading,
        refetch: refetchParticipants,
    } = useEventParticipants(numericEventId);

    const { categories } = useEventCategories();

    const {
        joinEvent,
        leaveEvent,
        respondToInvitation,
        deleteEvent,
        isJoiningEvent,
        isLeavingEvent,
        isRespondingToInvitation,
        isDeletingEvent,
    } = useEventActions();

    const handleRSVP = async (status: 'going' | 'declined') => {
        if (!eventId) return;

        if (event) {
            const eventStatus = getEventStatus(event.startTime, event.endTime);
            if (!eventStatus.isActionable) return;
        }

        try {
            respondToInvitation(parseInt(eventId), status);
        } catch (error) {
            console.error('Failed to RSVP:', error);
        }
    };

    const handleJoinEvent = async () => {
        if (!eventId) return;

        if (event) {
            const eventStatus = getEventStatus(event.startTime, event.endTime);
            if (!eventStatus.isActionable) return;
        }

        try {
            joinEvent(parseInt(eventId));
        } catch (error) {
            console.error('Failed to join event:', error);
        }
    };

    const handleLeaveEvent = async () => {
        if (!eventId) return;

        if (event) {
            const eventStatus = getEventStatus(event.startTime, event.endTime);
            if (!eventStatus.isActionable) return;
        }

        try {
            leaveEvent(parseInt(eventId));
        } catch (error) {
            console.error('Failed to leave event:', error);
        }
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }),
        };
    };

    const navigateToProfile = (userId: number) => {
        navigate({
            to: '/profile/$profileId',
            params: { profileId: userId.toString() },
        });
    };

    if (isLoading) {
        return (
            <div className='min-h-screen bg-slate-50 p-6'>
                <div className='mx-auto max-w-4xl animate-pulse'>
                    <div className='mb-6 h-8 w-32 rounded bg-slate-200'></div>
                    <div className='rounded-lg bg-white p-8 shadow-sm'>
                        <div className='mb-6 h-8 w-3/4 rounded bg-slate-200'></div>
                        <div className='space-y-4'>
                            <div className='h-4 w-full rounded bg-slate-200'></div>
                            <div className='h-4 w-5/6 rounded bg-slate-200'></div>
                            <div className='h-4 w-2/3 rounded bg-slate-200'></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (eventError || !event) {
        return (
            <div className='min-h-screen bg-slate-50 p-6'>
                <div className='mx-auto max-w-4xl'>
                    <button
                        onClick={() => navigate({ to: '/events' })}
                        className='mb-6 flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-800'
                    >
                        <IconArrowLeft size={20} />
                        Back to Events
                    </button>
                    <div className='rounded-lg bg-white p-8 text-center shadow-sm'>
                        <div className='mb-4 text-6xl'>😕</div>
                        <h2 className='mb-2 text-xl font-semibold text-slate-900'>
                            {eventError?.message || 'Event not found'}
                        </h2>
                        <p className='text-slate-600'>
                            The event you're looking for doesn't exist or you
                            don't have permission to view it.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { date, time } = formatDateTime(event.startTime);
    const endTime = event.endTime ? formatDateTime(event.endTime).time : null;
    const isOrganizer = event.canEdit;
    const userStatus = event.currentUserStatus;

    const eventStatus = getEventStatus(event.startTime, event.endTime);
    const timeUntilEvent =
        eventStatus.status === 'upcoming'
            ? formatTimeUntilEvent(event.startTime)
            : null;

    const actionLoading =
        isJoiningEvent ||
        isLeavingEvent ||
        isRespondingToInvitation ||
        isDeletingEvent;

    const isAtCapacity =
        typeof event.maxParticipants === 'number' &&
        event.participantCounts.going >= event.maxParticipants;

    return (
        <div className='min-h-screen w-full bg-slate-50 p-6'>
            <div className='mx-auto max-w-5xl'>
                <button
                    onClick={() => navigate({ to: '/events' })}
                    className='mb-6 flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-800'
                >
                    <IconArrowLeft size={20} />
                    Back to Events
                </button>

                <div
                    className={`overflow-hidden rounded-lg bg-white shadow-sm ${
                        eventStatus.status === 'ended' ? 'opacity-90' : ''
                    }`}
                >
                    <div className='border-b border-slate-200 p-8'>
                        <div className='mb-6 flex items-start justify-between'>
                            <div className='flex items-center gap-4'>
                                <div
                                    className='h-16 w-16 cursor-pointer overflow-hidden rounded-full bg-slate-200'
                                    onClick={() =>
                                        navigateToProfile(event.organizer.id)
                                    }
                                >
                                    <UserAvatar
                                        user={event.organizer as any}
                                        size='xl'
                                    />
                                </div>
                                <div>
                                    <h3
                                        className='hover:text-primary-600 cursor-pointer font-semibold text-slate-900'
                                        onClick={() =>
                                            navigateToProfile(
                                                event.organizer.id
                                            )
                                        }
                                    >
                                        {event.organizer.name}{' '}
                                        {event.organizer.surname}
                                    </h3>
                                    <p className='text-slate-500'>
                                        Event Organizer
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div
                                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${eventStatus.bgColor} ${eventStatus.color}`}
                                >
                                    {eventStatus.status === 'ended' && (
                                        <IconCalendarX size={16} />
                                    )}
                                    {eventStatus.status === 'ongoing' && (
                                        <IconCalendarCheck size={16} />
                                    )}
                                    {eventStatus.status === 'upcoming' && (
                                        <IconClock size={16} />
                                    )}
                                    <span>{eventStatus.label}</span>
                                </div>

                                <PrivacyIcon level={event.privacyLevel} />
                                <span className='text-slate-500 capitalize'>
                                    {event.privacyLevel}
                                </span>
                                {isOrganizer && (
                                    <div className='flex items-center gap-2'>
                                        <button
                                            onClick={() =>
                                                editEventDialog.openDialog()
                                            }
                                            className='cursor-pointer rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            title='Edit Event'
                                        >
                                            <IconEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                deleteEventDialog.openDialog()
                                            }
                                            disabled={actionLoading}
                                            className='cursor-pointer rounded p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50'
                                            title='Delete Event'
                                        >
                                            <IconTrash size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h1 className='mb-4 text-3xl font-bold text-slate-900'>
                            {event.title}
                        </h1>

                        {event.description && (
                            <p className='mb-6 text-lg text-slate-600'>
                                {event.description}
                            </p>
                        )}

                        {timeUntilEvent && (
                            <div className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                <div className='flex items-center gap-2 text-blue-700'>
                                    <IconClock size={20} />
                                    <span className='font-medium'>
                                        Event starts in {timeUntilEvent}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <div className='flex items-center gap-3 text-slate-700'>
                                <IconClock size={20} />
                                <div>
                                    <div className='font-medium'>{date}</div>
                                    <div>
                                        {time}
                                        {endTime && ` - ${endTime}`}
                                    </div>
                                </div>
                            </div>

                            {event.location && (
                                <div className='flex items-center gap-3 text-slate-700'>
                                    <IconMapPin size={20} />
                                    <span>{event.location}</span>
                                </div>
                            )}

                            <div className='flex items-center gap-3 text-slate-700'>
                                <IconUsers size={20} />
                                <span>
                                    {event.participantCounts.going} going
                                    {event.maxParticipants &&
                                        ` / ${event.maxParticipants} max`}
                                </span>
                            </div>
                        </div>
                        {event.category && (
                            <div className='mt-6 flex flex-col gap-3'>
                                <div className='bg-primary-100 text-primary-700 mr-auto flex items-center gap-2 rounded-full px-4 py-2 font-medium'>
                                    <IconTag size={18} />
                                    <span>{event.category.name}</span>
                                </div>
                                {event.category.description && (
                                    <p className='text-slate-600'>
                                        <strong>Category:</strong>{' '}
                                        {event.category.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div
                        className={`flex items-center justify-between p-6 ${
                            eventStatus.status === 'ended'
                                ? 'bg-slate-100'
                                : 'bg-slate-50'
                        }`}
                    >
                        <div className='flex items-center gap-3'>
                            {eventStatus.status === 'ended' ? (
                                <div className='flex items-center gap-2 text-slate-500'>
                                    <IconCalendarX size={20} />
                                    <span className='font-semibold'>
                                        Event has ended
                                    </span>
                                    {userStatus === 'going' && (
                                        <span className='text-sm'>
                                            • You attended
                                        </span>
                                    )}
                                </div>
                            ) : eventStatus.status === 'ongoing' ? (
                                <div className='flex items-center gap-2 text-amber-600'>
                                    <IconCalendarCheck size={20} />
                                    <span className='font-semibold'>
                                        Event is ongoing
                                    </span>
                                    {userStatus === 'going' && (
                                        <span className='text-sm'>
                                            • You're attending
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {userStatus === 'not_invited' &&
                                        (event.privacyLevel === 'public' ||
                                            event.privacyLevel ===
                                                'friends') && (
                                            <button
                                                onClick={handleJoinEvent}
                                                disabled={
                                                    actionLoading ||
                                                    isAtCapacity
                                                }
                                                className={`cursor-pointer rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
                                                    isAtCapacity
                                                        ? 'cursor-not-allowed bg-slate-400'
                                                        : 'bg-primary-500 hover:bg-primary-600'
                                                } disabled:opacity-50`}
                                                title={
                                                    isAtCapacity
                                                        ? 'Event is at maximum capacity'
                                                        : ''
                                                }
                                            >
                                                {actionLoading
                                                    ? 'Joining...'
                                                    : isAtCapacity
                                                      ? 'Event Full'
                                                      : 'Join Event'}
                                            </button>
                                        )}

                                    {userStatus === 'invited' && (
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() =>
                                                    handleRSVP('going')
                                                }
                                                disabled={
                                                    actionLoading ||
                                                    isAtCapacity
                                                }
                                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
                                                    isAtCapacity
                                                        ? 'cursor-not-allowed bg-slate-400'
                                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                                } disabled:opacity-50`}
                                                title={
                                                    isAtCapacity
                                                        ? 'Event is at maximum capacity'
                                                        : ''
                                                }
                                            >
                                                <IconUserCheck size={20} />
                                                {isAtCapacity
                                                    ? 'Event Full'
                                                    : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRSVP('declined')
                                                }
                                                disabled={actionLoading}
                                                className='flex cursor-pointer items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50'
                                            >
                                                <IconUserX size={20} />
                                                Decline
                                            </button>
                                        </div>
                                    )}

                                    {userStatus === 'going' && (
                                        <div className='flex items-center gap-4'>
                                            <div className='flex items-center gap-2 text-emerald-600'>
                                                <IconCheck size={20} />
                                                <span className='font-semibold'>
                                                    You're going!
                                                </span>
                                            </div>
                                            {!isOrganizer && (
                                                <button
                                                    onClick={handleLeaveEvent}
                                                    disabled={actionLoading}
                                                    className='cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                                >
                                                    {actionLoading
                                                        ? 'Leaving...'
                                                        : 'Leave Event'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {userStatus === 'declined' && (
                                        <div className='flex items-center gap-4'>
                                            <div className='flex items-center gap-2 text-rose-600'>
                                                <IconX size={20} />
                                                <span className='font-semibold'>
                                                    You declined
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleRSVP('going')
                                                }
                                                disabled={
                                                    actionLoading ||
                                                    isAtCapacity
                                                }
                                                className={`cursor-pointer rounded-lg border px-4 py-2 font-medium transition-colors ${
                                                    isAtCapacity
                                                        ? 'cursor-not-allowed border-slate-300 text-slate-400'
                                                        : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                                                } disabled:opacity-50`}
                                                title={
                                                    isAtCapacity
                                                        ? 'Event is at maximum capacity'
                                                        : ''
                                                }
                                            >
                                                {actionLoading
                                                    ? 'Updating...'
                                                    : isAtCapacity
                                                      ? 'Event Full'
                                                      : 'Change to Going'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className='flex items-center gap-3'>
                            {isOrganizer && eventStatus.isActionable && (
                                <button
                                    onClick={() =>
                                        inviteFriendsDialog.openDialog()
                                    }
                                    disabled={
                                        typeof event.maxParticipants ===
                                            'number' &&
                                        event.participantCounts.total >=
                                            event.maxParticipants
                                    }
                                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                                        event.maxParticipants &&
                                        event.participantCounts.total >=
                                            event.maxParticipants
                                            ? 'cursor-not-allowed border-slate-300 text-slate-400 opacity-50'
                                            : 'border-primary-500 text-primary-600 hover:bg-primary-50 cursor-pointer'
                                    }`}
                                    title={
                                        event.maxParticipants &&
                                        event.participantCounts.total >=
                                            event.maxParticipants
                                            ? 'Event is at maximum capacity'
                                            : !eventStatus.isActionable
                                              ? 'Cannot invite to past or ongoing events'
                                              : 'Invite Friends'
                                    }
                                >
                                    <IconUserPlus size={20} />
                                    Invite Friends
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className='mt-6 rounded-lg bg-white p-6 shadow-sm'>
                    <h2 className='mb-4 text-xl font-semibold text-slate-900'>
                        Participants ({event.participantCounts.total})
                    </h2>

                    {participantsLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='text-slate-500'>
                                Loading participants...
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-6'>
                            {participants.filter((p) => p.status === 'going')
                                .length > 0 && (
                                <div>
                                    <h3 className='mb-3 font-medium text-emerald-600'>
                                        {eventStatus.status === 'ended'
                                            ? 'Attended'
                                            : 'Going'}{' '}
                                        (
                                        {
                                            participants.filter(
                                                (p) => p.status === 'going'
                                            ).length
                                        }
                                        )
                                    </h3>
                                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                                        {participants
                                            .filter((p) => p.status === 'going')
                                            .map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className='flex cursor-pointer items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 transition-colors hover:bg-emerald-100'
                                                    onClick={() =>
                                                        navigateToProfile(
                                                            participant.user.id
                                                        )
                                                    }
                                                >
                                                    <UserAvatar
                                                        user={
                                                            participant.user as any
                                                        }
                                                    />
                                                    <div>
                                                        <p className='font-medium text-emerald-800'>
                                                            {
                                                                participant.user
                                                                    .name
                                                            }{' '}
                                                            {
                                                                participant.user
                                                                    .surname
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {participants.filter((p) => p.status === 'invited')
                                .length > 0 &&
                                eventStatus.status !== 'ended' && (
                                    <div>
                                        <h3 className='mb-3 font-medium text-slate-600'>
                                            Invited (
                                            {
                                                participants.filter(
                                                    (p) =>
                                                        p.status === 'invited'
                                                ).length
                                            }
                                            )
                                        </h3>
                                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                                            {participants
                                                .filter(
                                                    (p) =>
                                                        p.status === 'invited'
                                                )
                                                .map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className='flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100'
                                                        onClick={() =>
                                                            navigateToProfile(
                                                                participant.user
                                                                    .id
                                                            )
                                                        }
                                                    >
                                                        <UserAvatar
                                                            user={
                                                                participant.user as any
                                                            }
                                                        />
                                                        <div>
                                                            <p className='font-medium text-slate-700'>
                                                                {
                                                                    participant
                                                                        .user
                                                                        .name
                                                                }{' '}
                                                                {
                                                                    participant
                                                                        .user
                                                                        .surname
                                                                }
                                                            </p>
                                                            <p className='text-sm text-slate-500'>
                                                                Pending response
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                            {participants.length === 0 && (
                                <p className='text-center text-slate-500'>
                                    No participants yet
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                isOpen={editEventDialog.isOpen}
                onClose={editEventDialog.closeDialog}
                size='lg'
            >
                <EditEventModal
                    event={event}
                    onClose={() => editEventDialog.closeDialog()}
                    categories={categories || []}
                    currentParticipants={participants}
                />
            </Dialog>

            <Dialog
                isOpen={inviteFriendsDialog.isOpen}
                onClose={inviteFriendsDialog.closeDialog}
                size='lg'
            >
                <InviteFriendsModal
                    eventId={event.id}
                    closeModal={() => inviteFriendsDialog.closeDialog()}
                    maxParticipants={event.maxParticipants}
                    currentParticipantCount={event.participantCounts.total}
                    alreadyInvitedFriendIds={participants.map((p) => p.user.id)}
                />
            </Dialog>

            <Dialog
                isOpen={deleteEventDialog.isOpen}
                onClose={deleteEventDialog.closeDialog}
                size='sm'
            >
                <div
                    className='flex flex-col gap-3 bg-white p-4'
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='text-lg font-bold text-slate-700'>
                        Are you sure you want to delete event?
                    </div>
                    <div className='flex w-full items-center justify-evenly gap-1'>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'
                            onClick={deleteEventDialog.closeDialog}
                        >
                            Cancel
                        </button>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-white transition-colors hover:bg-rose-600'
                            onClick={() => {
                                try {
                                    deleteEvent(parseInt(eventId));
                                    navigate({ to: '/events' });
                                } catch (error) {
                                    console.error(
                                        'Failed to delete event:',
                                        error
                                    );
                                }
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
