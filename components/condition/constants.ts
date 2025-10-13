export const PRICE_SECTION_DESCRIPTIONS = {
  LIMIT: "시가 기준으로 얼마 이상/이하일 때 알림을 드릴게요",
  CHANGE_OPEN: "시가 대비 입력한 금액만큼 변동하면 알려드릴게요",
  CHANGE_CURRENT: "현재가 대비 입력한 금액만큼 변동하면 알려드릴게요",
  VARIATION: "지정 기준(1일/현재) 대비 입력한 변동률만큼 변동하면 알려드릴게요",
  TRAILING_PERCENT: "특정 변동률을 기준으로 후행 가격을 알려드릴게요",
  TRAILING_VALUE: "특정 금액을 기준으로 후행 가격을 알려드릴게요",
} as const;

export const WEEK52_SECTION_DESCRIPTIONS = {
  HIGH_ALERT: "최근 52주 최고가를 갱신하면 알림을 드릴게요",
  HIGH_PROXIMITY: "현재가가 최근 52주 최고가에 근접하면 알림을 드릴게요",
  LOW_ALERT: "최근 52주 최저가를 갱신하면 알림을 드릴게요",
  LOW_PROXIMITY: "현재가가 최근 52주 최저가에 근접하면 알림을 드릴게요",
} as const;

export const BASE_SECTION_DESCRIPTIONS = {
  OPEN: "매일 장 시작 시점의 시가를 알려드릴게요.",
  CLOSE: "매일 장 마감 시점의 종가를 알려드릴게요.",
};

export const VOLUME_SECTION_DESCRIPTIONS = {
  PREV_CHANGE:
    "오늘 거래량이 전일 거래량보다 설정하신 백분율 이상 변동했을 때 알림을 드릴게요.",
  AVG_CHANGE:
    "최근 20일의 평균 거래량이 설정하신 백분율 이상 변동했을 때 알림을 드릴게요.",
  SPIKE: "거래량이 전날 종가 거래량보다 20% 높아지면 알려드릴게요.",
  DROP: "거래량이 전날 종가 거래량보다 20% 낮아지면 알려드릴게요.",
} as const;
export const BOLLINGER_SECTION_DESCRIPTIONS = {
  UPPER: "현재가가 상단 볼린저 밴드(20,2)보다 높아질 때 알림을 드릴게요.",
  LOWER: "현재가가 하단 볼린저 밴드(20,2)보다 낮아질 때 알림을 드릴게요.",
} as const;

export const RSI_SECTION_DESCRIPTIONS = {
  TARGET: "설정해주신 범위에 RSI 값이 포함되어 있으면 알림을 드릴게요.",
  OVERBOUGHT: "RSI가 70 이상인 경우 알림을 드릴게요.",
  OVERSOLD: "RSI가 30 미만인 경우 알림을 드릴게요.",
} as const;

export const SMA_SECTION_DESCRIPTIONS = {
  TARGET: "SMA 값이 목표 가격에 도달하면 알림을 드릴게요.",
  SHORTCROSS: "단기 이동평균선이 장기 이동평균선을 돌파할 때 알림을 드릴게요.",
  LONGCROSS: "장기 이동평균선이 단기 이동평균선을 누를 때 알림을 드릴게요.",
} as const;
