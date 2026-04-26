import { NextRequest, NextResponse } from 'next/server';
import { TTSClient } from 'coze-coding-dev-sdk';
import type { TTSRequest, TTSResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, speaker, uid } = body;

    if (!text || !speaker || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = new TTSClient();

    // 调用 TTS
    const response = await client.synthesize({
      text,
      speaker,
      uid,
    });

    return NextResponse.json<TTSResponse>({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 500 }
    );
  }
}
