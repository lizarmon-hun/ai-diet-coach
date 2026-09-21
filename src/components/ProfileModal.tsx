'use client';

import React, { useState } from 'react';
import { X, User, Activity, Target, Flame, Info } from 'lucide-react';
import { UserProfile, ActivityLevel } from '@/types/diet';
import { calculateBMR, calculateTDEE } from '@/lib/calculator';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [age, setAge] = useState<number>(profile.age);
  const [height, setHeight] = useState<number>(profile.height);
  const [weight, setWeight] = useState<number>(profile.weight);
  const [targetWeight, setTargetWeight] = useState<number>(profile.targetWeight);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);

  if (!isOpen) return null;

  const currentBmr = calculateBMR(gender, weight, height, age);
  const currentTdee = calculateTDEE(currentBmr, activityLevel);
  const weightDiff = weight - targetWeight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      gender,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      activityLevel,
      bmr: currentBmr,
      tdee: currentTdee,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">신체 프로필 & 다이어트 목표</h2>
              <p className="text-xs text-zinc-500">기초대사량과 활동대사량을 자동 산출합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Real-time Metabolic Stats Preview */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
            <div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>예상 기초대사량 (BMR)</span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {currentBmr.toLocaleString()}{' '}
                <span className="text-xs font-normal text-zinc-500">kcal</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">가만히 숨만 쉬어도 소모</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-teal-700 dark:text-teal-400 font-medium">
                <Activity className="w-3.5 h-3.5" />
                <span>유지 대사량 (TDEE)</span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {currentTdee.toLocaleString()}{' '}
                <span className="text-xs font-normal text-zinc-500">kcal</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">체중 유지에 필요한 일일 소비</p>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">성별</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                  gender === 'male'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                남성 (Male)
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                  gender === 'female'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                여성 (Female)
              </button>
            </div>
          </div>

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">나이</label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-400">세</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">키</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(Math.max(50, Number(e.target.value)))}
                  className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-400">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">현재 체중</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(20, Number(e.target.value)))}
                  className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-400">kg</span>
              </div>
            </div>
          </div>

          {/* Target Weight */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                목표 체중
              </label>
              <span className="text-xs text-emerald-600 font-medium">
                {weightDiff > 0 ? `${weightDiff.toFixed(1)}kg 감량 목표` : weightDiff < 0 ? `${Math.abs(weightDiff).toFixed(1)}kg 증량 목표` : '현재 체중 유지'}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Math.max(20, Number(e.target.value)))}
                className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-400">kg</span>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              평소 활동 수준 (기본 일상생활)
            </label>
            <div className="space-y-2">
              {[
                { id: 'sedentary', title: '좌식 생활', desc: '운동을 거의 하지 않음 (사무직 등)' },
                { id: 'light', title: '가벼운 활동', desc: '주 1~3회 가벼운 걷기나 운동' },
                { id: 'moderate', title: '보통 활동', desc: '주 3~5회 적당한 강도의 운동 (추천)' },
                { id: 'active', title: '적극적 활동', desc: '주 6~7회 강도 높은 운동' },
                { id: 'very_active', title: '매우 활동적', desc: '전문 운동 선수 또는 고강도 육체 노동' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    activityLevel === item.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="activityLevel"
                      checked={activityLevel === item.id}
                      onChange={() => setActivityLevel(item.id as ActivityLevel)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[11px] text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-500 flex gap-2 items-start">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              기초대사량(BMR)은 표준 임상 공식(Mifflin-St Jeor)으로 정확히 산출되며, 모든 다이어트 예측의 기준선으로 활용됩니다.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

