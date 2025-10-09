import { createFileRoute, Outlet } from '@tanstack/react-router';
import { IconBubbleText } from '@tabler/icons-react';

export const Route = createFileRoute('/messages/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Messages,
});

function Messages() {
    return (
        <div className='bg-primary-50 flex h-full w-full items-center justify-center'>
            <div className='text-center'>
                <IconBubbleText size={50} className='mx-auto text-slate-700' />
                <h3 className='mb-2 text-xl font-semibold text-slate-900'>
                    Select a conversation
                </h3>
                <p className='text-sm text-slate-500'>
                    Choose a conversation from the sidebar to start messaging
                </p>
            </div>
        </div>
    );
}
