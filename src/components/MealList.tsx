'use client';

import React from 'react';
import { Utensils, Trash2, Plus, Sparkles } from 'lucide-react';
import { MealRecord } from '@/types/diet';

interface MealListProps {
  meals: MealRecord[];
  onOpenAddMeal: () => void;
  onDeleteMeal: (id: string) => void;
}

const MEAL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  breakfast: { label: '아침', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  lunch: { label: '점심', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' },
  dinner: { label: '저녁', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  snack: { label: '간식', color: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300' },
};

export const MealList: React.FC<MealListProps> = ({
  meals,
  onOpenAddMeal,
  onDeleteMeal,
}) => {
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">오늘의 식단 기록</h3>
            <span className="text-xs text-zinc-400">
              총 {meals.length}건 ({totalCalories.toLocaleString()} kcal)
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAddMeal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>식단 사진 등록</span>
        </button>
      </div>

      {/* List */}
      {meals.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
            <Utensils className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            아직 등록된 식단이 없습니다.
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">
            음식 사진을 올리면 Gemini AI가 자동으로 칼로리와 탄단지를 분석합니다!
          </p>
          <button
            onClick={onOpenAddMeal}
            className="px-3.5 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition"
          >
            + 첫 식단 사진 올리기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => {
            const badge = MEAL_TYPE_LABELS[meal.mealType] || {
              label: '식사',
              color: 'bg-zinc-100 text-zinc-700',
            };

            return (
              <div
                key={meal.id}
                className="flex items-start gap-3 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-900/60 bg-zinc-50/50 dark:bg-zinc-800/30 transition group"
              >
                {/* Photo Thumbnail */}
                {meal.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={meal.photoUrl}
                    alt={meal.foodName}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center shrink-0">
                    <Utensils className="w-7 h-7" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badge.color}`}>
                      {badge.label}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {meal.foodName}
                    </h4>
                  </div>

                  {/* Macros chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 mb-1">
                    <span className="font-extrabold text-orange-600 dark:text-orange-400">
                      {meal.calories} kcal
                    </span>
                    <span>•</span>
                    <span>탄 {meal.carbs}g</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">단 {meal.protein}g</span>
                    <span>•</span>
                    <span>지 {meal.fat}g</span>
                  </div>

                  {/* AI comment snippet */}
                  {meal.aiComment && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic line-clamp-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                      {meal.aiComment}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  aria-label="Delete meal"
                  className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

