import { ChatRequest, ChatResponse, AIError } from '../types';

export async function arkChat(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.ARK_API_KEY;
  const baseUrl = process.env.ARK_CHAT_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  const model = process.env.CHAT_MODEL || 'doubao-seed-character-251128';

  if (!apiKey) {
    throw new AIError('ARK_API_KEY is not configured', 401);
  }

  const startTime = Date.now();
  console.log(`[AI-Chat] Starting request to Ark using model: ${model}`);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      console.error(`[AI-Chat] Ark error (${response.status}):`, errorData);
      throw new AIError(
        errorData.error?.message || `Ark Chat API failed with status ${response.status}`,
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
    throw new AIError(error.message || 'Internal Ark Chat service error');
  }
}
