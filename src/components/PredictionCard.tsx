'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  CalendarCheck,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DietPrediction, UserProfile, MealRecord, WorkoutRecord } from '@/types/diet';

interface PredictionCardProps {
  prediction: DietPrediction;
  profile: UserProfile;
  meals: MealRecord[];
  workouts: WorkoutRecord[];
  onUpdateFeedback?: (feedback: DietPrediction['aiFeedback']) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  profile,
  meals,
  workouts,
  onUpdateFeedback,
}) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [feedback, setFeedback] = useState(prediction.aiFeedback);

  const {
    calorieDeficit,
    projectedWeeklyKg,
    projectedMonthlyKg,
    daysToTarget,
    dietScore,
  } = prediction;

  const targetWeightDiff = profile.weight - profile.targetWeight;

  // Grade calculation
  let grade = 'A';
  let gradeColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800';
  if (dietScore >= 90) {
    grade = 'S';
    gradeColor = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-700';
  } else if (dietScore >= 75) {
    grade = 'A';
    gradeColor = 'text-teal-600 bg-teal-100 dark:bg-teal-900/40 border-teal-400 dark:border-teal-700';
  } else if (dietScore >= 60) {
    grade = 'B';
    gradeColor = 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-700';
  } else {
    grade = 'C';
    gradeColor = 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-700';
  }

  // Request deep Gemini AI prediction & coaching
  const handleRequestAIFeedback = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/predict-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profile,
          meals: meals.map((m) => ({
            foodName: m.foodName,
            mealType: m.mealType,
            calories: m.calories,
            carbs: m.carbs,
            protein: m.protein,
            fat: m.fat,
          })),
          workouts: workouts.map((w) => ({
            exerciseName: w.exerciseName,
            durationMinutes: w.durationMinutes,
            intensity: w.intensity,
            caloriesBurned: w.caloriesBurned,
          })),
          calorieDeficit,
          projectedMonthlyKg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI 피드백 생성 실패');

      setFeedback(data);
      if (onUpdateFeedback) {
        onUpdateFeedback(data);
      }

      // Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'AI 코칭 피드백 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              AI Diet Prediction Engine
            </span>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              다이어트 성과 & 감량 예측
            </h2>
          </div>
        </div>

        <button
          onClick={handleRequestAIFeedback}
          disabled={isLoadingAI}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition group"
        >
          {isLoadingAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI 코치가 분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition" />
              <span>Gemini 실시간 심층 코칭</span>
            </>
          )}
        </button>
      </div>

      {/* Prediction Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {/* Diet Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 block">오늘의 다이어트 점수</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{dietScore}</span>
              <span className="text-xs font-semibold text-zinc-400">/ 100점</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              식단 & 운동 종합 평가
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${gradeColor}`}
          >
            <span className="text-2xl leading-none">{grade}</span>
            <span className="text-[9px] font-bold uppercase tracking-tighter">등급</span>
          </div>
        </div>

        {/* 30-Day Weight Prediction */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">한 달(30일) 유지 시</span>
            {calorieDeficit >= 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-3xl font-black ${
                calorieDeficit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {calorieDeficit >= 0 ? projectedMonthlyKg : `+${Math.abs(projectedMonthlyKg)}`}
            </span>
            <span className="text-xs font-semibold text-zinc-400">kg 예측</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            주당 약 {calorieDeficit >= 0 ? projectedWeeklyKg : `+${Math.abs(projectedWeeklyKg)}`}kg 페이스
          </p>
        </div>

        {/* Target D-Day Countdown */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">목표 체중({profile.targetWeight}kg) 도달</span>
            <Target className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            {daysToTarget !== null ? (
              <>
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400">D-{daysToTarget}</span>
                <span className="text-xs font-semibold text-zinc-400">일</span>
              </>
            ) : (
              <span className="text-lg font-bold text-zinc-400">페이스 계산 중</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            총 {targetWeightDiff > 0 ? `${targetWeightDiff.toFixed(1)}kg 감량 목표` : '유지 모드'}
          </p>
        </div>
      </div>

      {/* AI Coaching Report Box */}
      <div className="bg-white/90 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 space-y-4">
        {/* Summary */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI 다이어트 코치 일일 총평</h4>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {feedback.summary}
            </p>
          </div>
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Strengths */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>오늘 잘한 점 (칭찬)</span>
            </div>
            <ul className="space-y-1.5">
              {feedback.strengths.map((item, idx) => (
                <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>개선 & 주의점</span>
            </div>
            <ul className="space-y-1.5">
              {feedback.improvements.map((item, idx) => (
                <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tomorrow Recommendation */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5">
          <CalendarCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">
              내일 실천 추천 미션
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
              {feedback.tomorrowRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

