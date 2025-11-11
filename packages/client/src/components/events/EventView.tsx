import { useMemo, useState } from 'react';
import EventsHeader from './EventsHeader';
import EventsList from './EventsList';
import EventsCalendar from './EventsCalendar';
import CreateEventModal from './CreateEventModal';
import { useEvents } from './hooks/useEvents';
import { useEventCategories } from './hooks/useEventCategories';
import { Dialog, useDialog } from '../ui/Dialog';

export default function EventsView() {
    const [activeTab, setActiveTab] = useState<
        'discover' | 'my-events' | 'upcoming'
    >('discover');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const createEventDialog = useDialog(false);

    const { events, isLoading: eventsLoading } = useEvents(activeTab);
    const { categories } = useEventCategories();

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                event.location
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesCategories =
                selectedCategories.length === 0 ||
                (event.categoryId &&
                    selectedCategories.includes(event.categoryId));

            return matchesSearch && matchesCategories;
        });
    }, [events, searchQuery, selectedCategories]);

    const handleTabChange = (tab: 'discover' | 'my-events' | 'upcoming') => {
        setActiveTab(tab);
        setSearchQuery('');
        setSelectedCategories([]);
        setShowFilters(false);
    };

    const handleCategoriesChange = (categoryIds: number[]) => {
        setSelectedCategories(categoryIds);
    };

    return (
        <div className='flex flex-1 flex-col overflow-hidden'>
            <EventsHeader
                activeTab={activeTab}
                viewMode={viewMode}
                searchQuery={searchQuery}
                selectedCategories={selectedCategories}
                showFilters={showFilters}
                categories={categories || []}
                onTabChange={handleTabChange}
                onViewModeChange={setViewMode}
                onSearchChange={setSearchQuery}
                onCategoriesChange={handleCategoriesChange}
                onFiltersToggle={() => setShowFilters(!showFilters)}
                onCreateEvent={createEventDialog.openDialog}
            />

            <div className='flex-1 overflow-hidden'>
                {viewMode === 'list' ? (
                    <EventsList
                        events={filteredEvents}
                        isLoading={eventsLoading}
                    />
                ) : (
                    <EventsCalendar
                        events={filteredEvents}
                        isLoading={eventsLoading}
                    />
                )}
            </div>
            <Dialog
                isOpen={createEventDialog.isOpen}
                onClose={createEventDialog.closeDialog}
                size='lg'
            >
                <CreateEventModal
                    onClose={createEventDialog.closeDialog}
                    categories={categories || []}
                />
            </Dialog>
        </div>
    );
}
