import {
    IconCalendarWeek,
    IconPlus,
    IconSearch,
    IconFilter,
    IconList,
    IconCalendar,
} from '@tabler/icons-react';
import type { EventCategory, EventTab, ViewMode } from '../../types/events';

interface EventsHeaderProps {
    activeTab: EventTab;
    viewMode: ViewMode;
    searchQuery: string;
    selectedCategory: number | null;
    showFilters: boolean;
    categories: EventCategory[];
    onTabChange: (tab: EventTab) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onSearchChange: (query: string) => void;
    onCategoryChange: (categoryId: number | null) => void;
    onFiltersToggle: () => void;
    onCreateEvent: () => void;
}

export default function EventsHeader({
    activeTab,
    viewMode,
    searchQuery,
    selectedCategory,
    showFilters,
    categories,
    onTabChange,
    onViewModeChange,
    onSearchChange,
    onCategoryChange,
    onFiltersToggle,
    onCreateEvent,
}: EventsHeaderProps) {
    return (
        <div className='border-b border-slate-200 bg-white p-6'>
            <div className='mb-6 flex items-center justify-between'>
                <h1 className='text-primary-500 flex items-center gap-3 text-3xl font-bold'>
                    <IconCalendarWeek className='text-primary-500' size={32} />
                    Events
                </h1>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center rounded-lg bg-slate-100 p-1'>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`cursor-pointer rounded-md p-2 transition-colors ${
                                viewMode === 'list'
                                    ? 'text-primary-500 bg-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title='List View'
                        >
                            <IconList size={20} />
                        </button>
                        <button
                            onClick={() => onViewModeChange('calendar')}
                            className={`cursor-pointer rounded-md p-2 transition-colors ${
                                viewMode === 'calendar'
                                    ? 'text-primary-500 bg-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title='Calendar View'
                        >
                            <IconCalendar size={20} />
                        </button>
                    </div>

                    <button
                        onClick={onCreateEvent}
                        className='bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors'
                    >
                        <IconPlus size={20} />
                        Create Event
                    </button>
                </div>
            </div>

            <div className='mb-6 flex space-x-8'>
                <button
                    onClick={() => onTabChange('discover')}
                    className={`cursor-pointer border-b-2 pb-2 font-semibold transition-colors ${
                        activeTab === 'discover'
                            ? 'border-primary-500 text-primary-500'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Discover
                </button>
                <button
                    onClick={() => onTabChange('upcoming')}
                    className={`cursor-pointer border-b-2 pb-2 font-semibold transition-colors ${
                        activeTab === 'upcoming'
                            ? 'border-primary-500 text-primary-500'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    My Upcoming
                </button>
                <button
                    onClick={() => onTabChange('my-events')}
                    className={`cursor-pointer border-b-2 pb-2 font-semibold transition-colors ${
                        activeTab === 'my-events'
                            ? 'border-primary-500 text-primary-500'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    My Events
                </button>
            </div>

            <div className='flex items-center gap-4'>
                <div className='relative flex-1'>
                    <IconSearch
                        className='absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400'
                        size={20}
                    />
                    <input
                        type='text'
                        placeholder='Search events...'
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 outline-none'
                    />
                </div>
                <button
                    onClick={onFiltersToggle}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                        showFilters
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <IconFilter size={20} />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className='mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex flex-wrap gap-2'>
                        <button
                            onClick={() => onCategoryChange(null)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                selectedCategory === null
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(category.id)}
                                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
