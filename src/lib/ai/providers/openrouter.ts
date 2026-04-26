import { ChatRequest, ChatResponse, AIError } from '../types';

export async function openRouterChat(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.CHAT_MODEL || 'google/gemini-3-flash-preview';

  if (!apiKey) {
    throw new AIError('OPENROUTER_API_KEY is not configured', 401);
  }

  const startTime = Date.now();
  console.log(`[AI-Chat] Starting request to OpenRouter using model: ${model}`);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/shishupeng66-tech', // Optional for OpenRouter
        'X-Title': 'VirtualBoy AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          ...request.messages
        ]
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[AI-Chat] OpenRouter error (${response.status}):`, errorData);
      throw new AIError(
        errorData.error?.message || `OpenRouter API failed with status ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    
    console.log(`[AI-Chat] Success in ${duration}ms. Tokens: ${data.usage?.total_tokens || 'unknown'}`);
    
    return { reply };
  } catch (error: any) {
    if (error instanceof AIError) throw error;
    console.error('[AI-Chat] Unexpected error:', error);
    throw new AIError(error.message || 'Internal AI service error');
  }
}
