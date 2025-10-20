import { db } from '@/db';
import { conversations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ollama from 'ollama';

type RichConversationData = Awaited<
    ReturnType<AIService['getConversationContext']>
>;
export class AIService {
    private model = 'llama3.1:8b';
    constructor() {}

    async generateAnswer(
        conversationId: number,
        currentUserId: number,
        userQuestion: string
    ) {
        const rawData = await this.getConversationContext(conversationId);
        const formattedContext = this.formatContextForAI(
            rawData,
            currentUserId
        );
        const systemPrompt = this.createSystemPrompt(
            formattedContext,
            currentUserId,
            rawData
        );

        const response = await ollama.chat({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userQuestion,
                },
            ],
            stream: true,
        });

        return response;
    }

    private createSystemPrompt(
        context: string,
        currentUserId: number,
        conversationData: RichConversationData
    ): string {
        const currentUser = conversationData.conversationParticipants.find(
            (p) => p.user.id === currentUserId
        );
        const currentUserName = currentUser
            ? `${currentUser.user.name} ${currentUser.user.surname}`
            : 'User';

        return (
            'You are a highly restricted AI assistant. Your behavior is governed by the following rules:\n\n' +
            `**Your Identity:** You are speaking to "${currentUserName}", who will be referred to as "You" in the message history. You are an AI assistant.\n\n` +
            '1.  Your ONLY purpose is to analyze the conversation history provided below, enclosed in <context> tags.\n' +
            '2.  You MUST ONLY answer questions that can be answered *directly* from this context.\n' +
            '3.  You can summarize the conversation or find specific facts (like dates, names, or topics) *within* the context.\n' +
            '4.  If the user asks ANY question not directly related to the <context> (e.g., "What is 2+2?", "Who is the president?", "Tell me a joke"), you MUST strictly respond with: "I can only answer questions about the current conversation." but with current language.\n' +
            '5.  Do not apologize or be conversational when refusing. Just state the refusal.\n' +
            '6.  You may ask a clarifying question about the conversation *after* you provide an answer, but not as a refusal.\n' +
            '<context>\n' +
            `${context}\n` +
            '</context>'
        );
    }

    /**
     * Fetches a single conversation with all its participants and messages.
     */
    private async getConversationContext(conversationId: number) {
        const conversationData = await db.query.conversations.findFirst({
            where: eq(conversations.id, conversationId),
            with: {
                conversationParticipants: {
                    columns: {
                        nickname: true,
                    },
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                                bio: true,
                                city: true,
                                dateOfBirth: true,
                                region: true,
                            },
                            with: {
                                userInterests: {
                                    with: {
                                        interest: {
                                            columns: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                messages: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                            },
                        },
                    },
                    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
                },
            },
        });

        if (!conversationData) {
            throw new Error('Conversation not found');
        }

        return conversationData;
    }

    /**
     * Formats the raw database data into a clean text block for the AI.
     */
    private formatContextForAI(
        conversationData: RichConversationData,
        currentUserId: number
    ): string {
        let context = '=== Conversation Context ===\n\n';

        const nicknameMap = new Map<number, string | null>();
        conversationData.conversationParticipants.forEach((p) => {
            nicknameMap.set(p.user.id, p.nickname);
        });

        const currentUserParticipant =
            conversationData.conversationParticipants.find(
                (p) => p.user.id === currentUserId
            );
        context += '[Your Profile (Current User)]\n';
        if (currentUserParticipant) {
            const u = currentUserParticipant.user;
            context += `Name: ${u.name} ${u.surname}\n`;
            if (currentUserParticipant.nickname) {
                context += `Nickname: ${currentUserParticipant.nickname}\n`;
            }
            const interests = u.userInterests
                .map((i) => i.interest.name)
                .join(', ');
            if (interests) context += `Interests: ${interests}\n`;
            if (u.bio) context += `Bio: ${u.bio}\n`;
            if (u.city) context += `Location: ${u.city}\n`;
            if (u.dateOfBirth) context += `Date of birth: ${u.dateOfBirth}\n`;
        } else {
            context +=
                'Note: You are viewing this conversation but are not a participant.\n';
        }
        context += '\n';

        context += '[Other Participants]\n';
        conversationData.conversationParticipants
            .filter((p) => p.user.id !== currentUserId)
            .forEach((p) => {
                const u = p.user;
                context += `Name: ${u.name} ${u.surname}\n`;
                if (p.nickname) context += `Nickname: ${p.nickname}\n`;
                const interests = u.userInterests
                    .map((i) => i.interest.name)
                    .join(', ');
                if (interests) context += `Interests: ${interests}\n`;
                if (u.bio) context += `Bio: ${u.bio}\n`;
                if (u.city) context += `Location: ${u.city}\n`;
                if (u.dateOfBirth)
                    context += `Date of birth: ${u.dateOfBirth}\n`;
                context += '---\n';
            });
        context += '\n';

        context += '[Message History]\n';
        conversationData.messages.forEach((msg) => {
            const sender = msg.user;
            const nickname = nicknameMap.get(sender.id);
            const senderName = nickname
                ? `${nickname} (${sender.name} ${sender.surname})`
                : `${sender.name} ${sender.surname}`;
            const timestamp = new Date(msg.createdAt!).toLocaleString('en-US');

            const speaker = sender.id === currentUserId ? 'You' : senderName;

            context += `${speaker} [${timestamp}]: ${msg.content}\n`;
        });

        context += '\n=== End of Context ===';

        return context;
    }
}
