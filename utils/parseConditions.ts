/**
 * 조건에서 사용된 지표 카테고리를 추출하여 배열로 반환하는 함수
 */
export const getIndicatorCategoriesArray = (conditions: any[]): string[] => {
  const categories = new Set<string>();

  conditions.forEach((cond) => {
    const indicator = cond.indicator;

    if (
      indicator.startsWith("PRICE_ABOVE") ||
      indicator.startsWith("PRICE_BELOW") ||
      indicator.startsWith("PRICE_CHANGE")
    ) {
      categories.add("가격");
    } else if (
      indicator.includes("52W") ||
      indicator.startsWith("HIGH_52W") ||
      indicator.startsWith("LOW_52W") ||
      indicator.startsWith("NEAR_")
    ) {
      categories.add("52주");
    } else if (indicator.startsWith("VOLUME_")) {
      categories.add("거래량");
    } else if (
      indicator.startsWith("SMA_") ||
      indicator === "GOLDEN_CROSS" ||
      indicator === "DEAD_CROSS"
    ) {
      categories.add("SMA");
    } else if (indicator.startsWith("RSI_")) {
      categories.add("RSI");
    } else if (indicator.startsWith("BOLLINGER_")) {
      categories.add("볼린저 밴드");
    } else if (indicator.startsWith("PRICE_RATE_")) {
      categories.add("변동률");
    } else if (indicator.startsWith("TRAILING_")) {
      categories.add("후행");
    }
  });

  return Array.from(categories);
};

/**
 * 조건에서 사용된 지표 카테고리를 추출하여 설명 문자열로 반환하는 함수
 */
export const extractIndicatorCategories = (conditions: any[]): string => {
  const categories = getIndicatorCategoriesArray(conditions);

  return categories.length > 0
    ? `사용 지표: ${categories.join(", ")}`
    : `조건 ${conditions.length}개`;
};

/**
 * 알림 조건 데이터를 각 카드 컴포넌트가 이해할 수 있는 형태로 파싱하는 함수
 */
