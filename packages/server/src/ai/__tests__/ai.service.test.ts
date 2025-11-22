import { AIService } from '../ai.service';
import { db } from '../../db';
import ollama from 'ollama';

jest.mock('ollama', () => ({
    chat: jest.fn(),
}));

jest.mock('../../db', () => ({
    db: {
        query: {
            conversations: {
                findFirst: jest.fn(),
            },
        },
    },
}));

describe('AIService', () => {
    let service: AIService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AIService();
    });

    const mockDate = new Date('2024-01-01T12:00:00Z');
    const mockConversationData = {
        id: 1,
        conversationParticipants: [
            {
                nickname: 'The Boss',
                user: {
                    id: 1,
                    name: 'John',
                    surname: 'Doe',
                    bio: 'I like code',
                    city: 'Warsaw',
                    dateOfBirth: '1990-01-01',
                    userInterests: [{ interest: { name: 'Coding' } }],
                },
            },
            {
                nickname: null,
                user: {
                    id: 2,
                    name: 'Jane',
                    surname: 'Smith',
                    bio: 'I like design',
                    city: 'Berlin',
                    dateOfBirth: '1995-05-05',
                    userInterests: [{ interest: { name: 'Art' } }],
                },
            },
        ],
        messages: [
            {
                content: 'Hello AI',
                createdAt: mockDate,
                user: { id: 1, name: 'John', surname: 'Doe' },
            },
            {
                content: 'Hi John',
                createdAt: mockDate,
                user: { id: 2, name: 'Jane', surname: 'Smith' },
            },
        ],
    };

    describe('generateAnswer', () => {
        it('powinien pobrać kontekst, sformatować go i wywołać Ollama z odpowiednim promptem', async () => {
            const conversationId = 1;
            const currentUserId = 1;
            const userQuestion = 'Summarize this chat';

            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue(
                mockConversationData
            );

            const mockStream = { asyncIterator: jest.fn() };
            (ollama.chat as jest.Mock).mockResolvedValue(mockStream);

            await service.generateAnswer(
                conversationId,
                currentUserId,
                userQuestion
            );

            expect(db.query.conversations.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.anything() })
            );

            expect(ollama.chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'llama3.1:8b',
                    stream: true,
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            role: 'system',
                            content: expect.stringContaining(
                                'You are a highly restricted AI assistant'
                            ),
                        }),
                        expect.objectContaining({
                            role: 'system',
                            content: expect.stringContaining('Name: John Doe'),
                        }),
                        expect.objectContaining({
                            role: 'system',
                            content:
                                expect.stringContaining('Interests: Coding'),
                        }),
                        expect.objectContaining({
                            role: 'system',
                            content: expect.stringContaining(
                                'You [1/1/2024, 1:00:00 PM]: Hello AI'
                            ),
                        }),
                        expect.objectContaining({
                            role: 'user',
                            content: userQuestion,
                        }),
                    ]),
                })
            );
        });

        it('powinien poprawnie zidentyfikować "Other Participants" w kontekście', async () => {
            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue(
                mockConversationData
            );
            (ollama.chat as jest.Mock).mockResolvedValue({});

            await service.generateAnswer(1, 1, 'question');

            const callArgs = (ollama.chat as jest.Mock).mock.calls[0][0];
            const systemContent = callArgs.messages.find(
                (m: any) => m.role === 'system'
            ).content;

            expect(systemContent).toContain('[Other Participants]');
            expect(systemContent).toContain('Name: Jane Smith');
            expect(systemContent).toContain('Interests: Art');
        });

        it('powinien rzucić błąd, gdy konwersacja nie istnieje', async () => {
            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue(
                null
            );

            await expect(
                service.generateAnswer(999, 1, 'help')
            ).rejects.toThrow('Conversation not found');

            expect(ollama.chat).not.toHaveBeenCalled();
        });
    });
});
