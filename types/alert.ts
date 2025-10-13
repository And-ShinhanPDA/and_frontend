export interface AlertCondition {
  indicator: string;
  threshold: number | null;
  threshold2: number | null;
}

export interface CreateAlertPayload {
  stockCode: string | null;
  title: string;
  isActive: boolean;
  isPreset: boolean;
  conditions: AlertCondition[];
}
