import ollama from 'ollama';

export class AIService {
    private model = 'llama3.1:8b';
    constructor() {}

    async generateAnswer(question: string) {
        const message = { role: 'user', content: question };

        const response = await ollama.chat({
            model: this.model,
            messages: [message],
            stream: true,
        });

        return response;
    }
}
