import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient } from 'coze-coding-dev-sdk';
import type { ImageRequest, ImageResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { prompt, uid } = body;

    if (!prompt || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = new ImageGenerationClient();

    // 调用图像生成
    const response = await client.generate({
      prompt,
      size: '1024x1024',
      watermark: false,
      responseFormat: 'url',
    });

    const helper = client.getResponseHelper(response);
    
    // 检查是否有错误
    if (!helper.success || helper.errorMessages.length > 0) {
      console.error('Image generation error:', helper.errorMessages);
      throw new Error(helper.errorMessages[0] || 'Image generation failed');
    }
    
    const imageUri = helper.imageUrls?.[0];

    if (!imageUri) {
      throw new Error('No image URL returned');
    }

    return NextResponse.json<ImageResponse>({ imageUri });
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}
