import { ActivityLevel, ExerciseIntensity, UserProfile, MealRecord, WorkoutRecord, DietPrediction } from '@/types/diet';

// 활동 계수
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // 좌식 생활 (운동 거의 안 함)
  light: 1.375, // 가벼운 활동 (주 1~3회 가벼운 운동)
  moderate: 1.55, // 보통 활동 (주 3~5회 중간 강도 운동)
  active: 1.725, // 적극적 활동 (주 6~7회 강한 운동)
  very_active: 1.9, // 매우 활동적 (고강도 훈련, 육체 노동)
};

// Mifflin-St Jeor 기초대사량(BMR) 계산
export function calculateBMR(gender: 'male' | 'female', weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

// 총 일일 에너지 소비량(TDEE) 계산 (기본 일상생활 유지 칼로리)
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

// 대표 운동별 기본 MET (대사당량)
export const EXERCISE_METS: Record<string, number> = {
  '러닝/조깅': 8.5,
  '빠른 걷기/산책': 4.0,
  '웨이트 트레이닝(헬스)': 6.0,
  '사이클/실내자전거': 7.0,
  '수영': 7.5,
  '줄넘기': 10.0,
  '필라테스/요가': 3.5,
  'HIIT/서킷 트레이닝': 9.0,
  '계단 오르기': 8.0,
  '축구/농구/배드민턴': 7.5,
  '홈트레이닝(체중운동)': 5.5,
  '기타 운동': 5.0,
};

// 운동 강도 배율
export const INTENSITY_FACTORS: Record<ExerciseIntensity, number> = {
  light: 0.85,
  moderate: 1.0,
  vigorous: 1.25,
};

// 운동 소모 칼로리 계산 (MET * 체중(kg) * 시간(h) * 강도보정)
export function calculateExerciseCalories(
  exerciseName: string,
  durationMinutes: number,
  intensity: ExerciseIntensity,
  weightKg: number = 70
): number {
  let met = EXERCISE_METS[exerciseName];
  if (!met) {
    // 부분 매칭 검색
    const found = Object.keys(EXERCISE_METS).find((key) => exerciseName.includes(key) || key.includes(exerciseName));
    met = found ? EXERCISE_METS[found] : 5.0;
  }

  const factor = INTENSITY_FACTORS[intensity] || 1.0;
  const hours = durationMinutes / 60;
  const burned = met * weightKg * hours * factor;
  return Math.round(burned);
}

// 하루 데이터 종합 분석 및 체중 변화 예측 (규칙 기반 기본 산출)
export function computeDietPrediction(
  profile: UserProfile,
  meals: MealRecord[],
  workouts: WorkoutRecord[]
): DietPrediction {
  const totalIntake = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const carbsTotal = Math.round(meals.reduce((sum, m) => sum + (m.carbs || 0), 0));
  const proteinTotal = Math.round(meals.reduce((sum, m) => sum + (m.protein || 0), 0));
  const fatTotal = Math.round(meals.reduce((sum, m) => sum + (m.fat || 0), 0));

  const workoutBurn = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  // 총 에너지 소비 = TDEE(기초+생활) + 당일 특별 운동 소모량
  // (참고: TDEE에 이미 약간의 일상 운동이 포함될 수 있으나 다이어트 예측시 추가 운동은 추가 소비로 합산)
  const totalBurn = profile.tdee + workoutBurn;

  // 순 칼로리 (Net Calorie) = 섭취 - 총 소비
  // 음수면 결손(Deficit) -> 감량 진행
  const netCalories = totalIntake - totalBurn;
  const calorieDeficit = totalBurn - totalIntake; // 양수면 감량 효과

  // 1kg 순수 지방 = 약 7,700 kcal
  // 하루 적자가 500kcal면 7일에 3500kcal = 약 0.45kg 감량
  const projectedWeeklyKg = Number((-((calorieDeficit * 7) / 7700)).toFixed(2));
  const projectedMonthlyKg = Number((-((calorieDeficit * 30) / 7700)).toFixed(2));

  // 목표 감량치 및 도달 일수 계산
  const remainingWeightToLose = profile.weight - profile.targetWeight;
  let daysToTarget: number | null = null;
  if (remainingWeightToLose > 0 && calorieDeficit > 100) {
    const totalDeficitNeeded = remainingWeightToLose * 7700;
    daysToTarget = Math.round(totalDeficitNeeded / calorieDeficit);
  }

  // 권장 단백질량 (체중 1kg당 1.6g 기준)
  const recommendedProtein = Math.round(profile.weight * 1.6);
  const proteinTargetRatio = recommendedProtein > 0 ? Math.min(Math.round((proteinTotal / recommendedProtein) * 100), 150) : 100;

  // 다이어트 점수 (0 ~ 100점)
  let dietScore = 70;
  let healthVerdict: DietPrediction['healthVerdict'] = 'good';

  if (calorieDeficit >= 300 && calorieDeficit <= 900) {
    // 이상적인 건강한 적자 범위 (-300 ~ -900 kcal)
    dietScore += 20;
    healthVerdict = 'superb';
  } else if (calorieDeficit > 900) {
    // 지나치게 굶는 다이어트 (근손실 위험)
    dietScore += 5;
    healthVerdict = 'too_little';
  } else if (calorieDeficit >= 0 && calorieDeficit < 300) {
    // 유지 또는 미세 감량
    dietScore += 10;
    healthVerdict = 'moderate';
  } else {
    // 과잉 섭취
    dietScore -= 15;
    healthVerdict = 'over_intake';
  }

  // 단백질 보너스/페널티
  if (proteinTargetRatio >= 80) dietScore += 10;
  else if (proteinTargetRatio < 50) dietScore -= 10;

  // 운동 수행 보너스
  if (workoutBurn >= 250) dietScore += 5;

  dietScore = Math.max(10, Math.min(100, dietScore));

  // 기본 AI 피드백 문구 생성 (서버 API 호출 전 또는 오프라인 기본값)
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (calorieDeficit > 0) {
    strengths.push(`소비 칼로리가 섭취보다 ${calorieDeficit.toLocaleString()} kcal 많아 감량 페이스입니다.`);
  } else {
    improvements.push(`섭취 칼로리가 소비보다 ${Math.abs(calorieDeficit).toLocaleString()} kcal 많아 유지 또는 증량 구간입니다.`);
  }

  if (proteinTargetRatio >= 80) {
    strengths.push(`권장 단백질 목표(${recommendedProtein}g)의 ${proteinTargetRatio}%를 섭취하여 근육 보존에 유리합니다.`);
  } else {
    improvements.push(`단백질 섭취량(${proteinTotal}g)이 목표치(${recommendedProtein}g)보다 부족합니다. 닭가슴살/달걀/두부 등을 추가해보세요.`);
  }

  if (workoutBurn >= 300) {
    strengths.push(`운동으로 ${workoutBurn.toLocaleString()} kcal를 적극 소모하여 대사량을 끌어올렸습니다.`);
  } else if (workoutBurn === 0) {
    improvements.push(`오늘은 특별한 운동 기록이 없습니다. 가벼운 스트레칭이나 20분 걷기를 추천합니다.`);
  }

  const summary =
    calorieDeficit > 400
      ? `훌륭한 다이어트 하루였습니다! 현재 페이스 유지 시 4주 후 약 ${Math.abs(projectedMonthlyKg)}kg 감량이 기대됩니다.`
      : calorieDeficit > 0
      ? `안정적인 유지 및 완만한 감량 궤도입니다. 소모 칼로리를 조금 더 늘리면 가속도가 붙습니다.`
      : `칼로리 섭취가 많은 하루였습니다. 내일은 저녁 식단을 가볍게 하고 유산소 운동을 병행해 균형을 맞춰보세요.`;

  const tomorrowRecommendation =
    calorieDeficit > 0
      ? '내일도 현재의 식단 밸런스를 유지하고, 수분(물 2L) 섭취와 30분 운동 루틴을 이어가보세요.'
      : '내일 아침/점심에 탄수화물 비중을 조금 줄이고, 단백질 위주의 식단과 40분 이상의 유산소 운동을 계획해보세요.';

  return {
    bmr: profile.bmr,
    tdee: profile.tdee,
    totalIntake,
    workoutBurn,
    netCalories,
    calorieDeficit,
    projectedWeeklyKg,
    projectedMonthlyKg,
    daysToTarget,
    healthVerdict,
    dietScore,
    macros: {
      carbsTotal,
      proteinTotal,
      fatTotal,
      proteinTargetRatio,
    },
    aiFeedback: {
      summary,
      strengths,
      improvements,
      tomorrowRecommendation,
    },
  };
}

// 기본 유저 프로필 생성
export function getDefaultProfile(): UserProfile {
  const gender = 'male';
  const age = 28;
  const height = 175;
  const weight = 74;
  const targetWeight = 68;
  const activityLevel: ActivityLevel = 'moderate';
  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);

  return {
    gender,
    age,
    height,
    weight,
    targetWeight,
    activityLevel,
    bmr,
    tdee,
  };
}

