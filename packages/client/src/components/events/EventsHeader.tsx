import { useState } from 'react';
import {
    IconPlus,
    IconList,
    IconCalendarEvent,
    IconSearch,
    IconFilter,
    IconX,
    IconCalendarWeek,
} from '@tabler/icons-react';
import type { EventCategory, EventTab, ViewMode } from '../../types/events';
import FilterDialog from './FilterDialog';
import Tooltip from '../ui/Tooltip';

interface EventsHeaderProps {
    activeTab: EventTab;
    viewMode: ViewMode;
    searchQuery: string;
    selectedCategories: number[];
    showFilters: boolean;
    categories: EventCategory[];
    onTabChange: (tab: EventTab) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onSearchChange: (query: string) => void;
    onCategoriesChange: (categoryIds: number[]) => void;
    onFiltersToggle: () => void;
    onCreateEvent: () => void;
}

export default function EventsHeader({
    activeTab,
    viewMode,
    searchQuery,
    selectedCategories,
    categories,
    onTabChange,
    onViewModeChange,
    onSearchChange,
    onCategoriesChange,
    onCreateEvent,
}: EventsHeaderProps) {
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const clearAllCategories = () => {
        onCategoriesChange([]);
    };

    const handleFilterClick = () => {
        setFilterDialogOpen(true);
    };

    return (
        <>
            <div className='border-b border-slate-200 bg-white'>
                <div className='p-6 pb-0'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h1 className='text-primary-500 flex gap-1 text-3xl font-bold'>
                            <IconCalendarWeek
                                className='text-primary-500'
                                size={32}
                            />
                            Events
                        </h1>
                        <button
                            onClick={onCreateEvent}
                            className='bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors'
                        >
                            <IconPlus size={20} />
                            Create Event
                        </button>
                    </div>

                    <div className='mb-4 flex items-center gap-1'>
                        {[
                            { key: 'discover', label: 'Discover' },
                            { key: 'my-events', label: 'My Events' },
                            { key: 'upcoming', label: 'Upcoming' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key as any)}
                                className={`cursor-pointer rounded-lg px-4 py-2 font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className='mb-4 flex items-center gap-4'>
                        <div className='relative flex-1'>
                            <IconSearch
                                size={20}
                                className='absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400'
                            />
                            <input
                                type='text'
                                placeholder='Search events...'
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className='focus:ring-primary-500 w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 focus:ring-1 focus:outline-none'
                            />
                        </div>

                        <button
                            onClick={handleFilterClick}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                                selectedCategories.length > 0
                                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <IconFilter size={20} />
                            Filters
                            {selectedCategories.length > 0 && (
                                <span className='bg-primary-500 rounded-full px-2 py-1 text-xs text-white'>
                                    {selectedCategories.length}
                                </span>
                            )}
                            {selectedCategories.length > 0 && (
                                <Tooltip content={<span>Remove filters</span>}>
                                    <IconX
                                        size={20}
                                        className='text-slate-400 hover:text-rose-500'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearAllCategories();
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </button>

                        <div className='flex items-center gap-1 rounded-lg border border-slate-300 p-1'>
                            <button
                                onClick={() => onViewModeChange('list')}
                                className={`cursor-pointer rounded p-2 transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <IconList size={20} />
                            </button>
                            <button
                                onClick={() => onViewModeChange('calendar')}
                                className={`cursor-pointer rounded p-2 transition-colors ${
                                    viewMode === 'calendar'
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <IconCalendarEvent size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <FilterDialog
                isOpen={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoriesChange={onCategoriesChange}
                onClearAll={clearAllCategories}
            />
        </>
    );
}
