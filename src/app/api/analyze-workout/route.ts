import { NextRequest, NextResponse } from 'next/server';
import { analyzeWorkoutWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, weightKg, currentDuration, currentIntensity } = body;

    if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
      return NextResponse.json({ error: '운동 내용을 입력해주세요.' }, { status: 400 });
    }

    const result = await analyzeWorkoutWithGemini({
      userInput: userInput.trim(),
      weightKg: Number(weightKg) || 70,
      currentDuration: Number(currentDuration) || 30,
      currentIntensity: currentIntensity || 'moderate',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Workout analysis error:', error);
    const message = error instanceof Error ? error.message : '운동 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

