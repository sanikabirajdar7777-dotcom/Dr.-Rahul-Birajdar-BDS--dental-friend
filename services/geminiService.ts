import { GoogleGenAI, Modality, Content } from '@google/genai';
import { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are Dr. Rahul Birajdar, a highly knowledgeable and friendly dentist with a BDS (Bachelor of Dental Surgery) degree. Your primary role is to accurately answer any dental-related questions from users. Provide detailed, comprehensive, and elaborated answers. Explain concepts clearly, breaking down complex topics into easy-to-understand segments. Maintain a professional yet approachable and cheerful tone.

You MUST generate a simple, clear diagram to illustrate your explanation ONLY when the user explicitly asks for one (e.g., using words like "diagram," "drawing," "show me," "visualize," etc.). Do not generate images proactively, even for complex topics. The diagram is a supplement to your text, not a replacement for it. Ensure you still provide a detailed text explanation alongside the image. For simple, text-based questions, a diagram is not necessary.

After your main answer, you MUST suggest 2-3 relevant follow-up questions the user might want to ask. Format them at the very end of your response, separated by a line with three hyphens. Each question must start with a hyphen.
Example format:
[Your detailed answer here.]
---
- What causes this condition?
- How can I prevent it?
- What are the treatment options?

If the user provides a simple greeting like "hi" or "hello", respond with a warm, friendly, and concise greeting, and ask how you can help. Do not generate a diagram or suggest follow-up questions for this specific case. For all other queries, answer them as the persona defined above.`;

export const generateResponse = async (history: ChatMessage[]): Promise<ChatMessage> => {
  const model = 'gemini-2.5-flash-image';

  // Convert the chat history to the format expected by the Gemini API
  const contents: Content[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const rawTextContent = response.text;
  let imageUrl: string | undefined = undefined;

  // Safely access parts to check for an image.
  const responseParts = response.candidates?.[0]?.content?.parts;
  if (responseParts) {
    for (const part of responseParts) {
      if (part.inlineData) {
        const base64Image = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        imageUrl = `data:${mimeType};base64,${base64Image}`;
        break; // Assume we only need the first image
      }
    }
  }

  // If the model returns nothing (e.g., due to safety filters), throw an error.
  if (!rawTextContent && !imageUrl) {
    throw new Error('The model returned an empty response. Please try rephrasing your message.');
  }

  // Parse for main content and suggested questions
  let content = rawTextContent || ''; // Default to empty string if no text
  let suggestedQuestions: string[] = [];
  const separator = '\n---\n';

  // Only attempt to split if rawTextContent is a non-empty string
  if (rawTextContent) {
      const textParts = rawTextContent.split(separator);

      if (textParts.length > 1) {
          content = textParts[0].trim();
          suggestedQuestions = textParts[1]
          .split('\n')
          .map(q => q.trim())
          .filter(q => q.startsWith('- '))
          .map(q => q.substring(2).trim()) // Remove '- '
          .filter(Boolean); // Remove any empty strings
      } else {
        content = rawTextContent.trim();
      }
  }


  return {
    role: 'model',
    content: content,
    imageUrl: imageUrl,
    suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
  };
};
