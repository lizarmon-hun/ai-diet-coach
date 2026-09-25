'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings, Flame, Moon } from 'lucide-react';
import { UserProfile } from '@/types/diet';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenProfile: () => void;
  onOpenLateSnack?: () => void;
  profile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onOpenProfile,
  onOpenLateSnack,
  profile,
}) => {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">AI 다이어트 코치</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">식단 사진 & 운동 분석 기반 체중 예측</p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1 sm:gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <button
            onClick={handlePrevDay}
            aria-label="Previous day"
            className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{selectedDate}</span>
            {isToday && (
              <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-emerald-500 text-white rounded-md font-normal">
                오늘
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            aria-label="Next day"
            className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="text-xs px-2 py-1 font-medium text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all hidden md:block"
            >
              오늘로
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Father's Late-Night Snack Button */}
          {onOpenLateSnack && (
            <button
              onClick={onOpenLateSnack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 hover:border-purple-400 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:shadow-sm transition-all text-xs font-bold"
              title="아버지를 위한 심야 야식 건강 예측기"
            >
              <Moon className="w-3.5 h-3.5 fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400" />
              <span className="hidden sm:inline">야식 예측 (아버지 케어)</span>
              <span className="sm:hidden">야식</span>
            </button>
          )}

          {/* Profile & Target Pill */}
          <button
            onClick={onOpenProfile}
          className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:shadow-sm transition-all text-xs sm:text-sm font-medium"
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-zinc-400 block leading-none">신체 스펙</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
              {profile.weight}kg → {profile.targetWeight}kg
            </span>
          </div>
        </button>
        </div>
      </div>
    </header>
  );
};

