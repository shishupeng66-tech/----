// 角色ID
export type CharacterId = 'warm-boy' | 'cool-guy' | 'sunshine' | 'artsy';

// 角色信息
export interface Character {
  id: CharacterId;
  name: string;
  tagline: string;
  tags: string[];
  avatar: string;
  speaker: string;
  systemPrompt: string;
  appearance: string;
}

// 消息类型
export type MessageType = 'text' | 'voice' | 'image';

// 消息
export interface Message {
  id: string;
  role: 'user' | 'character';
  type: MessageType;
  content: string;
  audioUri?: string;
  imageUri?: string;
  imagePrompt?: string;
  timestamp: number;
}

// 聊天状态
export interface ChatState {
  character: Character | null;
  messages: Message[];
  isTyping: boolean;
  isGeneratingImage: boolean;
}

// ChatContext 类型
export interface ChatContextType {
  chatState: ChatState;
  selectCharacter: (character: Character) => void;
  sendMessage: (content: string) => void;
  resetChat: () => void;
}

// 解析回复结果
export interface ParsedReply {
  text: string;
  imagePrompt: string | null;
}

// API 请求类型
export interface ChatRequest {
  characterId: CharacterId;
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  reply: string;
}

export interface TTSRequest {
  text: string;
  speaker: string;
  uid: string;
}

export interface TTSResponse {
  audioUri: string;
  audioSize: number;
}

export interface ImageRequest {
  prompt: string;
  uid: string;
}

export interface ImageResponse {
  imageUri: string;
}
