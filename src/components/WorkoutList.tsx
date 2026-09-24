'use client';

import React from 'react';
import { Dumbbell, Trash2, Plus, Flame, Clock, Sparkles } from 'lucide-react';
import { WorkoutRecord } from '@/types/diet';

interface WorkoutListProps {
  workouts: WorkoutRecord[];
  onOpenAddWorkout: () => void;
  onDeleteWorkout: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  cardio: { label: '유산소', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  strength: { label: '근력', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  sports: { label: '스포츠', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
  flexibility: { label: '스트레칭', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
};

export const WorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  onOpenAddWorkout,
  onDeleteWorkout,
}) => {
  const totalBurn = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">오늘의 운동 기록</h3>
            <span className="text-xs text-zinc-400">
              총 {workouts.length}건 ({totalMinutes}분 / {totalBurn.toLocaleString()} kcal 소모)
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAddWorkout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>운동 추가</span>
        </button>
      </div>

      {/* List */}
      {workouts.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
            <Dumbbell className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            아직 등록된 운동이 없습니다.
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">
            운동을 기록하면 체중 기반 소모 칼로리와 다이어트 예측치에 즉시 반영됩니다!
          </p>
          <button
            onClick={onOpenAddWorkout}
            className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
          >
            + 첫 운동 기록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const badge = CATEGORY_LABELS[workout.category] || {
              label: '운동',
              color: 'bg-zinc-100 text-zinc-700',
            };

            return (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/60 bg-zinc-50/50 dark:bg-zinc-800/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 fill-blue-500 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {workout.exerciseName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {workout.durationMinutes}분
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        -{workout.caloriesBurned} kcal
                      </span>
                      {workout.notes && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                            {workout.notes}
                          </span>
                        </>
                      )}
                    </div>

                    {workout.aiComment && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic line-clamp-1 flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                        {workout.aiComment}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteWorkout(workout.id)}
                  aria-label="Delete workout"
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

