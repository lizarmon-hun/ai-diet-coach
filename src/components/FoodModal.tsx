'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Loader2, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';
import { MealRecord, MealType } from '@/types/diet';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSaveMeal: (meal: MealRecord) => void;
}

// Quick presets with SVG data URIs so users can test immediately even without personal food photos
const SAMPLE_PRESETS = [
  {
    name: '닭가슴살 샐러드',
    sampleImage:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e8f5e9"/><circle cx="200" cy="150" r="110" fill="%23c8e6c9"/><rect x="130" y="100" width="140" height="50" rx="10" fill="%23ffe0b2"/><circle cx="160" cy="180" r="20" fill="%23ef5350"/><circle cx="230" cy="170" r="25" fill="%2366bb6a"/><text x="200" y="240" font-family="sans-serif" font-size="18" font-weight="bold" fill="%232e7d32" text-anchor="middle">닭가슴살 신선 샐러드</text></svg>',
    defaultData: {
      foodName: '닭가슴살 그린 샐러드 & 오리엔탈 드레싱',
      calories: 380,
      carbs: 22,
      protein: 38,
      fat: 12,
      fiber: 6,
      aiComment: '고단백 저지방의 완벽한 다이어트 식단입니다. 식이섬유가 풍부하여 포만감이 오래 지속됩니다.',
    },
  },
  {
    name: '연어 스테이크 & 현미밥',
    sampleImage:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fff3e0"/><circle cx="200" cy="150" r="110" fill="%23ffe0b2"/><rect x="140" y="110" width="120" height="60" rx="12" fill="%23ff7043"/><ellipse cx="200" cy="190" rx="40" ry="25" fill="%23d7ccc8"/><text x="200" y="240" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23d84315" text-anchor="middle">연어 스테이크 정식</text></svg>',
    defaultData: {
      foodName: '연어 스테이크와 아스파라거스, 현미밥',
      calories: 560,
      carbs: 45,
      protein: 42,
      fat: 22,
      fiber: 5,
      aiComment: '오메가-3 불포화지방산과 양질의 단백질, 복합 탄수화물이 조화로운 클린 식단입니다.',
    },
  },
  {
    name: '소고기 안심 덮밥',
    sampleImage:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23efebe9"/><circle cx="200" cy="150" r="110" fill="%23d7ccc8"/><rect x="140" y="110" width="120" height="55" rx="8" fill="%238d6e63"/><circle cx="200" cy="140" r="15" fill="%23fbc02d"/><text x="200" y="240" font-family="sans-serif" font-size="18" font-weight="bold" fill="%234e342e" text-anchor="middle">소고기 안심 덮밥</text></svg>',
    defaultData: {
      foodName: '소고기 안심 스테이크 덮밥',
      calories: 620,
      carbs: 68,
      protein: 44,
      fat: 18,
      fiber: 4,
      aiComment: '근력 운동 후 근합성에 매우 적합합니다. 밥의 양을 2/3 공기로 조절하면 다이어트 효율이 더 높아집니다.',
    },
  },
];

