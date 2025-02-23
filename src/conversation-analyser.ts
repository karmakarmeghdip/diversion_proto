import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Analysis {
    text: string;
    mood: string;
    score: number;
}

interface AnalysisResult {
    analysis: Analysis[];
    overall_mood: string;
    average_mood_score: number;
    mood_distribution: Record<string, number>;
}

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Make sure to set this in your environment
});

// Fix the Zod schema
const AnalysisSchema = z.object({
    overall_mood: z.string(),
    average_mood_score: z.number(),
    mood_distribution: z.record(z.string(), z.number())
}).required();

/**
 * Analyzes a full conversation, extracting only user messages for emotion tracking.
 */
export async function analyzeConversation(conversation: Message[]) {
    // Extract only user messages
    const userMessages = conversation
        .map(msg => msg.content);

    // Construct the input dynamically for GPT
    const conversationText = userMessages
        .map(msg => `User: ${msg}`)
        .join('\n');

    const prompt = `
    Analyze the overall mood of the following conversation. Only consider the 'User' messages.
    Classify the overall conversation mood as a distribution across Happy, Sad, Anxious, and Calm, where:
    - Happy: 0 means not happy at all, 1 means extremely happy
    - Sad: 0 means not sad at all, 1 means extremely sad
    - Anxious: 0 means not anxious at all, 1 means extremely anxious
    - Calm: 0 means not calm at all, 1 means extremely calm
    
    The sum of all mood scores must equal 1.

    Conversation:
    ${conversationText}

    Return the response as a JSON object with:
    - 'overall_mood': The dominant mood (the one with highest score)
    - 'mood_distribution': The distribution of moods for the entire conversation
    - 'overall_mood_score': The score of the dominant mood

    Example Output:
    {
        "overall_mood": "Anxious",
        "mood_distribution": {
            "Happy": 0.1,
            "Sad": 0.2,
            "Anxious": 0.6,
            "Calm": 0.1
        },
        "overall_mood_score": 0.6
    }
    `;

    // Fix the API call
    const response = await client.chat.completions.create({
        model: "gpt-4o-2024-08-06",  // Changed from "gpt-4o-2024-08-06" which seems incorrect
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
    });

    // Parse the response manually
    const content = JSON.parse(response.choices[0].message.content || '{}');
    return content;
}

/**
 * Generates relevant follow-up questions based on the conversation and analysis.
 */

// Example usage
async function main() {
    const conversation: Message[] = [
        { role: "user", content: "I feel happy after today's work." },
        { role: "assistant", content: "That sounds tough. Did anything specific make it stressful?" },
        { role: "user", content: "Yeah, my manager keeps giving me extra tasks at the last minute." },
        { role: "assistant", content: "That's frustrating. Have you tried talking to them about it?" },
        { role: "user", content: "I did, but they don't seem to care. It's just overwhelming." },
        { role: "assistant", content: "I understand. Maybe taking a break would help a little?" },
        { role: "user", content: "I wish I could. There's just too much to do." }
    ];

    try {
        // Analyze the conversation
        const analysisJson = await analyzeConversation(conversation);
        console.log("\nAnalysis JSON:");
        console.log(analysisJson);

        // Generate follow-up questions
        
    } catch (error) {
        console.error("Error analyzing conversation:", error);
    }
}


// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}