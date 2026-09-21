import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImageWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: '이미지 데이터가 필요합니다.' }, { status: 400 });
    }

    // Strip data:image/...;base64, prefix if present
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
    const detectedMimeType = mimeType || (image.includes('data:') ? image.split(';')[0].replace('data:', '') : 'image/jpeg');

    const result = await analyzeFoodImageWithGemini(base64Data, detectedMimeType);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Food analysis error:', error);
    const message = error instanceof Error ? error.message : '음식 사진 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

