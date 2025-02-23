import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Summary {
    key_points: string[];
}

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Add the Zod schema
const SummarySchema = z.object({
    key_points: z.array(z.string())
});

/**
 * Generates a bullet-point summary of the conversation
 */
export async function generateSummary(conversation: Message[]): Promise<Summary> {
    const conversationText = conversation
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

    const prompt = `
    Create a concise summary of the following conversation.
    Extract the most important points and insights.
    The summary should be in bullet points.
    The summary should be written in the style of a personal journal entry. 
    Do not include what the assistant said, only the user's messages.
    Conversation:
    ${conversationText}`;

    const response = await client.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(SummarySchema, "summary"),
        max_tokens: 1000
    });
    
    const summary = response.choices[0].message.parsed;
    if (!summary) {
        throw new Error("No summary found");
    }
    return summary;
}

// Example usage
async function main() {
    const conversation: Message[] = [
        { role: "user", content: "I feel exhausted after today's work." },
        { role: "assistant", content: "That sounds tough. Did anything specific make it stressful?" },
        { role: "user", content: "Yeah, my manager keeps giving me extra tasks at the last minute." },
        { role: "assistant", content: "That's frustrating. Have you tried talking to them about it?" },
        { role: "user", content: "I did, but they don't seem to care. It's just overwhelming." }
    ];

    try {
        const summary = await generateSummary(conversation);
        console.log("\nConversation Summary:");
        console.log(summary.key_points);
    } catch (error) {
        console.error("Error generating summary:", error);
    }
}


// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}