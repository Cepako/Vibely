import { useInterestBasedRecommendations } from './hooks/useExplore';
import UserCard from './UserCard';
import EventCard from './EventCard';

export default function ForYouTab() {
    const { data: interestBased, isLoading: loadingInterests } =
        useInterestBasedRecommendations(10);

    if (loadingInterests) {
        return (
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                <div className='space-y-4'>
                    <h2 className='text-xl font-semibold text-slate-900'>
                        Friends For You
                    </h2>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                        >
                            <div className='flex gap-3'>
                                <div className='h-12 w-12 rounded-full bg-slate-200'></div>
                                <div className='flex-1'>
                                    <div className='mb-2 h-4 w-3/4 rounded bg-slate-200'></div>
                                    <div className='h-3 w-1/2 rounded bg-slate-200'></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='space-y-4'>
                    <h2 className='text-xl font-semibold text-slate-900'>
                        Events For You
                    </h2>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                        >
                            <div className='flex gap-3'>
                                <div className='h-12 w-12 rounded-lg bg-slate-200'></div>
                                <div className='flex-1'>
                                    <div className='mb-2 h-4 w-3/4 rounded bg-slate-200'></div>
                                    <div className='h-3 w-full rounded bg-slate-200'></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-full w-full gap-8 overflow-hidden'>
            <div className='w-full'>
                <h2 className='mb-4 text-xl font-semibold text-slate-900'>
                    Friends For You
                </h2>
                <div className='bg-primary-100 flex max-h-[77.5vh] flex-col gap-3 overflow-y-auto rounded-lg p-3'>
                    {interestBased?.data?.friends?.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
                    {(!interestBased?.data?.friends ||
                        interestBased.data.friends.length === 0) && (
                        <div className='py-8 text-center text-slate-500'>
                            No friend recommendations available
                        </div>
                    )}
                </div>
            </div>

            <div className='w-full'>
                <h2 className='mb-4 text-xl font-semibold text-slate-900'>
                    Events For You
                </h2>
                <div className='bg-primary-100 flex max-h-[77.5vh] flex-col gap-3 overflow-y-auto rounded-lg p-3'>
                    {interestBased?.data?.events?.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    {(!interestBased?.data?.events ||
                        interestBased.data.events.length === 0) && (
                        <div className='py-8 text-center text-slate-500'>
                            No event recommendations available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
