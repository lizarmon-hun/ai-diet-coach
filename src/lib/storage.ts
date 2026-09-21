import { UserProfile, DayLog, MealRecord, WorkoutRecord } from '@/types/diet';
import { getDefaultProfile, computeDietPrediction } from './calculator';

const PROFILE_KEY = 'ai_diet_profile_v1';
const LOGS_KEY = 'ai_diet_logs_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const defaultProf = getDefaultProfile();
      saveUserProfile(defaultProf);
      return defaultProf;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function getAllDayLogs(): Record<string, DayLog> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      // Create initial sample day log for today
      const today = getTodayDateString();
      const profile = loadUserProfile();
      const sampleMeals: MealRecord[] = [
        {
          id: 'sample-meal-1',
          date: today,
          mealType: 'breakfast',
          foodName: '그릭 요거트와 블루베리, 그래놀라',
          calories: 280,
          carbs: 32,
          protein: 18,
          fat: 8,
          fiber: 4,
          aiComment: '유익균과 항산화 성분, 단백질이 균형 잡힌 가벼운 아침 식사입니다.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-meal-2',
          date: today,
          mealType: 'lunch',
          foodName: '닭가슴살 현미 포케 샐러드',
          calories: 520,
          carbs: 58,
          protein: 42,
          fat: 14,
          fiber: 7,
          aiComment: '고단백 복합 탄수화물 식단으로 다이어트에 최적화된 점심입니다.',
          createdAt: new Date().toISOString(),
        },
      ];

      const sampleWorkouts: WorkoutRecord[] = [
        {
          id: 'sample-workout-1',
          date: today,
          exerciseName: '러닝/조깅',
          category: 'cardio',
          durationMinutes: 35,
          intensity: 'moderate',
          caloriesBurned: 360,
          notes: '한강변 가벼운 조깅 5km',
          createdAt: new Date().toISOString(),
        },
      ];

      const samplePrediction = computeDietPrediction(profile, sampleMeals, sampleWorkouts);
      const initialLogs: Record<string, DayLog> = {
        [today]: {
          date: today,
          meals: sampleMeals,
          workouts: sampleWorkouts,
          prediction: samplePrediction,
        },
      };
      localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getDayLog(date: string, profile: UserProfile): DayLog {
  const logs = getAllDayLogs();
  if (logs[date]) {
    const log = logs[date];
    // Re-calculate prediction
    log.prediction = computeDietPrediction(profile, log.meals || [], log.workouts || []);
    return log;
  }
  return {
    date,
    meals: [],
    workouts: [],
    prediction: computeDietPrediction(profile, [], []),
  };
}

export function saveDayLog(dayLog: DayLog): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getAllDayLogs();
    logs[dayLog.date] = dayLog;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save day log:', err);
  }
}

export function addMealToDay(date: string, meal: MealRecord, profile: UserProfile): DayLog {
  const log = getDayLog(date, profile);
  const updatedMeals = [meal, ...log.meals];
  const newPrediction = computeDietPrediction(profile, updatedMeals, log.workouts);
  const updatedLog: DayLog = {
    ...log,
    meals: updatedMeals,
    prediction: newPrediction,
  };
  saveDayLog(updatedLog);
  return updatedLog;
}

export function deleteMealFromDay(date: string, mealId: string, profile: UserProfile): DayLog {
  const log = getDayLog(date, profile);
  const updatedMeals = log.meals.filter((m) => m.id !== mealId);
  const newPrediction = computeDietPrediction(profile, updatedMeals, log.workouts);
  const updatedLog: DayLog = {
    ...log,
    meals: updatedMeals,
    prediction: newPrediction,
  };
  saveDayLog(updatedLog);
  return updatedLog;
}

export function addWorkoutToDay(date: string, workout: WorkoutRecord, profile: UserProfile): DayLog {
  const log = getDayLog(date, profile);
  const updatedWorkouts = [workout, ...log.workouts];
  const newPrediction = computeDietPrediction(profile, log.meals, updatedWorkouts);
  const updatedLog: DayLog = {
    ...log,
    workouts: updatedWorkouts,
    prediction: newPrediction,
  };
  saveDayLog(updatedLog);
  return updatedLog;
}

export function deleteWorkoutFromDay(date: string, workoutId: string, profile: UserProfile): DayLog {
  const log = getDayLog(date, profile);
  const updatedWorkouts = log.workouts.filter((w) => w.id !== workoutId);
  const newPrediction = computeDietPrediction(profile, log.meals, updatedWorkouts);
  const updatedLog: DayLog = {
    ...log,
    workouts: updatedWorkouts,
    prediction: newPrediction,
  };
  saveDayLog(updatedLog);
  return updatedLog;
}

