'use client';

import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Flame, Clock, Zap, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { WorkoutRecord, ExerciseCategory, ExerciseIntensity, UserProfile } from '@/types/diet';
import { calculateExerciseCalories } from '@/lib/calculator';

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

const AI_SUGGESTIONS = [
  '주짓수 스파링 40분',
  '클라이밍(볼더링) 1시간',
  '볼링 3게임',
  '배드민턴 단식 45분',
  '동네 뒷산 등산 2시간',
  '홈트 버피 100개와 플랭크',
  '스쿼시 30분',
  '방 대청소 및 걸레질 1시간',
];

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  profile,
  onSaveWorkout,
}) => {
  // Free text AI input
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [analyzedMet, setAnalyzedMet] = useState<number | null>(null);

  // Form values
  const [exerciseName, setExerciseName] = useState('웨이트 트레이닝(헬스)');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [durationMinutes, setDurationMinutes] = useState<string | number>(45);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [caloriesBurned, setCaloriesBurned] = useState<string | number>(300);
  const [aiComment, setAiComment] = useState('');
  const [notes, setNotes] = useState('');

  // Flag to check if current calories were set by AI
  const [isAiCalculated, setIsAiCalculated] = useState(false);

  // Auto calculate burned calories if user changes preset/slider manually (and wasn't just set by AI)
  useEffect(() => {
    if (isAiCalculated) return;
    const numDuration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 30;
    const calculated = calculateExerciseCalories(
      exerciseName,
      numDuration,
      intensity,
      profile.weight || 70
    );
    setCaloriesBurned(calculated);
  }, [exerciseName, durationMinutes, intensity, profile.weight, isAiCalculated]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_WORKOUTS)[0]) => {
    setIsAiCalculated(false);
    setIsAnalyzed(false);
    setAiComment('');
    setAnalyzedMet(null);
    setExerciseName(preset.name);
    setCategory(preset.category);
    setDurationMinutes(preset.defaultDuration);
    setIntensity(preset.intensity);
  };

  const handleAIAnalyze = async (textToAnalyze?: string) => {
    const targetText = textToAnalyze || aiInput;
    if (!targetText.trim()) {
      alert('분석할 운동 내용을 입력해주세요. (예: 볼링 3게임, 주짓수 40분)');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsAnalyzed(false);

    try {
      const res = await fetch('/api/analyze-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: targetText.trim(),
          weightKg: profile.weight || 70,
          currentDuration: Number(durationMinutes) || 30,
          currentIntensity: intensity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '운동 분석에 실패했습니다.');
      }

      setExerciseName(data.exerciseName || targetText.trim());
      setCategory(data.category || 'cardio');
      setDurationMinutes(data.durationMinutes || 30);
      setIntensity(data.intensity || 'moderate');
      setCaloriesBurned(data.caloriesBurned || 200);
      setAiComment(data.aiComment || '');
      setAnalyzedMet(data.estimatedMet || null);
      setIsAiCalculated(true);
      setIsAnalyzed(true);
    } catch (err: unknown) {
      console.error(err);
      setAnalysisError(
        err instanceof Error ? err.message : 'AI 운동 분석 중 문제가 발생했습니다.'
      );
    } finally {
      setIsAnalyzing(false);
    }
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
      durationMinutes: Math.max(1, Number(durationMinutes) || 30),
      intensity,
      caloriesBurned: Math.max(0, Number(caloriesBurned) || 0),
      notes: notes.trim() || undefined,
      aiComment: aiComment.trim() || undefined,
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
              <p className="text-xs text-zinc-500">어떤 운동이든 Gemini AI가 과학적 소모 칼로리를 산출합니다</p>
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
          {/* AI Free-Form Workout Analyzer Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-800/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AI 자유 운동 분석 (모든 운동 가능)</span>
              </label>
              <span className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium">
                체중 {profile.weight}kg 맞춤 산출
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="예: 주짓수 스파링 40분, 볼링 3게임, 등산 2시간..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIAnalyze();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAIAnalyze()}
                disabled={isAnalyzing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 shrink-0 transition"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 측정</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="mt-2.5">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">
                💡 추천 입력 예시 (클릭하면 바로 측정):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AI_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setAiInput(sug);
                      handleAIAnalyze(sug);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-blue-200/70 dark:border-blue-800/80 bg-white/80 dark:bg-zinc-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Status / Notification */}
          {isAnalyzing && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Gemini AI가 운동 생리학 공식으로 칼로리를 계산하고 있습니다...
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  MET(대사당량) 데이터베이스와 체중({profile.weight}kg)을 결합합니다.
                </p>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{analysisError}</span>
            </div>
          )}

          {isAnalyzed && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  AI 분석 완료! ({analyzedMet ? `${analyzedMet} MET 기준` : '과학적 추정'} 약 {caloriesBurned} kcal 소모)
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                AI 산출
              </span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              기본 운동 템플릿
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_WORKOUTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border transition ${
                    exerciseName === preset.name && !isAnalyzed
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
                onChange={(e) => {
                  setExerciseName(e.target.value);
                  setIsAiCalculated(false);
                }}
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
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="30"
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(e.target.value);
                    setIsAiCalculated(false);
                  }}
                  className="w-16 text-right px-2 py-0.5 border rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-blue-600 focus:outline-none"
                />
                <span className="text-xs text-zinc-500 font-semibold">분</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={Number(durationMinutes) || 30}
              onChange={(e) => {
                setDurationMinutes(Number(e.target.value));
                setIsAiCalculated(false);
              }}
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
                  onClick={() => {
                    setIntensity(item.id as ExerciseIntensity);
                    setIsAiCalculated(false);
                  }}
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
                <span className="text-[11px] text-zinc-500">
                  {isAiCalculated ? '✨ Gemini AI 정밀 산출치' : '직접 수정도 가능합니다'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="0"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                className="w-24 text-right px-2 py-1 bg-white dark:bg-zinc-800 border rounded-lg font-extrabold text-lg text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 focus:outline-none"
              />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">kcal</span>
            </div>
          </div>

          {/* AI Coach Comment Preview */}
          {aiComment && (
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-800/60 text-xs">
              <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI 트레이너 코멘트
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiComment}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              운동 메모 (세트수, 느낀점 등)
            </label>
            <input
              type="text"
              placeholder="예: 스파링 후 땀 많이 흘림, 컨디션 최고!"
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
