import { NextRequest, NextResponse } from 'next/server';
import { generateAICoachFeedback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const feedback = await generateAICoachFeedback(data);
    return NextResponse.json(feedback);
  } catch (error: unknown) {
    console.error('Diet prediction feedback error:', error);
    const message = error instanceof Error ? error.message : '다이어트 예측 피드백 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

