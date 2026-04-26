import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from 'coze-coding-dev-sdk';
import type { ChatRequest, ChatResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { systemPrompt, messages } = body;

    if (!systemPrompt || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = new LLMClient();
    
    // 构建对话消息
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 调用 LLM (使用默认模型)
    const response = await client.invoke(chatMessages);

    const reply = response.content || '...';

    return NextResponse.json<ChatResponse>({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
