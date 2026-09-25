'use client';

import React, { useState } from 'react';
import {
  X,
  Moon,
  Clock,
  Utensils,
  Sparkles,
  AlertTriangle,
  Heart,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
  Coffee,
  Activity,
} from 'lucide-react';
import { LateNightSnackPrediction } from '@/types/lateSnack';

interface LateNightSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FATHER_SNACK_PRESETS = [
  { name: '라면에 찬밥', time: '밤 11:30' },
  { name: '치킨 몇 조각과 맥주 1캔', time: '밤 11:00' },
  { name: '남은 찌개에 밥 비벼먹기', time: '밤 10:30' },
  { name: '단팥빵/카스텔라와 믹스커피', time: '밤 11:00' },
  { name: '달콤한 과일 (사과/포도 1접시)', time: '밤 10:00' },
  { name: '과자 1봉지', time: '자정 12:00' },
  { name: '냉동 군만두 6개', time: '밤 11:30' },
];

const TIME_CHIPS = ['지금 (현재)', '밤 10:00', '밤 11:00', '밤 11:30', '자정 12:00', '새벽 1:00+'];

export const LateNightSnackModal: React.FC<LateNightSnackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTime, setSelectedTime] = useState('밤 11:30');
  const [foodName, setFoodName] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([
    '역류성 식도염 / 속쓰림 우려',
    '혈당 관리 필요',
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<LateNightSnackPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const toggleCondition = (condition: string) => {
    setHealthConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handlePredict = async (snackFood?: string, snackTime?: string) => {
    const targetFood = snackFood || foodName;
    const targetTime = snackTime || selectedTime;

    if (!targetFood.trim()) {
      alert('먹으려는 야식 메뉴를 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/predict-late-snack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: targetTime,
          foodName: targetFood.trim(),
          targetAgeGroup: '50대~60대 중장년층 아버지',
          healthConditions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '야식 건강 예측 분석 실패');
      }

      setPrediction(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyMessage = () => {
    if (!prediction?.filialMessage) return;
    navigator.clipboard.writeText(prediction.filialMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'danger':
        return {
          label: '매우 위험 (심각한 신체 부담)',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300',
        };
      case 'warning':
        return {
          label: '위험 (소화/수면 장애 경고)',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300',
        };
      case 'caution':
        return {
          label: '주의 (속쓰림 및 부종 유의)',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
        };
      default:
        return {
          label: '비교적 안전 (가벼운 소화 가능)',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Moon className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                  아버지를 위한 심야 야식 건강 예측기
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                  효도 케어
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                밤늦게 드시려는 음식과 시간이 아버지 몸에 미치는 결과를 과학적으로 시뮬레이션합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Time & Food Input */}
          <div className="space-y-4">
            {/* Time Picker */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>언제 드시려고 하나요? (섭취 시간대)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TIME_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSelectedTime(chip)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                      selectedTime === chip
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="직접 입력 (예: 밤 11시 45분)"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3.5 py-2 border rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Food to Eat */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                <span>무엇을 드시려고 하나요? (야식 메뉴)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: 라면 1개에 밥 말아먹기, 양념치킨 반 마리, 믹스커피와 단팥빵..."
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePredict();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handlePredict()}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 transition"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>건강 결과 예측하기</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Father Snack Presets */}
              <div className="mt-2.5">
                <span className="text-[11px] text-zinc-400 font-medium block mb-1">
                  💡 아버님들이 자주 찾으시는 단골 야식 예시 (클릭 시 자동 입력 및 분석):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FATHER_SNACK_PRESETS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setFoodName(item.name);
                        setSelectedTime(item.time);
                        handlePredict(item.name, item.time);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-purple-200/70 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition"
                    >
                      + {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Health Conditions Toggle */}
            <div className="pt-1">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                아버지의 주의 질환/상태 (선택 시 더 정밀하게 분석)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '역류성 식도염 / 속쓰림 우려',
                  '혈당 관리 필요',
                  '고혈압 / 나트륨 주의',
                  '불면증 / 얕은 수면',
                  '지방간 / 복부 비만',
                ].map((cond) => {
                  const active = healthConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          {isAnalyzing && (
            <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-2 animate-pulse">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                의학 및 소화생리학 기준으로 야식의 신체 영향을 시뮬레이션하고 있습니다...
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">
                위장 배출 시간, 멜라토닌 분비 방해, 수면 중 위산 역류 위험 및 혈당 스파이크를 계산 중입니다.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 2: Prediction Results */}
          {prediction && !isAnalyzing && (
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in">
              {/* Risk Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      [{prediction.time}] {prediction.foodName} 섭취 시 위험도
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border self-start sm:self-auto ${
                      getRiskBadge(prediction.riskLevel).color
                    }`}
                  >
                    {getRiskBadge(prediction.riskLevel).label}
                  </span>
                </div>

                {/* Risk Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>건강 부담 지수: {prediction.riskScore} / 100</span>
                    <span>추정 열량: 약 {prediction.estimatedCalories} kcal</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        prediction.riskScore >= 75
                          ? 'bg-rose-500'
                          : prediction.riskScore >= 50
                          ? 'bg-orange-500'
                          : prediction.riskScore >= 25
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${prediction.riskScore}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold mt-3 p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200/60 dark:border-zinc-800 leading-relaxed">
                  💡 <span className="text-indigo-600 dark:text-indigo-400 font-bold">의사 소견 요약:</span>{' '}
                  {prediction.summaryVerdict}
                </p>
              </div>

              {/* 2-Column Physical Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Sleep & Digestion */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>오늘 밤 수면 및 위장관 영향</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex justify-between items-center bg-white/70 dark:bg-zinc-800/60 p-2 rounded-lg">
                      <span className="font-medium text-zinc-500">수면의 질 저하율</span>
                      <span className="font-extrabold text-rose-600">
                        -{prediction.immediateImpact.sleepQualityPenalty}% (깊은 잠 방해)
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/70 dark:bg-zinc-800/60 p-2 rounded-lg">
                      <span className="font-medium text-zinc-500">역류성 식도염 위험</span>
                      <span
                        className={`font-extrabold ${
                          prediction.immediateImpact.acidRefluxRisk === 'high'
                            ? 'text-rose-600'
                            : prediction.immediateImpact.acidRefluxRisk === 'moderate'
                            ? 'text-orange-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {prediction.immediateImpact.acidRefluxRisk === 'high'
                          ? '매우 높음 (위산 역류 주의)'
                          : prediction.immediateImpact.acidRefluxRisk === 'moderate'
                          ? '보통 (2시간 후 취침 필요)'
                          : '낮음'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {prediction.immediateImpact.morningFatigue}
                    </p>
                  </div>
                </div>

                {/* 2. Blood Sugar & Cardiovascular */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>혈당 스파이크 & 성인병 위험</span>
                  </div>
                  <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="p-2.5 bg-white/70 dark:bg-zinc-800/60 rounded-lg">
                      <span className="font-bold text-purple-700 dark:text-purple-400 block mb-0.5">
                        야간 인슐린 저항성
                      </span>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {prediction.metabolicImpact.bloodSugarSpike}
                      </p>
                    </div>
                    <div className="p-2.5 bg-white/70 dark:bg-zinc-800/60 rounded-lg">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
                        복부 내장지방 전환율
                      </span>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {prediction.metabolicImpact.visceralFatRisk}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe Alternatives Prescription */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2.5">
                  <Coffee className="w-4 h-4 text-emerald-600" />
                  <span>🍵 아버지를 위한 속 편한 대체 간식 처방 (배고픔 달래기)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {prediction.safeAlternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/90 dark:bg-zinc-800/80 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{alt.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{alt.portion}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affectionate Filial KakaoTalk Message */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>아버지께 보낼 다정한 효도 메시지 (잔소리 NO, 애정 YES)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료! 카톡에 붙여넣기</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>카톡 메시지 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-white/95 dark:bg-zinc-800/90 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  &ldquo;{prediction.filialMessage}&rdquo;
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                  💡 자식이 건강을 진심으로 걱정하는 말투로 구성되어 있어, 아버지가 거부감 없이 야식을 멈추실 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
