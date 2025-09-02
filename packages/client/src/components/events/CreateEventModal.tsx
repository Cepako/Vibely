import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useEventActions } from './hooks/useEventActions';
import FriendSelection from './FriendSelection';
import CategorySelector from './CategorySelector';
import type { EventCategory, CreateEventData } from '../../types/events';

interface CreateEventModalProps {
    onClose: () => void;
    categories: EventCategory[];
}

export default function CreateEventModal({
    onClose,
    categories,
}: CreateEventModalProps) {
    const { createEventAsync, isCreatingEvent } = useEventActions();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateEventData>({
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        categoryId: undefined,
        privacyLevel: 'public',
        maxParticipants: undefined,
        invitedFriends: [],
    });

    const formatDateTimeForAPI = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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
            formData.invitedFriends &&
            formData.maxParticipants < formData.invitedFriends.length + 1
        ) {
            setError(
                `Maximum participants (${formData.maxParticipants}) must be at least ${formData.invitedFriends.length + 1} (including you as organizer and ${formData.invitedFriends.length} invited friends)`
            );
            return;
        }

        try {
            const eventData: CreateEventData = {
                title: formData.title.trim(),
                description: formData.description?.trim() || undefined,
                location: formData.location?.trim() || undefined,
                startTime: formatDateTimeForAPI(formData.startTime),
                endTime: formatDateTimeForAPI(formData.endTime),
                categoryId: formData.categoryId || undefined,
                privacyLevel: formData.privacyLevel,
                maxParticipants: formData.maxParticipants || undefined,
                invitedFriends: formData.invitedFriends || [],
            };

            if (!eventData.description) delete eventData.description;
            if (!eventData.location) delete eventData.location;

            await createEventAsync(eventData);
            onClose();
        } catch (error) {
            console.error('Failed to create event:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create event'
            );
        }
    };

    const handleInputChange = (
        field: keyof CreateEventData,
        value: string | number | undefined
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFriendSelectionChange = (friendIds: number[]) => {
        setFormData((prev) => ({
            ...prev,
            invitedFriends: friendIds,
        }));
    };

    const handleCategoryChange = (categoryId: number | undefined) => {
        setFormData((prev) => ({
            ...prev,
            categoryId,
        }));
    };

    const isFormValid =
        formData.title.trim() &&
        formData.startTime &&
        formData.endTime &&
        formData.privacyLevel &&
        (!formData.maxParticipants ||
            !formData.invitedFriends ||
            formData.maxParticipants >= formData.invitedFriends.length + 1);

    const getCurrentDateTimeLocal = (): string => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const maxFriendSelections = formData.maxParticipants
        ? Math.max(0, formData.maxParticipants - 1)
        : undefined;

    return (
        <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white'>
            <div className='border-b border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-slate-900'>
                        Create New Event
                    </h2>
                    <button
                        onClick={onClose}
                        className='cursor-pointer text-slate-400 transition-colors hover:text-slate-600'
                        disabled={isCreatingEvent}
                    >
                        <IconX size={24} />
                    </button>
                </div>
            </div>

            <div className='max-h-[75vh] overflow-y-auto'>
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
                            disabled={isCreatingEvent}
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
                            disabled={isCreatingEvent}
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
                            disabled={isCreatingEvent}
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
                                    handleInputChange(
                                        'startTime',
                                        e.target.value
                                    )
                                }
                                min={getCurrentDateTimeLocal()}
                                className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                                disabled={isCreatingEvent}
                            />
                        </div>
                        <div>
                            <label className='mb-2 block text-sm font-medium text-slate-700'>
                                End Date & Time *
                            </label>
                            <input
                                type='datetime-local'
                                required
                                value={formData.endTime || ''}
                                onChange={(e) =>
                                    handleInputChange(
                                        'endTime',
                                        e.target.value || undefined
                                    )
                                }
                                min={
                                    formData.startTime ||
                                    getCurrentDateTimeLocal()
                                }
                                className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none'
                                disabled={isCreatingEvent}
                            />
                            <p className='mt-1 text-xs text-slate-500'>
                                End time must be after start time
                            </p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <CategorySelector
                            categories={categories}
                            selectedCategoryId={formData.categoryId}
                            onCategoryChange={handleCategoryChange}
                            disabled={isCreatingEvent}
                            showDescription={true}
                        />
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
                                disabled={isCreatingEvent}
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
                            min='2'
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
                            disabled={isCreatingEvent}
                        />
                        <p className='mt-1 text-xs text-slate-500'>
                            Minimum 2 participants (including yourself as
                            organizer)
                        </p>
                    </div>

                    {formData.privacyLevel !== 'public' ? (
                        <FriendSelection
                            selectedFriends={formData.invitedFriends || []}
                            onSelectionChange={handleFriendSelectionChange}
                            maxSelections={maxFriendSelections}
                            className='space-y-2'
                        />
                    ) : (
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-slate-700'>
                                Invite Friends (Optional)
                            </label>
                            <p className='mb-3 text-sm text-slate-500'>
                                Even though this is a public event, you can
                                still invite specific friends
                            </p>
                            <FriendSelection
                                selectedFriends={formData.invitedFriends || []}
                                onSelectionChange={handleFriendSelectionChange}
                                maxSelections={maxFriendSelections}
                                className='space-y-2'
                            />
                        </div>
                    )}

                    {formData.maxParticipants &&
                        formData.invitedFriends &&
                        formData.maxParticipants <
                            formData.invitedFriends.length + 1 && (
                            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                <p className='text-sm text-red-600'>
                                    Cannot invite{' '}
                                    {formData.invitedFriends.length} friends
                                    with a maximum of {formData.maxParticipants}{' '}
                                    participants. Either increase the maximum
                                    participants or reduce the number of invited
                                    friends.
                                </p>
                            </div>
                        )}

                    {formData.maxParticipants &&
                        formData.invitedFriends &&
                        formData.invitedFriends.length ===
                            formData.maxParticipants - 1 &&
                        formData.maxParticipants >=
                            formData.invitedFriends.length + 1 && (
                            <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                                <p className='text-sm text-amber-600'>
                                    You've selected{' '}
                                    {formData.invitedFriends.length} friends,
                                    which with you as organizer reaches the
                                    maximum of {formData.maxParticipants}{' '}
                                    participants.
                                </p>
                            </div>
                        )}

                    <div className='flex gap-4 pt-4'>
                        <button
                            type='button'
                            onClick={onClose}
                            disabled={isCreatingEvent}
                            className='flex-1 cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={!isFormValid || isCreatingEvent}
                            className='bg-primary-500 hover:bg-primary-600 flex-1 cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            {isCreatingEvent
                                ? 'Creating...'
                                : formData.invitedFriends &&
                                    formData.invitedFriends.length > 0
                                  ? `Create & Invite (${formData.invitedFriends.length})`
                                  : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
