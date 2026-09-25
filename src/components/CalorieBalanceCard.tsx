'use client';

import React from 'react';
import { Flame, Utensils, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { DietPrediction, UserProfile } from '@/types/diet';

interface CalorieBalanceCardProps {
  prediction: DietPrediction;
  profile: UserProfile;
}

export const CalorieBalanceCard: React.FC<CalorieBalanceCardProps> = ({
  prediction,
  profile,
}) => {
  const { totalIntake, workoutBurn, tdee, calorieDeficit, macros } = prediction;
  const totalBurn = tdee + workoutBurn;

  // Deficit status
  const isHealthyDeficit = calorieDeficit >= 300 && calorieDeficit <= 900;
  const isExtremeDeficit = calorieDeficit > 900;
  const isSurplus = calorieDeficit < 0;

  // Recommended macros: Protein ~ 1.6g/kg, Fat ~ 25% of intake, Carbs ~ remainder
  const recProtein = Math.round(profile.weight * 1.6);
  const proteinPercent = recProtein > 0 ? Math.round((macros.proteinTotal / recProtein) * 100) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Title & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Today&apos;s Calorie Balance</span>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            오늘의 칼로리 수지 분석
          </h3>
        </div>

        <div>
          {isHealthyDeficit && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <TrendingDown className="w-3.5 h-3.5" />
              최적의 감량 적자 구간
            </span>
          )}
          {isExtremeDeficit && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              극단적 절식 주의 (근손실 위험)
            </span>
          )}
          {isSurplus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <TrendingUp className="w-3.5 h-3.5" />
              섭취 칼로리 초과
            </span>
          )}
          {!isHealthyDeficit && !isExtremeDeficit && !isSurplus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              완만한 유지/감량 구간
            </span>
          )}
        </div>
      </div>

      {/* 3 Columns: Intake, Total Burn, Net Calorie Deficit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Total Intake */}
        <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
              <Utensils className="w-3.5 h-3.5" />
              <span>총 섭취 칼로리</span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {totalIntake.toLocaleString()}{' '}
              <span className="text-xs font-medium text-zinc-400">kcal</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-zinc-400">
            사진 기반 AI 추정치
          </div>
        </div>

        {/* Total Burn */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
              <Flame className="w-3.5 h-3.5" />
              <span>총 소비 칼로리</span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {totalBurn.toLocaleString()}{' '}
              <span className="text-xs font-medium text-zinc-400">kcal</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-zinc-500">
            <div>유지: {tdee.toLocaleString()}</div>
            <div className="text-blue-600 dark:text-blue-400 font-semibold">운동: +{workoutBurn.toLocaleString()}</div>
          </div>
        </div>

        {/* Net Deficit / Surplus */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            calorieDeficit >= 0
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div>
            <div
              className={`text-xs font-bold flex items-center gap-1.5 ${
                calorieDeficit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              <span>{calorieDeficit >= 0 ? '칼로리 적자(Deficit)' : '칼로리 잉여(Surplus)'}</span>
            </div>
            <div
              className={`text-2xl font-black mt-1 ${
                calorieDeficit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {calorieDeficit >= 0 ? `-${calorieDeficit.toLocaleString()}` : `+${Math.abs(calorieDeficit).toLocaleString()}`}{' '}
              <span className="text-xs font-medium text-zinc-500">kcal</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-zinc-500">
            {calorieDeficit >= 0 ? '지방 연소 진행 중' : '에너지 잉여 상태'}
          </div>
        </div>
      </div>

      {/* Visual Bar: Intake vs Burn Comparison */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
          <span>섭취 ({totalIntake} kcal)</span>
          <span>소비 ({totalBurn} kcal)</span>
        </div>
        <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((totalIntake / Math.max(1, totalBurn)) * 100))}%` }}
          />
        </div>
      </div>

      {/* Macronutrient Balance Details */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">오늘의 영양소(탄단지) 밸런스</span>
          <span className="text-xs text-zinc-500">
            단백질 권장({recProtein}g) 대비 <b className="text-emerald-600 dark:text-emerald-400">{proteinPercent}%</b> 달성
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40">
            <div className="text-zinc-400 text-[11px]">탄수화물</div>
            <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-0.5">{macros.carbsTotal}g</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40">
            <div className="text-blue-500 text-[11px] font-semibold">단백질 (근육 보존)</div>
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400 mt-0.5">
              {macros.proteinTotal}g <span className="text-[10px] text-zinc-400">/ {recProtein}g</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40">
            <div className="text-zinc-400 text-[11px]">지방</div>
            <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-0.5">{macros.fatTotal}g</div>
          </div>
        </div>
      </div>
    </div>
  );
};

