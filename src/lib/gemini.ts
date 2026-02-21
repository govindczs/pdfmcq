import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing. Ensure it is set in your environment variables at build time.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface MCQ {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export async function generateMCQs(text: string): Promise<MCQ[]> {
    // Use gemini-2.5-flash model as it's the available model for this API key
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash'
    });

    const prompt = `Generate 10 insightful multiple choice questions based on the following text. 
Return the output EXACTLY as a JSON array of objects. Do not wrap it in another object.
Each object must reflect this structure:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswerIndex": number // between 0 and 3
}

Text:
${text.substring(0, 50000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let jsonText = response.text();

    // Clean up potential markdown code blocks 
    if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
    } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0];
    }

    try {
        const parsed = JSON.parse(jsonText.trim());
        return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.mcqs || []);
    } catch (e) {
        console.error("Failed to parse JSON", e, jsonText);
        throw new Error("Failed to generate valid MCQs from the PDF.");
    }
}
