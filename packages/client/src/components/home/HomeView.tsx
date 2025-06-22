import Sidebar from './Sidebar';
import PostCard from '../post/PostCard';

const dummyPosts = [
    {
        id: 1,
        user_id: 101,
        username: 'alex_hiker',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content:
            'Just finished an amazing hike at Sunset Peak! The view was absolutely breathtaking. Nature never fails to inspire me. 🏔️ #hiking #nature #adventure',
        content_type: 'photo',
        privacy_level: 'public',
        created_at: '2025-06-22T10:30:00Z',
        updated_at: '2025-06-22T10:30:00Z',
        likes: 24,
        comments: 8,
    },
    {
        id: 2,
        user_id: 102,
        username: 'sarah_graduate',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
        content:
            'Celebrating my graduation with family and friends! Four years of hard work finally paid off. Thank you to everyone who supported me along the way. 🎓',
        content_type: 'album',
        privacy_level: 'friends',
        created_at: '2025-06-21T18:45:00Z',
        updated_at: '2025-06-21T18:45:00Z',
        likes: 42,
        comments: 15,
    },
    {
        id: 3,
        user_id: 103,
        username: 'fitness_mike',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content:
            "Quick morning workout routine to start the day right! Remember, consistency is key. What's your favorite way to stay active?",
        content_type: 'video',
        privacy_level: 'public',
        created_at: '2025-06-21T07:15:00Z',
        updated_at: '2025-06-21T07:15:00Z',
        likes: 18,
        comments: 5,
    },
    {
        id: 4,
        user_id: 104,
        username: 'emma_thoughts',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        content:
            "Personal thoughts on recent life changes. Sometimes we need to step back and reflect on our journey. Growth isn't always comfortable, but it's necessary.",
        content_type: 'photo',
        privacy_level: 'private',
        created_at: '2025-06-20T22:10:00Z',
        updated_at: '2025-06-20T22:10:00Z',
        likes: 12,
        comments: 3,
    },
    {
        id: 5,
        user_id: 105,
        username: 'chef_maria',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
        content:
            'Homemade pasta night! Nothing beats the satisfaction of making everything from scratch. Recipe in the comments for anyone interested! 🍝',
        content_type: 'photo',
        privacy_level: 'public',
        created_at: '2025-06-20T19:30:00Z',
        updated_at: '2025-06-20T19:30:00Z',
        likes: 35,
        comments: 12,
    },
    {
        id: 6,
        user_id: 106,
        username: 'beach_squad',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        content:
            'Beach day with the squad! Summer vibes are finally here. Sand between our toes and endless laughter. These are the moments that matter most.',
        content_type: 'album',
        privacy_level: 'friends',
        created_at: '2025-06-20T16:20:00Z',
        updated_at: '2025-06-20T16:20:00Z',
        likes: 28,
        comments: 9,
    },
    {
        id: 7,
        user_id: 107,
        username: 'dev_john',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face',
        content:
            "Late night coding session. Working on something exciting that I can't wait to share with you all. The grind never stops! 💻 #coding #developer",
        content_type: 'photo',
        privacy_level: 'public',
        created_at: '2025-06-20T01:45:00Z',
        updated_at: '2025-06-20T01:45:00Z',
        likes: 21,
        comments: 6,
    },
    {
        id: 8,
        user_id: 108,
        username: 'music_lisa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
        content:
            'Behind the scenes of our latest music video shoot. So grateful for this amazing team and the creative energy we share. Music is life! 🎵',
        content_type: 'video',
        privacy_level: 'public',
        created_at: '2025-06-19T14:12:00Z',
        updated_at: '2025-06-19T14:12:00Z',
        likes: 47,
        comments: 18,
    },
];

export default function HomeView() {
    return (
        <div className='flex w-full flex-col gap-6 overflow-y-auto'>
            <div className='sticky top-0 z-10 flex justify-between border-b border-b-slate-300 bg-white px-5 py-4'>
                <h2 className='text-primary-500 text-2xl font-bold'>Home</h2>
                <input
                    type='text'
                    className='w-[400px] rounded-3xl bg-slate-100 p-2 px-4 outline-none'
                    placeholder='Search...'
                />
            </div>
            <div className='flex justify-evenly'>
                <Posts />
                <Sidebar />
            </div>
        </div>
    );
}

function Posts() {
    return (
        <div className='mx-auto w-full max-w-2xl'>
            <div className='w-full'>
                {dummyPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
