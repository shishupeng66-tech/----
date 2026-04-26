import { ImageRequest, ImageResponse, AIError } from '../types';

export async function arkImageGenerate(request: ImageRequest): Promise<ImageResponse> {
  const apiKey = process.env.ARK_API_KEY;
  const baseUrl = process.env.ARK_IMAGE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
  const model = process.env.IMAGE_MODEL || 'doubao-seedream-5-0-260128';

  if (!apiKey) {
    throw new AIError('ARK_API_KEY is not configured', 401);
  }

  const startTime = Date.now();
  console.log(`[AI-Image] Starting request to Ark using model: ${model}`);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: request.prompt,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: false
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[AI-Image] Ark error (${response.status}):`, errorData);
      throw new AIError(
        errorData.error?.message || `Ark API failed with status ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    const imageUri = data.data?.[0]?.url;

    if (!imageUri) {
      throw new AIError('No image URL returned from Ark API');
    }

    console.log(`[AI-Image] Success in ${duration}ms. URL: ${imageUri.substring(0, 50)}...`);
    
    return { imageUri };
  } catch (error: any) {
    if (error instanceof AIError) throw error;
    console.error('[AI-Image] Unexpected error:', error);
    throw new AIError(error.message || 'Internal AI Image service error');
  }
}
