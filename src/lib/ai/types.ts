export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  systemPrompt: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}

export interface ImageRequest {
  prompt: string;
}

export interface ImageResponse {
  imageUri: string;
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
  generateImage(request: ImageRequest): Promise<ImageResponse>;
}

export class AIError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}
