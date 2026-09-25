import { NextRequest, NextResponse } from 'next/server';
import { predictLateNightSnackHealthImpact } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { time, foodName, targetAgeGroup, healthConditions } = body;

    if (!foodName || typeof foodName !== 'string' || !foodName.trim()) {
      return NextResponse.json({ error: '먹으려는 야식 메뉴를 입력해주세요.' }, { status: 400 });
    }

    const prediction = await predictLateNightSnackHealthImpact({
      time: time || '밤 11시',
      foodName: foodName.trim(),
      targetAgeGroup: targetAgeGroup || '50대~60대 중장년층 아버지',
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [],
    });

    return NextResponse.json(prediction);
  } catch (error: unknown) {
    console.error('Late night snack prediction error:', error);
    const message = error instanceof Error ? error.message : '야식 건강 예측 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
