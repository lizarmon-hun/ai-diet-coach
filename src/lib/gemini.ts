import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// Fallback sequence: gemini-3.5-flash-lite first (fast & high availability), followed by 3.5-flash and 3.6-flash
export const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  portion: string;
  aiComment: string;
}

// 사진(Base64)을 분석하여 음식 및 영양성분 추출
export async function analyzeFoodImageWithGemini(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<FoodAnalysisResult> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY 가 설정되지 않았습니다.');
  }

  const prompt = `당신은 전문 임상영양사 및 다이어트 코치 AI입니다.
업로드된 음식 사진을 분석하여 음식의 종류, 예상 분량, 칼로리 및 주요 영양성분(탄수화물, 단백질, 지방, 식이섬유)을 추정해주세요.

반드시 다음 JSON 형식으로만 응답해야 합니다. 마크다운 코드블록(\`\`\`json 등)이나 불필요한 설명 없이 오직 순수한 JSON 객체만 출력하세요.
{
  "foodName": "식별된 음식 이름 (예: 연어 아보카도 샐러드와 통밀빵)",
  "calories": 480, // 총 칼로리 (정수, kcal)
  "carbs": 42, // 탄수화물 (정수, g)
  "protein": 34, // 단백질 (정수, g)
  "fat": 18, // 지방 (정수, g)
  "fiber": 6, // 식이섬유 (정수, g)
  "portion": "예상 섭취량 (예: 1인분 약 350g)",
  "aiComment": "다이어트 관점에서의 영양 분석 및 조언 (예: 양질의 단백질과 불포화지방이 풍부하여 훌륭합니다. 드레싱 양만 주의하세요.)"
}`;

  let lastError: unknown = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      // Clean possible markdown code fence
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        foodName: parsed.foodName || '식별된 음식',
        calories: Number(parsed.calories) || 300,
        carbs: Number(parsed.carbs) || 35,
        protein: Number(parsed.protein) || 20,
        fat: Number(parsed.fat) || 10,
        fiber: Number(parsed.fiber) || 3,
        portion: parsed.portion || '1인분',
        aiComment: parsed.aiComment || '균형 잡힌 식사를 유지해주세요.',
      };
    } catch (err) {
      console.warn(`[analyzeFoodImage] Model ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('음식 분석에 실패했습니다.');
}

// 당일 전체 식단 및 운동을 종합하여 AI 다이어트 예측 & 코칭 생성
export async function generateAICoachFeedback(data: {
  userProfile: { gender: string; age: number; height: number; weight: number; targetWeight: number; bmr: number; tdee: number };
  meals: Array<{ foodName: string; mealType: string; calories: number; carbs: number; protein: number; fat: number }>;
  workouts: Array<{ exerciseName: string; durationMinutes: number; intensity: string; caloriesBurned: number }>;
  calorieDeficit: number;
  projectedMonthlyKg: number;
}): Promise<{
  summary: string;
  strengths: string[];
  improvements: string[];
  tomorrowRecommendation: string;
}> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY 가 설정되지 않았습니다.');
  }

  const prompt = `당신은 1:1 맞춤 프리미엄 AI 다이어트/피트니스 코치입니다.
사용자의 신체 정보, 오늘 먹은 식단 목록, 오늘 수행한 운동 목록, 그리고 계산된 일일 칼로리 수지 데이터를 바탕으로 전문적이고 따뜻하며 동기부여가 되는 일일 총평과 다이어트 예측 피드백을 제공해주세요.

사용자 데이터:
${JSON.stringify(data, null, 2)}

반드시 다음 JSON 형식으로만 응답해야 합니다. 마크다운(\`\`\`json) 없이 순수 JSON만 반환하세요:
{
  "summary": "오늘 하루의 다이어트 총평 (2~3문장으로 격려와 현재 감량 궤도 요약)",
  "strengths": [
    "오늘 잘한 점 1 (예: 고단백 식단 구성)",
    "오늘 잘한 점 2 (예: 목표 운동량 400kcal 달성)"
  ],
  "improvements": [
    "보완할 점 1 (예: 저녁 탄수화물 비중 조절)",
    "보완할 점 2 (예: 수분 섭취 부족 주의)"
  ],
  "tomorrowRecommendation": "내일 실천할 구체적인 행동 가이드 1~2문장 (예: 내일은 점심에 닭가슴살 샐러드를 선택하고 인터벌 러닝 25분을 진행해보세요)"
}`;

  let lastError: unknown = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`[generateAICoachFeedback] Model ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('코칭 피드백 생성 실패');
}

export interface WorkoutAnalysisResult {
  exerciseName: string;
  category: 'cardio' | 'strength' | 'sports' | 'flexibility';
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  estimatedMet: number;
  caloriesBurned: number;
  aiComment: string;
}

// 사용자가 자유롭게 입력한 운동 텍스트를 분석하여 종목, 시간, 강도, 소모 칼로리 산출
export async function analyzeWorkoutWithGemini(params: {
  userInput: string;
  weightKg: number;
  currentDuration?: number;
  currentIntensity?: string;
}): Promise<WorkoutAnalysisResult> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY 가 설정되지 않았습니다.');
  }

  const { userInput, weightKg, currentDuration, currentIntensity } = params;

  const prompt = `당신은 전문 운동생리학자 및 퍼스널 피트니스 트레이너 AI입니다.
사용자가 자유롭게 입력한 운동 설명(텍스트 또는 자연어)을 분석하여 정확한 운동 종목명, 카테고리, 시간(분), 운동 강도, 과학적 MET(대사당량) 수치, 그리고 체중 기반 소모 칼로리를 계산해주세요.

사용자 입력 정보:
- 운동 설명: "${userInput}"
- 사용자 체중: ${weightKg || 70} kg
- 현재 설정된 시간(힌트): ${currentDuration || 30} 분
- 현재 설정된 강도(힌트): ${currentIntensity || 'moderate'}

계산 지침:
1. 사용자가 텍스트에 시간(예: "40분", "1시간 30분", "3게임", "5세트")을 언급했다면 이를 분(minutes) 단위 정수로 변환하세요. 언급이 없다면 현재 설정된 시간 또는 해당 운동의 표준 시간을 적용하세요.
2. 공인된 MET(대사당량) 데이터베이스(Ainsworth Compendium of Physical Activities) 기준을 적용하세요.
3. 소모 칼로리 공식: \`소모 칼로리 = MET × 체중(kg) × (시간(분) / 60) × 강도배율\`
   - 강도 배율: light=0.85, moderate=1.0, vigorous=1.25
4. 카테고리는 반드시 다음 4개 중 하나만 선택: "cardio" (유산소), "strength" (근력/무산소), "sports" (스포츠/구기), "flexibility" (스트레칭/요가)
5. 강도는 반드시 "light", "moderate", "vigorous" 중 하나만 선택

반드시 다음 JSON 형식으로만 응답하세요. 마크다운(\`\`\`json) 없이 순수 JSON만 반환하세요:
{
  "exerciseName": "간결하고 명확한 운동 이름 (예: 주짓수 스파링, 계단 오르기 30층, 볼더링 클라이밍 등)",
  "category": "cardio",
  "durationMinutes": 40,
  "intensity": "moderate",
  "estimatedMet": 8.0,
  "caloriesBurned": 373,
  "aiComment": "이 운동의 효과 및 다이어트/건강 관점에서의 전문 피드백 (1~2문장)"
}`;

  let lastError: unknown = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const duration = Number(parsed.durationMinutes) || currentDuration || 30;
      const met = Number(parsed.estimatedMet) || 6.0;
      const intensity = (['light', 'moderate', 'vigorous'].includes(parsed.intensity) ? parsed.intensity : (currentIntensity || 'moderate')) as 'light' | 'moderate' | 'vigorous';
      
      // Fallback calculation if LLM missed it
      const intensityFactor = intensity === 'light' ? 0.85 : intensity === 'vigorous' ? 1.25 : 1.0;
      const calculatedCalories = Math.round(met * (weightKg || 70) * (duration / 60) * intensityFactor);

      return {
        exerciseName: parsed.exerciseName || userInput.trim(),
        category: (['cardio', 'strength', 'sports', 'flexibility'].includes(parsed.category) ? parsed.category : 'cardio') as WorkoutAnalysisResult['category'],
        durationMinutes: duration,
        intensity,
        estimatedMet: met,
        caloriesBurned: Number(parsed.caloriesBurned) || calculatedCalories,
        aiComment: parsed.aiComment || '훌륭한 운동 루틴입니다! 꾸준히 유지해보세요.',
      };
    } catch (err) {
      console.warn(`[analyzeWorkoutWithGemini] Model ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('운동 분석에 실패했습니다.');
}

import { LateNightSnackInput, LateNightSnackPrediction } from '@/types/lateSnack';

// 아버지를 위한 심야 야식 섭취 시 신체 건강 영향 예측 및 효도 처방
export async function predictLateNightSnackHealthImpact(
  input: LateNightSnackInput
): Promise<LateNightSnackPrediction> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY 가 설정되지 않았습니다.');
  }

  const { time, foodName, targetAgeGroup = '50대~60대 중장년층 아버지', healthConditions = [] } = input;

  const prompt = `당신은 최고 권위의 노인의학/소화기내과 전문의이자 임상영양사, 그리고 따뜻한 가정의학과 전문의 AI입니다.
밤늦게 자꾸 야식을 드시려는 아버지를 위해, 입력된 섭취 시간과 야식 메뉴가 신체 건강에 미치는 영향을 과학적이고 객관적으로 시뮬레이션해주세요.
또한 무조건 굶으라는 잔소리가 아니라, 배고픔을 달랠 수 있는 속 편한 대체 간식 3가지와 아버지가 기분 나쁘지 않게 공감할 수 있는 따뜻한 효도 설득 메시지를 작성해주세요.

입력 정보:
- 섭취 예정 시간: "${time}"
- 먹으려는 야식 메뉴: "${foodName}"
- 대상자: ${targetAgeGroup}
- 주의 질환/상태: ${healthConditions.length > 0 ? healthConditions.join(', ') : '일반적인 중장년층 (혈관/혈당/역류성 식도염 취약)'}

의학적 분석 고려사항:
1. 섭취 후 취침까지의 시간 간격 (위장 배출 시간은 탄수화물 2시간, 단백질 3시간, 지방/기름진음식 4시간 이상 소요)
2. 횡와위(누운 자세) 시 하부 식도 괄약근 이완 및 위산 역류 위험도
3. 야간 멜라토닌 분비와 췌장 베타세포 인슐린 분비 저하에 따른 극심한 혈당 스파이크
4. 심부 체온 하강 방해로 인한 깊은 수면(NREM 3단계) 박탈 및 다음 날 아침 두통/부종/만성 피로
5. 나트륨과 포화지방에 의한 야간 혈압 상승 위험

반드시 다음 JSON 형식으로만 응답해야 합니다. 마크다운(\`\`\`json) 없이 순수 JSON만 반환하세요:
{
  "foodName": "${foodName}",
  "time": "${time}",
  "estimatedCalories": 550, // 예상 칼로리 (정수, kcal)
  "riskLevel": "warning", // "safe", "caution", "warning", "danger" 중 1개
  "riskScore": 78, // 0 (아주 안전) ~ 100 (극도로 위험)
  "summaryVerdict": "핵심 결론 요약 (예: 밤 11시 30분에 라면을 드시고 1시간 내 누우시면 위산 역류와 야간 고혈당이 불가피합니다.)",
  "immediateImpact": {
    "sleepQualityPenalty": 45, // 수면 질 저하율 % (정수, 예: 45)
    "acidRefluxRisk": "high", // "low", "moderate", "high" 중 1개
    "morningFatigue": "내일 아침 예상 피로도 및 얼굴/손발 부종 설명 (1~2문장)"
  },
  "metabolicImpact": {
    "bloodSugarSpike": "야간 인슐린 저항성과 혈당 스파이크 영향 설명 (1~2문장)",
    "visceralFatRisk": "내장지방 축적 및 심혈관계 부담 설명 (1~2문장)"
  },
  "safeAlternatives": [
    {
      "name": "대체 추천 간식 1 (예: 따뜻한 둥글레차 또는 카모마일)",
      "portion": "1컵",
      "reason": "위산 분비 없이 공복감을 달래고 수면을 유도합니다."
    },
    {
      "name": "대체 추천 간식 2 (예: 방울토마토 5~6알)",
      "portion": "작은 한 줌",
      "reason": "칼로리와 혈당 부담이 거의 없고 가벼운 씹는 포만감을 줍니다."
    },
    {
      "name": "대체 추천 간식 3 (예: 따뜻하게 데운 저지방 우유)",
      "portion": "반 컵 (100ml)",
      "reason": "트립토판 성분이 풍부하여 편안한 잠자리를 돕습니다."
    }
  ],
  "filialMessage": "아버지께 카카오톡으로 보낼 수 있는 애정 어린 설득 메시지 (아버지를 위하는 자식의 진심이 담긴 다정한 존댓말 2~3문장. 잔소리가 아닌 건강을 염려하는 마음 표현)"
}`;

  let lastError: unknown = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        foodName: parsed.foodName || foodName,
        time: parsed.time || time,
        estimatedCalories: Number(parsed.estimatedCalories) || 400,
        riskLevel: ['safe', 'caution', 'warning', 'danger'].includes(parsed.riskLevel)
          ? parsed.riskLevel
          : 'warning',
        riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 60)),
        summaryVerdict: parsed.summaryVerdict || '늦은 시간 야식은 소화기와 수면에 큰 부담을 줄 수 있습니다.',
        immediateImpact: {
          sleepQualityPenalty: Number(parsed.immediateImpact?.sleepQualityPenalty) || 35,
          acidRefluxRisk: ['low', 'moderate', 'high'].includes(parsed.immediateImpact?.acidRefluxRisk)
            ? parsed.immediateImpact.acidRefluxRisk
            : 'moderate',
          morningFatigue:
            parsed.immediateImpact?.morningFatigue ||
            '음식물이 위장에 남아 얕은 잠을 자게 되며, 내일 아침 몸이 무겁고 얼굴이 부을 수 있습니다.',
        },
        metabolicImpact: {
          bloodSugarSpike:
            parsed.metabolicImpact?.bloodSugarSpike ||
            '밤에는 인슐린 분비가 둔화되어 혈당이 장시간 높게 유지될 수 있습니다.',
          visceralFatRisk:
            parsed.metabolicImpact?.visceralFatRisk ||
            '소비되지 못한 잉여 에너지가 전부 복부 내장지방으로 빠르게 전환됩니다.',
        },
        safeAlternatives: Array.isArray(parsed.safeAlternatives) && parsed.safeAlternatives.length > 0
          ? parsed.safeAlternatives
          : [
              { name: '따뜻한 보리차/둥글레차', portion: '1컵', reason: '속을 따뜻하게 데워 허기를 진정시키고 숙면을 돕습니다.' },
              { name: '방울토마토', portion: '5알', reason: '혈당과 위장 부담 없이 씹는 만족감을 줍니다.' },
              { name: '따뜻한 우유 반 컵', portion: '100ml', reason: '수면 유도 호르몬 생성을 도와줍니다.' },
            ],
        filialMessage:
          parsed.filialMessage ||
          '아버지, 밤늦게 출출하셨죠? 지금 드시면 밤새 속도 부대끼고 잠도 깊이 못 주무실까 봐 걱정돼요. 따뜻한 차 한 잔 드시고 내일 아침에 맛있는 거 같이 먹어요!',
      };
    } catch (err) {
      console.warn(`[predictLateNightSnackHealthImpact] Model ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('야식 건강 예측 분석에 실패했습니다.');
}



