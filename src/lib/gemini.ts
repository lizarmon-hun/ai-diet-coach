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

