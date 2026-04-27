import { NextRequest, NextResponse } from 'next/server';
import { arkChat } from '@/lib/ai/providers/arkChat';
import type { ChatRequest as BizChatRequest, ChatResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 60; 

export async function POST(request: NextRequest) {
  try {
    const body: BizChatRequest = await request.json();
    const { systemPrompt, messages } = body;

    if (!systemPrompt || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 调用火山引擎/豆包 Provider
    const { reply } = await arkChat({
      systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    });

    return NextResponse.json<ChatResponse>({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    const status = error.status || 500;
    let message = '我现在有点累了，稍后再找我好吗？'; // 更符合角色扮演的错误提示
    
    if (status === 401) message = '身份验证失败，请检查 API 配置';
    if (status === 429) message = '你回得太快啦，我还没想好怎么说～';
    if (error.message?.includes('timeout')) message = '信号好像不太好，我刚才没听清...';

    return NextResponse.json(
      { error: message, originalError: error.message },
      { status }
    );
  }
}