export const FoodModal: React.FC<FoodModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSaveMeal,
}) => {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<string | number>(450);
  const [carbs, setCarbs] = useState<string | number>(50);
  const [protein, setProtein] = useState<string | number>(30);
  const [fat, setFat] = useState<string | number>(14);
  const [fiber, setFiber] = useState<string | number>(4);
  const [aiComment, setAiComment] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setIsAnalyzed(false);
      setAnalysisError(null);
      // Auto analyze when file selected
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setImagePreview(preset.sampleImage);
    setFoodName(preset.defaultData.foodName);
    setCalories(preset.defaultData.calories);
    setCarbs(preset.defaultData.carbs);
    setProtein(preset.defaultData.protein);
    setFat(preset.defaultData.fat);
    setFiber(preset.defaultData.fiber);
    setAiComment(preset.defaultData.aiComment);
    setIsAnalyzed(true);
    setAnalysisError(null);
  };

  const analyzeImage = async (base64Image: string, mimeType?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, mimeType: mimeType || 'image/jpeg' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '음식 분석 실패');
      }

      setFoodName(data.foodName || '식별된 음식');
      setCalories(data.calories || 400);
      setCarbs(data.carbs || 45);
      setProtein(data.protein || 25);
      setFat(data.fat || 12);
      setFiber(data.fiber || 3);
      setAiComment(data.aiComment || 'AI 영양 분석이 완료되었습니다.');
      setIsAnalyzed(true);
    } catch (err: unknown) {
      console.warn('AI analysis error:', err);
      setAnalysisError(
        err instanceof Error ? err.message : 'AI 분석 중 문제가 발생했습니다. 수동으로 영양 정보를 입력하실 수 있습니다.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      alert('음식 이름을 입력해주세요.');
      return;
    }

    const newMeal: MealRecord = {
      id: 'meal-' + Date.now(),
      date: selectedDate,
      mealType,
      foodName: foodName.trim(),
      photoUrl: imagePreview || undefined,
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      aiComment: aiComment.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveMeal(newMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">오늘 먹은 음식 사진 등록</h2>
              <p className="text-xs text-zinc-500">Gemini Vision AI가 칼로리와 영양 성분을 자동 판독합니다</p>
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
          {/* Meal Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">식사 구분</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'breakfast', label: '아침' },
                { id: 'lunch', label: '점심' },
                { id: 'dinner', label: '저녁' },
                { id: 'snack', label: '간식/음료' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMealType(item.id as MealType)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    mealType === item.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              음식 사진 업로드 (스마트폰 사진 / 갤러리)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 group">
                <img
                  src={imagePreview}
                  alt="음식 미리보기"
                  className="w-full h-48 object-cover transition duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 justify-between">
                  <span className="text-xs text-white/90 font-medium">사진 등록됨</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white/90 hover:bg-white text-zinc-800 text-xs font-semibold rounded-lg shadow transition"
                    >
                      다른 사진
                    </button>
                    <button
                      type="button"
                      onClick={() => analyzeImage(imagePreview)}
                      disabled={isAnalyzing}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      재분석
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  클릭하여 음식 사진을 선택하거나 드래그하세요
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  JPG, PNG, HEIC 등 지원 (AI가 자동으로 메뉴와 칼로리를 추출합니다)
                </p>
              </div>
            )}

            {/* Quick Demo Presets */}
            <div className="mt-2.5">
              <span className="text-[11px] text-zinc-400 font-medium block mb-1">
                ⚡ 빠른 테스트용 샘플 식단:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Status / Spinner */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              <div>
                <p className="text-xs font-bold text-orange-900 dark:text-orange-200">
                  Gemini Vision AI가 영양 성분을 분석 중입니다...
                </p>
                <p className="text-[11px] text-orange-700 dark:text-orange-400">
                  음식의 종류, 분량, 탄단지 및 칼로리를 계산하고 있습니다.
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
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">AI 영양 분석 완료! 아래 영양 수치를 확인 및 수정할 수 있습니다.</span>
            </div>
          )}

          {/* Food Name & Calories */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">음식 이름</label>
              <input
                type="text"
                placeholder="예: 닭가슴살 샐러드와 고구마"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">칼로리</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-orange-600 dark:text-orange-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400">kcal</span>
              </div>
            </div>
          </div>

          {/* Macronutrients: Carbs, Protein, Fat, Fiber */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              탄단지 영양소 상세 (g)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">탄수화물</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400">g</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block mb-0.5">단백질</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400">g</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">지방</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400">g</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">식이섬유</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Comment */}
          {aiComment && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-400 font-medium block mb-0.5">💡 AI 영양 코멘트</span>
              <p className="text-zinc-700 dark:text-zinc-300">{aiComment}</p>
            </div>
          )}

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
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md shadow-orange-600/20 transition"
            >
              식단 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

