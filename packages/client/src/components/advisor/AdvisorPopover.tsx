import React, { useState, useRef, useEffect } from 'react';
import { IconRobot, IconSend, IconLoader2 } from '@tabler/icons-react';
import Popover from '../ui/Popover';
import { useChatWebSocket } from '../providers/ChatWebSocketProvider';

type AdvisorHistoryMessage = {
    type: 'user' | 'ai';
    content: string;
};

export const AdvisorPopover: React.FC = () => {
    const { askAdvisor, advisorResponse, isAdvisorLoading } =
        useChatWebSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [history, setHistory] = useState<AdvisorHistoryMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    useEffect(() => {
        if (!isOpen) return;

        const lastMessage = history[history.length - 1];

        if (isAdvisorLoading) {
            if (lastMessage?.type === 'ai') {
                setHistory((prev) => [
                    ...prev.slice(0, -1),
                    { type: 'ai', content: advisorResponse },
                ]);
            } else if (advisorResponse) {
                setHistory((prev) => [
                    ...prev,
                    { type: 'ai', content: advisorResponse },
                ]);
            }
        }
    }, [advisorResponse, isAdvisorLoading, isOpen, history.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion || isAdvisorLoading) return;

        setHistory((prev) => [
            ...prev,
            { type: 'user', content: trimmedQuestion },
        ]);

        askAdvisor(trimmedQuestion);

        setQuestion('');
    };

    const advisorTrigger = (
        <button
            className={`flex-shrink-0 cursor-pointer rounded-full bg-cyan-600 p-2 text-white transition-colors hover:bg-cyan-700`}
            title='Conversation Advisor'
        >
            <IconRobot size={20} />
        </button>
    );

    const advisorContent = (
        <div className='flex h-[400px] flex-col'>
            {history.length === 0 ? (
                <div className='flex h-full w-full flex-col items-center justify-center text-center text-lg font-semibold text-cyan-600 opacity-50'>
                    Ask me about current conversation?
                    <br />
                    <span className='text-sm'>
                        (Your questions aren't saved anywhere)
                    </span>
                </div>
            ) : (
                <div className='mb-4 flex-1 space-y-4 overflow-y-auto'>
                    {history.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.type === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words ${
                                    msg.type === 'user'
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isAdvisorLoading && (
                        <div className='flex justify-start'>
                            <div className='rounded-lg bg-slate-100 px-3 py-2 text-slate-800'>
                                <IconLoader2
                                    className='animate-spin'
                                    size={16}
                                />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <form onSubmit={handleSubmit} className='flex items-center'>
                <input
                    type='text'
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder='Ask AI advisor...'
                    className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-cyan-600'
                    disabled={isAdvisorLoading}
                />
                <button
                    type='submit'
                    disabled={isAdvisorLoading || !question.trim()}
                    className='ml-2 cursor-pointer rounded-full bg-cyan-600 p-2 text-white transition hover:bg-cyan-700 disabled:cursor-default disabled:opacity-50'
                >
                    <IconSend size={20} />
                </button>
            </form>
        </div>
    );

    return (
        <Popover
            trigger={advisorTrigger}
            content={advisorContent}
            title='AI Advisor'
            placement='top-end'
            triggerType='click'
            open={isOpen}
            onOpenChange={setIsOpen}
            showCloseButton={true}
            maxWidth={550}
            className='min-w-[550px] border-cyan-600'
            arrowClassName='fill-cyan-600'
            titleClassName='text-cyan-600'
            offset={8}
        />
    );
};
