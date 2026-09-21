export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  activityLevel: ActivityLevel;
  bmr: number; // 기초대사량 (자동 계산)
  tdee: number; // 유지대사량 (자동 계산)
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  photoUrl?: string; // base64 or blob URL
  calories: number; // kcal
  carbs: number; // 탄수화물 (g)
  protein: number; // 단백질 (g)
  fat: number; // 지방 (g)
  fiber?: number; // 식이섬유 (g)
  aiComment?: string;
  createdAt: string;
}

export type ExerciseCategory = 'cardio' | 'strength' | 'sports' | 'flexibility';
export type ExerciseIntensity = 'light' | 'moderate' | 'vigorous';

export interface WorkoutRecord {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseName: string;
  category: ExerciseCategory;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  caloriesBurned: number; // kcal
  notes?: string;
  createdAt: string;
}

export interface DietPrediction {
  bmr: number; // 기초대사량
  tdee: number; // 활동대사량(기초활동 포함)
  totalIntake: number; // 섭취 칼로리
  workoutBurn: number; // 운동 소모 칼로리
  netCalories: number; // 순 칼로리 = 섭취 - (TDEE + 운동) (음수면 적자/감량)
  calorieDeficit: number; // 칼로리 적자량 (양수면 감량 효과)
  projectedWeeklyKg: number; // 이번 주 감량 예측치 (kg, 음수면 감량)
  projectedMonthlyKg: number; // 30일 후 예상 감량치 (kg, 음수면 감량)
  daysToTarget: number | null; // 목표 체중 도달 예상 일수
  healthVerdict: 'superb' | 'good' | 'moderate' | 'over_intake' | 'too_little';
  dietScore: number; // 0 ~ 100점
  macros: {
    carbsTotal: number;
    proteinTotal: number;
    fatTotal: number;
    proteinTargetRatio: number; // 권장 단백질 대비 달성률 (%)
  };
  aiFeedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
    tomorrowRecommendation: string;
  };
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealRecord[];
  workouts: WorkoutRecord[];
  prediction?: DietPrediction;
}

