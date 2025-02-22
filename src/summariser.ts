import OpenAI from 'openai';

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

/**
 * Generates a bullet-point summary of the conversation
 */
async function generateSummary(conversation: Message[]): Promise<string> {
    const conversationText = conversation
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

    const prompt = `
    Create a concise summary of the following conversation.
    Extract the most important points and insights.
    
    Conversation:
    ${conversationText}

    Return the response as a JSON object with:
    - 'key_points': An array of bullet points summarizing the main points of the conversation
    
    Example Output:
    {
        "key_points": [
            "User expressed feeling overwhelmed at work",
            "Manager is assigning last-minute tasks",
            "Previous attempts to discuss workload were unsuccessful"
        ]
    }
    `;

    const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
    });

    return response.choices[0].message.content || '';
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
        const summaryJson = await generateSummary(conversation);
        console.log("\nConversation Summary:");
        console.log(summaryJson);
    } catch (error) {
        console.error("Error generating summary:", error);
    }
}

// Export functions for use in other files
export { generateSummary };

// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}