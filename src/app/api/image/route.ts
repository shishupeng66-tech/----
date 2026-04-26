import { NextRequest, NextResponse } from 'next/server';
import { arkImageGenerate } from '@/lib/ai/providers/ark';
import type { ImageRequest, ImageResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 60; // 生图可能较慢

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

    // 调用新 Provider (火山引擎/豆包)
    const { imageUri } = await arkImageGenerate({ prompt });

    return NextResponse.json<ImageResponse>({ imageUri });
  } catch (error: any) {
    console.error('Image API error:', error);
    
    const status = error.status || 500;
    let message = '画不出画了，等我缓一缓～';
    
    if (status === 401) message = '图像服务授权失效';
    if (status === 429) message = '画得太快啦，纸用完啦';

    return NextResponse.json(
      { error: message, originalError: error.message },
      { status }
    );
  }
}
