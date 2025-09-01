import React, { useState } from 'react';
import {
    IconClock,
    IconMapPin,
    IconUsers,
    IconCheck,
    IconX,
    IconUserCheck,
    IconUserX,
    IconCalendarX,
    IconCalendarCheck,
} from '@tabler/icons-react';
import { useEventActions, useEventParticipants } from './hooks/useEventActions';
import type { Event } from '../../types/events';
import { useNavigate } from '@tanstack/react-router';
import PrivacyIcon from '../post/PrivacyIcon';
import { getEventStatus, formatTimeUntilEvent } from '../../utils/eventStatus';
import UserAvatar from '../ui/UserAvatar';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();
    const [showParticipants, setShowParticipants] = useState(false);

    const {
        respondToInvitation,
        joinEvent,
        leaveEvent,
        isRespondingToInvitation,
        isJoiningEvent,
        isLeavingEvent,
    } = useEventActions();

    const { data: participants = [], isLoading: participantsLoading } =
        useEventParticipants(event.id, showParticipants);

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }),
        };
    };

    const { date, time } = formatDateTime(event.startTime);
    const endTime = event.endTime ? formatDateTime(event.endTime).time : null;

    const eventStatus = getEventStatus(event.startTime, event.endTime);
    const timeUntilEvent =
        eventStatus.status === 'upcoming'
            ? formatTimeUntilEvent(event.startTime)
            : null;

    const handleRSVP = async (status: 'going' | 'declined') => {
        if (!eventStatus.isActionable) return;

        try {
            respondToInvitation(event.id, status);
        } catch (error) {
            console.error('Failed to RSVP:', error);
        }
    };

    const handleJoinEvent = async () => {
        if (!eventStatus.isActionable) return;

        try {
            joinEvent(event.id);
        } catch (error) {
            console.error('Failed to join event:', error);
        }
    };

    const handleLeaveEvent = async () => {
        if (!eventStatus.isActionable) return;

        try {
            leaveEvent(event.id);
        } catch (error) {
            console.error('Failed to leave event:', error);
        }
    };

    const navigateToEvent = () => {
        navigate({
            to: '/events/$eventId',
            params: { eventId: event.id.toString() },
        });
    };

    const navigateToProfile = (e: React.MouseEvent, userId: number) => {
        e.stopPropagation();
        navigate({
            to: '/profile/$profileId',
            params: { profileId: userId.toString() },
        });
    };

    const isOrganizer = event.canEdit;
    const userStatus = event.currentUserStatus;

    const actionLoading =
        isJoiningEvent || isLeavingEvent || isRespondingToInvitation;

    const isAtCapacity =
        typeof event.maxParticipants === 'number' &&
        event.participantCounts.going >= event.maxParticipants;

    return (
        <div
            className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md ${
                eventStatus.status === 'ended'
                    ? 'border-slate-300 opacity-75'
                    : 'border-slate-200'
            }`}
        >
            <div
                className='cursor-pointer border-b border-slate-100 p-6 transition-colors hover:bg-slate-50'
                onClick={navigateToEvent}
            >
                <div className='mb-4 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                        <div
                            className='h-12 w-12 overflow-hidden rounded-full bg-slate-200 transition-all'
                            onClick={(e) =>
                                navigateToProfile(e, event.organizer.id)
                            }
                        >
                            <UserAvatar
                                user={event.organizer as any}
                                size='lg'
                            />
                        </div>
                        <div>
                            <h3
                                className='hover:text-primary-600 font-semibold text-slate-900 transition-colors'
                                onClick={(e) =>
                                    navigateToProfile(e, event.organizer.id)
                                }
                            >
                                {event.organizer.name} {event.organizer.surname}
                            </h3>
                            <p className='text-sm text-slate-500'>
                                Event Organizer
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${eventStatus.bgColor} ${eventStatus.color}`}
                        >
                            {eventStatus.status === 'ended' && (
                                <IconCalendarX size={14} />
                            )}
                            {eventStatus.status === 'ongoing' && (
                                <IconCalendarCheck size={14} />
                            )}
                            {eventStatus.status === 'upcoming' && (
                                <IconClock size={14} />
                            )}
                            <span>{eventStatus.label}</span>
                        </div>

                        <PrivacyIcon level={event.privacyLevel} />
                        <span className='text-sm text-slate-500 capitalize'>
                            {event.privacyLevel}
                        </span>
                    </div>
                </div>

                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        <h2 className='hover:text-primary-600 mb-2 text-xl font-bold text-slate-900 transition-colors'>
                            {event.title}
                        </h2>

                        {event.description && (
                            <p className='mb-4 line-clamp-2 text-slate-600'>
                                {event.description}
                            </p>
                        )}

                        {/* Time until event (only for upcoming events) */}
                        {timeUntilEvent && (
                            <div className='mb-3 text-sm text-slate-500'>
                                Starts in {timeUntilEvent}
                            </div>
                        )}

                        <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                            <div className='flex items-center gap-2 text-slate-600'>
                                <IconClock size={16} />
                                <div>
                                    <div className='font-medium'>{date}</div>
                                    <div>
                                        {time}
                                        {endTime && ` - ${endTime}`}
                                    </div>
                                </div>
                            </div>

                            {event.location && (
                                <div className='flex items-center gap-2 text-slate-600'>
                                    <IconMapPin size={16} />
                                    <span className='truncate'>
                                        {event.location}
                                    </span>
                                </div>
                            )}

                            <div className='flex items-center gap-2 text-slate-600'>
                                <IconUsers size={16} />
                                <span>
                                    {event.participantCounts.going} going
                                    {event.maxParticipants &&
                                        ` / ${event.maxParticipants} max`}
                                </span>
                            </div>
                        </div>

                        {event.category && (
                            <div className='mt-3'>
                                <span className='bg-primary-100 text-primary-700 inline-block rounded-full px-2 py-1 text-xs font-medium'>
                                    {event.category.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
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
                            <IconCalendarX size={16} />
                            <span className='font-medium'>Event has ended</span>
                            {userStatus === 'going' && (
                                <span className='text-sm'>• You attended</span>
                            )}
                        </div>
                    ) : eventStatus.status === 'ongoing' ? (
                        <div className='flex items-center gap-2 text-amber-600'>
                            <IconCalendarCheck size={16} />
                            <span className='font-medium'>
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
                                    event.privacyLevel === 'friends') && (
                                    <button
                                        onClick={handleJoinEvent}
                                        disabled={actionLoading || isAtCapacity}
                                        className={`cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-colors ${
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
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleRSVP('going')}
                                        disabled={actionLoading || isAtCapacity}
                                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
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
                                        <IconUserCheck size={16} />
                                        {isAtCapacity ? 'Event Full' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleRSVP('declined')}
                                        disabled={actionLoading}
                                        className='flex cursor-pointer items-center gap-1 rounded-lg bg-rose-500 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50'
                                    >
                                        <IconUserX size={16} />
                                        Decline
                                    </button>
                                </div>
                            )}

                            {userStatus === 'going' && (
                                <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2 font-medium text-emerald-600'>
                                        <IconCheck size={16} />
                                        You're going!
                                    </div>
                                    {!isOrganizer && (
                                        <button
                                            onClick={handleLeaveEvent}
                                            disabled={actionLoading}
                                            className='cursor-pointer rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                        >
                                            {actionLoading
                                                ? 'Leaving...'
                                                : 'Leave'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {userStatus === 'declined' && (
                                <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2 font-medium text-rose-600'>
                                        <IconX size={16} />
                                        You declined
                                    </div>
                                    {event.privacyLevel !== 'public' && (
                                        <button
                                            onClick={() => handleRSVP('going')}
                                            disabled={
                                                actionLoading || isAtCapacity
                                            }
                                            className={`rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${
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
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => setShowParticipants(!showParticipants)}
                        className='cursor-pointer font-medium text-slate-600 hover:text-slate-800'
                        disabled={participantsLoading}
                    >
                        {participantsLoading
                            ? 'Loading...'
                            : 'View Participants'}
                    </button>
                </div>
            </div>

            {showParticipants && (
                <div className='border-t border-slate-200 bg-white p-4'>
                    <h4 className='mb-3 font-semibold'>
                        Participants ({event.participantCounts.total})
                    </h4>

                    {participantsLoading ? (
                        <div className='flex items-center justify-center py-4'>
                            <div className='text-slate-500'>
                                Loading participants...
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {participants.filter((p) => p.status === 'going')
                                .length > 0 && (
                                <div>
                                    <h5 className='mb-2 text-sm font-medium text-emerald-600'>
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
                                    </h5>
                                    <div className='flex flex-wrap gap-2'>
                                        {participants
                                            .filter((p) => p.status === 'going')
                                            .slice(0, 10)
                                            .map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className='flex cursor-pointer items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 transition-colors hover:bg-emerald-100'
                                                    title={`${participant.user.name} ${participant.user.surname}`}
                                                    onClick={() =>
                                                        navigate({
                                                            to: '/profile/$profileId',
                                                            params: {
                                                                profileId:
                                                                    participant.user.id.toString(),
                                                            },
                                                        })
                                                    }
                                                >
                                                    <UserAvatar
                                                        user={
                                                            participant.user as any
                                                        }
                                                        size='xs'
                                                    />
                                                    <span className='text-xs font-medium text-emerald-700'>
                                                        {participant.user.name}
                                                    </span>
                                                </div>
                                            ))}
                                        {participants.filter(
                                            (p) => p.status === 'going'
                                        ).length > 10 && (
                                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-medium text-emerald-700'>
                                                +
                                                {participants.filter(
                                                    (p) => p.status === 'going'
                                                ).length - 10}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {participants.filter((p) => p.status === 'invited')
                                .length > 0 &&
                                eventStatus.status !== 'ended' && (
                                    <div>
                                        <h5 className='mb-2 text-sm font-medium text-slate-600'>
                                            Invited (
                                            {
                                                participants.filter(
                                                    (p) =>
                                                        p.status === 'invited'
                                                ).length
                                            }
                                            )
                                        </h5>
                                        <div className='flex flex-wrap gap-2'>
                                            {participants
                                                .filter(
                                                    (p) =>
                                                        p.status === 'invited'
                                                )
                                                .slice(0, 5)
                                                .map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className='flex cursor-pointer items-center gap-2 rounded-full bg-slate-50 px-2 py-1 transition-colors hover:bg-slate-100'
                                                        title={`${participant.user.name} ${participant.user.surname} (Invited)`}
                                                        onClick={() =>
                                                            navigate({
                                                                to: '/profile/$profileId',
                                                                params: {
                                                                    profileId:
                                                                        participant.user.id.toString(),
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <UserAvatar
                                                            user={
                                                                participant.user as any
                                                            }
                                                        />
                                                        <span className='text-xs font-medium text-slate-600'>
                                                            {
                                                                participant.user
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
