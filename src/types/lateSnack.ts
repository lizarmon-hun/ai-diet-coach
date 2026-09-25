export type RiskLevel = 'safe' | 'caution' | 'warning' | 'danger';

export interface LateNightSnackInput {
  time: string; // e.g. "밤 11:30" or "23:30"
  foodName: string; // e.g. "라면 1개에 밥 말아먹기"
  targetAgeGroup?: string; // e.g. "50~60대 중장년층 아버지"
  healthConditions?: string[]; // e.g. ["역류성 식도염 주의", "혈당 관리 필요", "고혈압 주의"]
}

export interface SafeAlternative {
  name: string;
  portion: string;
  reason: string;
}

export interface LateNightSnackPrediction {
  foodName: string;
  time: string;
  estimatedCalories: number;
  riskLevel: RiskLevel;
  riskScore: number; // 0 (안전) ~ 100 (극도로 위험)
  summaryVerdict: string; // 핵심 결론 요약
  immediateImpact: {
    sleepQualityPenalty: number; // 수면 질 저하율 (예: 40%)
    acidRefluxRisk: 'low' | 'moderate' | 'high'; // 역류성 식도염 위험도
    morningFatigue: string; // 내일 아침 예상 피로도 및 부종 설명
  };
  metabolicImpact: {
    bloodSugarSpike: string; // 혈당 스파이크 및 인슐린 부담 설명
    visceralFatRisk: string; // 내장지방 및 혈관/심혈관계 부담 설명
  };
  safeAlternatives: SafeAlternative[]; // 부담 없는 대체 야식 3가지
  filialMessage: string; // 아버지께 기분 상하지 않게 보낼 수 있는 다정한 카톡 설득 문구
}