export const parseConditionsForCards = (conditions: any[]) => {
  const parsed: any = {
    price: null,
    change: null,
    trailing: null,
    week52: null,
    volume: null,
    sma: null,
    rsi: null,
    bollinger: null,
  };

  // Price 조건 파싱
  const priceLimits: any[] = [];
  const openChanges: any[] = [];
  const currentChanges: any[] = [];

  // Change 조건 파싱
  const dailyChanges: any[] = [];
  const baseChanges: any[] = [];

  // Trailing 조건 파싱
  let trailingData: any = {
    stopPrice: "",
    stopPercent: "",
    buyPrice: "",
    buyPercent: "",
  };

  // Week52 조건 파싱
  let week52Data: any = {
    highAlert: false,
    lowAlert: false,
    highProximity: null,
    lowProximity: null,
  };

  // Volume 조건 파싱
  let volumeData: any = {
    avgRise: "",
    avgDrop: "",
    spike: false,
    drop: false,
  };

  // SMA 조건 파싱
  let smaData: any = { target: null, shortCross: false, longCross: false };

  // RSI 조건 파싱
  let rsiData: any = { overbought: false, oversold: false };

  // Bollinger 조건 파싱
  let bollingerData: any = { upper: false, lower: false };

  conditions.forEach((cond) => {
    const { indicator, threshold, threshold2 } = cond;

    // 가격 조건
    if (indicator === "PRICE_ABOVE") {
      priceLimits.push({ comparison: "이상", amount: threshold });
    } else if (indicator === "PRICE_BELOW") {
      priceLimits.push({ comparison: "이하", amount: threshold });
    } else if (indicator === "PRICE_CHANGE_DAILY_UP") {
      openChanges.push({ direction: "+", amount: threshold });
    } else if (indicator === "PRICE_CHANGE_DAILY_DOWN") {
      openChanges.push({ direction: "-", amount: threshold });
    } else if (indicator === "PRICE_CHANGE_BASE_UP") {
      currentChanges.push({ direction: "+", amount: threshold });
    } else if (indicator === "PRICE_CHANGE_BASE_DOWN") {
      currentChanges.push({ direction: "-", amount: threshold });
    }
    // 변동률 조건
    else if (indicator === "PRICE_RATE_DAILY_UP") {
      dailyChanges.push({ direction: "+", amount: threshold });
    } else if (indicator === "PRICE_RATE_DAILY_DOWN") {
      dailyChanges.push({ direction: "-", amount: threshold });
    } else if (indicator === "PRICE_RATE_BASE_UP") {
      baseChanges.push({ direction: "+", amount: threshold });
    } else if (indicator === "PRICE_RATE_BASE_DOWN") {
      baseChanges.push({ direction: "-", amount: threshold });
    }
    // 후행 조건
    else if (indicator === "TRAILING_STOP_PRICE") {
      trailingData.stopPrice = String(threshold || "");
    } else if (indicator === "TRAILING_STOP_PERCENT") {
      trailingData.stopPercent = String(threshold || "");
    } else if (indicator === "TRAILING_BUY_PRICE") {
      trailingData.buyPrice = String(threshold || "");
    } else if (indicator === "TRAILING_BUY_PERCENT") {
      trailingData.buyPercent = String(threshold || "");
    }
    // 52주 조건
    else if (indicator === "HIGH_52W") {
      week52Data.highAlert = true;
    } else if (indicator === "LOW_52W") {
      week52Data.lowAlert = true;
    } else if (indicator === "NEAR_HIGH_52W") {
      week52Data.highProximity = { value: threshold };
    } else if (indicator === "NEAR_LOW_52W") {
      week52Data.lowProximity = { value: threshold };
    }
    // 거래량 조건
    else if (indicator === "VOLUME_AVG_DEV_UP") {
      volumeData.avgRise = String(threshold || "");
    } else if (indicator === "VOLUME_AVG_DEV_DOWN") {
      volumeData.avgDrop = String(threshold || "");
    } else if (indicator === "VOLUME_CHANGE_PERCENT_UP") {
      volumeData.spike = true;
    } else if (indicator === "VOLUME_CHANGE_PERCENT_DOWN") {
      volumeData.drop = true;
    }
    // SMA 조건
    else if (indicator === "GOLDEN_CROSS") {
      smaData.shortCross = true;
    } else if (indicator === "DEAD_CROSS") {
      smaData.longCross = true;
    } else if (indicator.startsWith("SMA_")) {
      smaData.target = { indicator, threshold };
    }
    // RSI 조건
    else if (indicator === "RSI_OVER") {
      rsiData.overbought = true;
    } else if (indicator === "RSI_UNDER") {
      rsiData.oversold = true;
    }
    // 볼린저밴드 조건
    else if (indicator === "BOLLINGER_UPPER_TOUCH") {
      bollingerData.upper = true;
    } else if (indicator === "BOLLINGER_LOWER_TOUCH") {
      bollingerData.lower = true;
    }
  });

  // 가격 조건 설정
  if (
    priceLimits.length > 0 ||
    openChanges.length > 0 ||
    currentChanges.length > 0
  ) {
    parsed.price = {
      limits: priceLimits,
      openChanges: openChanges,
      currentChanges: currentChanges,
    };
  }

  // 변동률 조건 설정
  if (dailyChanges.length > 0 || baseChanges.length > 0) {
    parsed.change = {
      dailyChanges: dailyChanges,
      baseChanges: baseChanges,
    };
  }

  // 후행 조건 설정
  if (
    trailingData.stopPrice ||
    trailingData.stopPercent ||
    trailingData.buyPrice ||
    trailingData.buyPercent
  ) {
    parsed.trailing = trailingData;
  }

  // 52주 조건 설정
  if (
    week52Data.highAlert ||
    week52Data.lowAlert ||
    week52Data.highProximity ||
    week52Data.lowProximity
  ) {
    parsed.week52 = week52Data;
  }

  // 거래량 조건 설정
  if (
    volumeData.avgRise ||
    volumeData.avgDrop ||
    volumeData.spike ||
    volumeData.drop
  ) {
    parsed.volume = volumeData;
  }

  // SMA 조건 설정
  if (smaData.target || smaData.shortCross || smaData.longCross) {
    parsed.sma = smaData;
  }

  // RSI 조건 설정
  if (rsiData.overbought || rsiData.oversold) {
    parsed.rsi = rsiData;
  }

  // 볼린저밴드 조건 설정
  if (bollingerData.upper || bollingerData.lower) {
    parsed.bollinger = bollingerData;
  }

  return parsed;
};
