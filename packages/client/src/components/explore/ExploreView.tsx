import { useState } from 'react';
import ForYouTab from './ForYouTab';
import FriendsTab from './FriendsTab';
import EventsTab from './EventsTab';
import type { ExploreFilters, EventFilters } from './hooks/useExplore';
import { IconCompass } from '@tabler/icons-react';

export default function ExploreView() {
    const [activeTab, setActiveTab] = useState<'forYou' | 'friends' | 'events'>(
        'forYou'
    );
    const [friendFilters, setFriendFilters] = useState<ExploreFilters>({});
    const [eventFilters, setEventFilters] = useState<EventFilters>({});

    const tabs = [
        { key: 'forYou', label: 'For You' },
        { key: 'friends', label: 'Friends' },
        { key: 'events', label: 'Events' },
    ] as const;

    return (
        <div className='flex max-h-screen w-full flex-col overflow-hidden'>
            <div className='flex-shrink-0 border-b border-slate-200 bg-white p-6'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-primary-500 flex items-center gap-3 text-3xl font-bold'>
                        <IconCompass size={32} />
                        Explore
                    </h1>
                </div>

                <div className='flex gap-6 pt-6'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`cursor-pointer border-b-2 pb-2 font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className='p-4'>
                {activeTab === 'forYou' && <ForYouTab />}
                {activeTab === 'friends' && (
                    <FriendsTab
                        filters={friendFilters}
                        onFiltersChange={setFriendFilters}
                    />
                )}
                {activeTab === 'events' && (
                    <EventsTab
                        filters={eventFilters}
                        onFiltersChange={setEventFilters}
                    />
                )}
            </div>
        </div>
    );
}
