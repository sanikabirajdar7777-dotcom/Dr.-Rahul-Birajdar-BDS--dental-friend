export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  suggestedQuestions?: string[];
}