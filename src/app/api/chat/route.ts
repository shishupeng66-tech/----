import { NextRequest, NextResponse } from 'next/server';
import { openRouterChat } from '@/lib/ai/providers/openrouter';
import type { ChatRequest as BizChatRequest, ChatResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 60; // 调高超时限制，Gemini 推理可能较慢

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

    // 调用新 Provider
    const { reply } = await openRouterChat({
      systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    });

    return NextResponse.json<ChatResponse>({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // 错误分类处理
    const status = error.status || 500;
    let message = '系统开小差了，请稍后再试';
    
    if (status === 401) message = 'AI 服务授权失败，请检查配置';
    if (status === 429) message = '说话太快啦，我需要休息一下';
    if (error.message?.includes('timeout')) message = '我还在思考中，请重新发送试试';

    return NextResponse.json(
      { error: message, originalError: error.message },
      { status }
    );
  }
}
