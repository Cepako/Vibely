import CreatePostCard from './CreatePostCard';
import PostsFeed from './InfiniteScrollPostsFeed';
import Sidebar from './Sidebar';
import HomeHeader from './HomeHeader';

export default function HomeView() {
    return (
        <div className='flex h-full w-full flex-col overflow-y-auto bg-gray-50'>
            <HomeHeader />
            <div className='mx-auto max-w-7xl px-4 py-6'>
                <div className='flex gap-[150px]'>
                    <div className='h-full w-full min-w-[750px] flex-1'>
                        <CreatePostCard />
                        <PostsFeed />
                    </div>

                    <div className='hidden lg:block'>
                        <div className='sticky top-22'>
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
