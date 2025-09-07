import { IconHome } from '@tabler/icons-react';

export default function HomeHeader() {
    return (
        <div className='sticky top-0 z-10 border-b border-gray-200 bg-white'>
            <div className='mx-auto py-3 pr-[190px] pl-6'>
                <h1 className='text-primary-500 flex gap-2 py-2 text-3xl font-bold'>
                    <IconHome size={32} />
                    Home
                </h1>
            </div>
        </div>
    );
}
