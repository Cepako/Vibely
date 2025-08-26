import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useEventActions } from './hooks/useEventActions';
import type {
    EventCategory,
    Event,
    CreateEventData,
    UpdateEventData,
} from '../../types/events';
import { getEventStatus } from '../../utils/eventStatus';

interface EditEventModalProps {
    event: Event;
    onClose: () => void;
    categories: EventCategory[];
    currentParticipants: Array<{ user: { id: number } }>;
}

export default function EditEventModal({
    event,
    onClose,
    categories,
    currentParticipants,
}: EditEventModalProps) {
    const { updateEvent, isUpdatingEvent } = useEventActions();
    const [error, setError] = useState<string | null>(null);

    const eventStatus = getEventStatus(event.startTime, event.endTime);
    const isEventEditable = eventStatus.status === 'upcoming';

    const formatDateTimeForInput = (isoString: string): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };

    const formatDateTimeForAPI = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
    };

    const [formData, setFormData] = useState<UpdateEventData>({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startTime: formatDateTimeForInput(event.startTime) || '',
        endTime: formatDateTimeForInput(event.endTime) || '',
        categoryId: event.categoryId || undefined,
        privacyLevel: event.privacyLevel || 'public',
        maxParticipants: event.maxParticipants || undefined,
    });

    const currentParticipantCount = currentParticipants.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isEventEditable) {
            setError('Cannot edit events that have already started or ended');
            return;
        }

        if (formData.startTime && formData.endTime) {
            const startDate = new Date(formData.startTime);
            const endDate = new Date(formData.endTime);
            const now = new Date();

            if (startDate <= now) {
                setError('Start time must be in the future');
                return;
            }

            if (endDate <= startDate) {
                setError('End time must be after start time');
                return;
            }
        }

        if (
            formData.maxParticipants &&
            formData.maxParticipants < currentParticipantCount
        ) {
            setError(
                `Cannot set maximum participants below current participant count (${currentParticipantCount})`
            );
            return;
        }

        try {
            const eventData: Partial<CreateEventData> = {
                title: formData.title.trim(),
                description: formData.description?.trim() || undefined,
                location: formData.location?.trim() || undefined,
                startTime: formatDateTimeForAPI(formData.startTime),
                endTime: formatDateTimeForAPI(formData.endTime),
                categoryId: formData.categoryId || undefined,
                privacyLevel: formData.privacyLevel,
                maxParticipants: formData.maxParticipants || undefined,
            };

            if (!eventData.description) delete eventData.description;
            if (!eventData.location) delete eventData.location;

            updateEvent(event.id, eventData);
            onClose();
        } catch (error) {
            console.error('Failed to update event:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update event'
            );
        }
    };

    const handleInputChange = (
        field: keyof UpdateEventData,
        value: string | number | undefined
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const isFormValid =
        formData.title.trim() &&
        formData.startTime &&
        formData.endTime &&
        formData.privacyLevel;

    const getCurrentDateTimeLocal = (): string => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    if (!isEventEditable) {
        return (
            <div className='max-h-[90vh] w-full max-w-2xl rounded-lg bg-white'>
                <div className='border-b border-slate-200 p-6'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-2xl font-bold text-slate-900'>
                            Cannot Edit Event
                        </h2>
                        <button
                            onClick={onClose}
                            className='cursor-pointer text-slate-400 transition-colors hover:text-slate-600'
                        >
                            <IconX size={24} />
                        </button>
                    </div>
                </div>
                <div className='p-6 text-center'>
                    <div className='mb-4 text-4xl'>📅</div>
                    <h3 className='mb-2 text-lg font-semibold text-slate-900'>
                        Event Cannot Be Edited
                    </h3>
                    <p className='mb-6 text-slate-600'>
                        Events that have already started or ended cannot be
                        modified. The event status is:{' '}
                        <span className='font-medium'>{eventStatus.label}</span>
                    </p>
                    <button
                        onClick={onClose}
                        className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-colors'
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='max-h-[90vh] w-full max-w-2xl rounded-lg bg-white'>
            <div className='border-b border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-slate-900'>
                        Edit Event
                    </h2>
                    <button
                        onClick={onClose}
                        className='cursor-pointer text-slate-400 transition-colors hover:text-slate-600'
                        disabled={isUpdatingEvent}
                    >
                        <IconX size={24} />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6 p-6'>
                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <p className='text-sm text-red-600'>{error}</p>
                    </div>
                )}

                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Event Title *
                    </label>
                    <input
                        type='text'
                        required
                        value={formData.title}
                        onChange={(e) =>
                            handleInputChange('title', e.target.value)
                        }
                        className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                        placeholder='Enter event title'
                        disabled={isUpdatingEvent}
                    />
                </div>

                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Description
                    </label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                        rows={3}
                        className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                        placeholder='Describe your event...'
                        disabled={isUpdatingEvent}
                    />
                </div>

                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Location
                    </label>
                    <input
                        type='text'
                        value={formData.location || ''}
                        onChange={(e) =>
                            handleInputChange('location', e.target.value)
                        }
                        className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                        placeholder='Event location'
                        disabled={isUpdatingEvent}
                    />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                        <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Start Date & Time *
                        </label>
                        <input
                            type='datetime-local'
                            required
                            value={formData.startTime}
                            onChange={(e) =>
                                handleInputChange('startTime', e.target.value)
                            }
                            min={getCurrentDateTimeLocal()}
                            className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                            disabled={isUpdatingEvent}
                        />
                    </div>
                    <div>
                        <label className='mb-2 block text-sm font-medium text-slate-700'>
                            End Date & Time *
                        </label>
                        <input
                            type='datetime-local'
                            required
                            value={formData.endTime}
                            onChange={(e) =>
                                handleInputChange('endTime', e.target.value)
                            }
                            min={
                                formData.startTime || getCurrentDateTimeLocal()
                            }
                            className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                            disabled={isUpdatingEvent}
                        />
                        <p className='mt-1 text-xs text-slate-500'>
                            End time must be after start time
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                        <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Category
                        </label>
                        <select
                            value={formData.categoryId || ''}
                            onChange={(e) =>
                                handleInputChange(
                                    'categoryId',
                                    e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined
                                )
                            }
                            className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                            disabled={isUpdatingEvent}
                        >
                            <option value=''>Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Privacy Level *
                        </label>
                        <select
                            required
                            value={formData.privacyLevel}
                            onChange={(e) =>
                                handleInputChange(
                                    'privacyLevel',
                                    e.target.value as
                                        | 'public'
                                        | 'friends'
                                        | 'private'
                                )
                            }
                            className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                            disabled={isUpdatingEvent}
                        >
                            <option value='public'>
                                Public - Anyone can see and join
                            </option>
                            <option value='friends'>
                                Friends - Only friends can see
                            </option>
                            <option value='private'>
                                Private - Invite only
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Maximum Participants
                    </label>
                    <input
                        type='number'
                        min={Math.max(2, currentParticipantCount)}
                        value={formData.maxParticipants || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'maxParticipants',
                                e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                            )
                        }
                        className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                        placeholder='Leave empty for unlimited'
                        disabled={isUpdatingEvent}
                    />
                    <p className='mt-1 text-xs text-slate-500'>
                        {currentParticipantCount > 0
                            ? `Minimum ${currentParticipantCount} participants (current participants)`
                            : 'Minimum 2 participants (including yourself as organizer)'}
                    </p>
                </div>

                {formData.maxParticipants &&
                    formData.maxParticipants < currentParticipantCount && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                            <p className='text-sm text-red-600'>
                                Cannot set maximum participants below current
                                participant count ({currentParticipantCount}).
                            </p>
                        </div>
                    )}

                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                    <h4 className='mb-2 font-medium text-blue-900'>
                        Managing Invitations
                    </h4>
                    <p className='text-sm text-blue-700'>
                        To invite additional friends to this event, use the
                        "Invite Friends" button on the event detail page after
                        saving your changes.
                    </p>
                </div>

                <div className='flex gap-4 pt-4'>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isUpdatingEvent}
                        className='flex-1 cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={!isFormValid || isUpdatingEvent}
                        className='bg-primary-500 hover:bg-primary-600 flex-1 cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {isUpdatingEvent ? 'Updating...' : 'Update Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
