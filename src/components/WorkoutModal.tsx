'use client';

import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Flame, Clock, Zap } from 'lucide-react';
import { WorkoutRecord, ExerciseCategory, ExerciseIntensity, UserProfile } from '@/types/diet';
import { calculateExerciseCalories, EXERCISE_METS } from '@/lib/calculator';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  profile: UserProfile;
  onSaveWorkout: (workout: WorkoutRecord) => void;
}

const PRESET_WORKOUTS: Array<{
  name: string;
  category: ExerciseCategory;
  defaultDuration: number;
  intensity: ExerciseIntensity;
}> = [
  { name: '웨이트 트레이닝(헬스)', category: 'strength', defaultDuration: 50, intensity: 'moderate' },
  { name: '러닝/조깅', category: 'cardio', defaultDuration: 30, intensity: 'moderate' },
  { name: '빠른 걷기/산책', category: 'cardio', defaultDuration: 40, intensity: 'light' },
  { name: '사이클/실내자전거', category: 'cardio', defaultDuration: 45, intensity: 'moderate' },
  { name: '수영', category: 'sports', defaultDuration: 45, intensity: 'moderate' },
  { name: '줄넘기', category: 'cardio', defaultDuration: 20, intensity: 'vigorous' },
  { name: 'HIIT/서킷 트레이닝', category: 'cardio', defaultDuration: 25, intensity: 'vigorous' },
  { name: '필라테스/요가', category: 'flexibility', defaultDuration: 50, intensity: 'light' },
  { name: '홈트레이닝(체중운동)', category: 'strength', defaultDuration: 35, intensity: 'moderate' },
  { name: '계단 오르기', category: 'cardio', defaultDuration: 20, intensity: 'vigorous' },
];

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  profile,
  onSaveWorkout,
}) => {
  const [exerciseName, setExerciseName] = useState('웨이트 트레이닝(헬스)');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [caloriesBurned, setCaloriesBurned] = useState(300);
  const [notes, setNotes] = useState('');

  // Auto calculate burned calories when exercise, duration, or intensity changes
  useEffect(() => {
    const calculated = calculateExerciseCalories(
      exerciseName,
      durationMinutes,
      intensity,
      profile.weight || 70
    );
    setCaloriesBurned(calculated);
  }, [exerciseName, durationMinutes, intensity, profile.weight]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_WORKOUTS)[0]) => {
    setExerciseName(preset.name);
    setCategory(preset.category);
    setDurationMinutes(preset.defaultDuration);
    setIntensity(preset.intensity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      alert('운동 종목을 입력해주세요.');
      return;
    }

    const newWorkout: WorkoutRecord = {
      id: 'workout-' + Date.now(),
      date: selectedDate,
      exerciseName: exerciseName.trim(),
      category,
      durationMinutes: Number(durationMinutes) || 30,
      intensity,
      caloriesBurned: Number(caloriesBurned) || 100,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveWorkout(newWorkout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">오늘 한 운동 기록</h2>
              <p className="text-xs text-zinc-500">종목과 시간을 입력하면 체중 기반 소모 칼로리를 자동 계산합니다</p>
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
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              자주 하는 추천 운동
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_WORKOUTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border transition ${
                    exerciseName === preset.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Name & Category */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">운동 종목</label>
              <input
                type="text"
                placeholder="예: 러닝, 벤치프레스, 필라테스"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">분류</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="cardio">유산소</option>
                <option value="strength">근력/무산소</option>
                <option value="sports">스포츠</option>
                <option value="flexibility">스트레칭/요가</option>
              </select>
            </div>
          </div>

          {/* Duration Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                운동 시간
              </label>
              <span className="text-sm font-bold text-blue-600">{durationMinutes}분</span>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>10분</span>
              <span>30분</span>
              <span>60분</span>
              <span>90분</span>
              <span>120분+</span>
            </div>
          </div>

          {/* Intensity Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              운동 강도 (체감 난이도)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', title: '가벼움 (Light)', desc: '대화가 편안한 수준' },
                { id: 'moderate', title: '보통 (Moderate)', desc: '땀이 나고 숨이 찬 수준' },
                { id: 'vigorous', title: '격렬함 (Vigorous)', desc: '한계에 도전하는 고강도' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntensity(item.id as ExerciseIntensity)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    intensity === item.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-xs font-bold">{item.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Calorie Burn Display */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 text-white rounded-xl">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold block">
                  예상 소모 칼로리 (체중 {profile.weight}kg 기준)
                </span>
                <span className="text-[11px] text-zinc-500">직접 수정도 가능합니다</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="3000"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="w-24 text-right px-2 py-1 bg-white dark:bg-zinc-800 border rounded-lg font-extrabold text-lg text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 focus:outline-none"
              />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">kcal</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              운동 메모 (세트수, 느낀점 등)
            </label>
            <input
              type="text"
              placeholder="예: 스쿼트 5세트, 벤치프레스 4세트 완료. 컨디션 좋음!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              운동 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

