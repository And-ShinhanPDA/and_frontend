import { COMPANIES } from "@/constants/companies";
import {
  treemap as d3Treemap,
  treemapSquarify as d3TreemapSquarify,
  hierarchy,
} from "d3-hierarchy";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type CompanyNode = {
  name: string;
  value: number; // treemap 크기 계산용 (0이면 0.5로 보정)
  percent: number;
  actualCount?: number; // 실제 알림 개수 (표시용)
  stockCode: string; // 라우팅용 stockCode
};
type RootNode = { children: CompanyNode[] };

type HeatmapData = {
  stockCode: string;
  alertCount: number;
  priceRate: number; // 실제 API 응답 필드명
};

type TreemapChartProps = {
  data: HeatmapData[];
  loading: boolean;
};

// stockCode로 회사명을 찾는 함수
const getCompanyName = (stockCode: string): string => {
  const company = COMPANIES.find((c) => c.code === stockCode);
  return company?.name || stockCode; // 못 찾으면 stockCode 그대로 표시
};

// ✅ 위 카드와 동일한 깜빡이 점
const BlinkingDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <Animated.View style={[styles.blinkingDot, { opacity }]} />;
};

export default function TreemapChart({ data, loading }: TreemapChartProps) {
  const [cardWidth, setCardWidth] = useState(0);
  const CARD_HEIGHT = 400;
  const router = useRouter();

  // 카드 패딩 20*2 = 40 반영해서 SVG 가로 계산
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setCardWidth(Math.max(0, width - 40));
  };

  // API 데이터를 CompanyNode 형식으로 변환 (안전하게 처리)
  const companies: CompanyNode[] = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const mapped = data
      .filter((item) => item && item.stockCode) // stockCode만 있으면 OK
      .map((item) => {
        // priceRate는 이미 퍼센트 값 (1.07 = 7%, 0.51 = 0.51%)
        // 그대로 사용하면 됨
        const percentChange = item.priceRate;

        // 최소 크기 보장: 모든 상자가 텍스트를 표시할 수 있도록 최소 5로 설정
        const adjustedValue = Math.max(item.alertCount, 5);

        return {
          name: getCompanyName(item.stockCode),
          value: adjustedValue, // 최소값 보장된 값 사용
          percent: percentChange,
          actualCount: item.alertCount, // 실제 알림 개수 (표시용)
          stockCode: item.stockCode, // 라우팅용
        };
      });

    // 실제 알림 개수로 정렬 (내림차순)
    const sorted = mapped.sort((a, b) => b.actualCount - a.actualCount);

    // Top1을 분리하고, 나머지에서 너무 작은 것들 필터링
    const top1 = sorted[0];
    const others = sorted.slice(1);

    // 최소 알림 개수 기준으로 필터링 (1개 이상만 표시)
    const filteredOthers = others.filter((item) => item.actualCount >= 1);

    // Top1 + 필터링된 나머지
    const result = [top1, ...filteredOthers];

    console.log(
      `📊 히트맵: Top1(${top1?.name}: ${top1?.actualCount}개) + 나머지 ${filteredOthers.length}개 표시`
    );

    return result;
  }, [data]);

  const colorBins = [
    { limit: 3, color: "#F63C3C" },
    { limit: 1, color: "#9F373A" },
    { limit: 0.3, color: "#6B3439" },
    { limit: -0.3, color: "#32373C" },
    { limit: -1, color: "#263D53" },
    { limit: -3, color: "#1F4D75" },
    { limit: -Infinity, color: "#018DFF" },
  ];

  const getColor = (percent: number) => {
    for (const bin of colorBins) {
      if (percent >= bin.limit) return bin.color;
    }
    return colorBins[colorBins.length - 1].color;
  };

  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace("#", "");
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq > 160 ? "#111" : "#fff";
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    // 안전하게 처리: text가 없으면 빈 배열 반환
    if (!text || typeof text !== "string") return [""];

    const charWidth = fontSize * 0.65;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    if (text.length <= maxCharsPerLine) return [text];
    const mid = Math.ceil(text.length / 2);
    return [text.slice(0, mid), text.slice(mid)];
  };

  // 상자 클릭 핸들러
  const handleBoxPress = (stockCode: string, companyName: string) => {
    console.log(`📊 [히트맵] ${companyName} (${stockCode}) 클릭`);

    // 기업 알림 목록 화면으로 먼저 이동
    router.replace("/(tabs)/(alert-company)");

    // 약간의 딜레이 후 기업 상세 화면으로 push
    setTimeout(() => {
      router.push({
        pathname: "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
        params: {
          id: stockCode,
          name: companyName,
        },
      });
    }, 100);
  };

  let leaves: any[] = [];
  if (cardWidth > 0 && companies.length > 0) {
    try {
      const root = hierarchy<CompanyNode | RootNode>({
        children: companies,
      }).sum((d) => (d as CompanyNode).value || 0);
      const treemapLayout = d3Treemap<CompanyNode | RootNode>()
        .size([cardWidth, CARD_HEIGHT])
        .paddingInner(3)
        .paddingOuter(2)
        .round(true)
        .tile(d3TreemapSquarify.ratio(1.5)); // 정사각형에 가까운 비율로 조정
      leaves = treemapLayout(root).leaves();
    } catch (error) {
      console.error("히트맵 레이아웃 계산 오류:", error);
    }
  }

  const top3Values =
    companies.length > 0
      ? companies
          .slice(0, 3) // 이미 정렬되어 있으므로 처음 3개만 선택
          .map((c) => c.name)
      : [];

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>최근 일주일 활성화 된 알림 히트맵</Text>
      </View>
      <View style={styles.card} onLayout={handleLayout}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
          </View>
        ) : companies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>히트맵 데이터가 없습니다</Text>
          </View>
        ) : cardWidth > 0 ? (
          <>
            <Svg width={cardWidth} height={CARD_HEIGHT} pointerEvents="none">
              {leaves.map((leaf, i) => {
                const { x0, y0, x1, y1 } = leaf;
                const w = x1 - x0;
                const h = y1 - y0;
                const company = leaf.data as CompanyNode;
                const bg = getColor(company.percent);
                const textColor = getTextColor(bg);
                const isTop3 = top3Values.includes(company.name);

                // 세로로 긴 컨테이너 판별 (높이가 너비의 1.5배 이상)
                const isTallContainer = h > w * 1.5;

                const baseFontSize = Math.max(
                  9,
                  Math.min(
                    w / (isTop3 ? 3.5 : 4.5),
                    h / (isTop3 ? 4.5 : 5.5),
                    isTop3 ? 22 : 18
                  )
                );

                // 세로로 긴 컨테이너는 폰트 크기를 더 작게
                const adjustedBaseFontSize = isTallContainer
                  ? baseFontSize * 0.7
                  : baseFontSize;

                const nameLines = wrapText(
                  company.name,
                  w - 6,
                  adjustedBaseFontSize
                );
                const isMultiLine = nameLines.length > 1;

                const nameFontSize = adjustedBaseFontSize;
                const countFontSize = Math.max(7, adjustedBaseFontSize * 0.8);
                const percentFontSize = Math.max(7, adjustedBaseFontSize * 0.8);

                const nameLineHeight = nameFontSize + 1;
                const spacing = isTop3 ? 4 : 3;

                let totalHeight = 0;
                totalHeight += isMultiLine ? nameLineHeight * 2 : nameFontSize;
                totalHeight += spacing;
                if (isTop3) {
                  totalHeight += countFontSize;
                  totalHeight += spacing;
                }
                totalHeight += percentFontSize;

                let scale = 1;
                if (totalHeight > h - 8) {
                  scale = (h - 8) / totalHeight;
                }

                const finalNameFontSize = nameFontSize * scale;
                const finalCountFontSize = countFontSize * scale;
                const finalPercentFontSize = percentFontSize * scale;
                const finalNameLineHeight = nameLineHeight * scale;
                const finalSpacing = spacing * scale;

                const centerY = y0 + h / 2;
                const scaledTotalHeight = totalHeight * scale;
                let currentY = centerY - scaledTotalHeight / 2;

                // 등락률 텍스트의 너비 체크 및 조정
                const percentText =
                  company.percent > 0
                    ? `+${company.percent.toFixed(2)}%`
                    : `${company.percent.toFixed(2)}%`;
                const estimatedPercentWidth =
                  percentText.length * finalPercentFontSize * 0.6;
                const percentScale =
                  estimatedPercentWidth > w - 8
                    ? (w - 8) / estimatedPercentWidth
                    : 1;
                const adjustedPercentFontSize =
                  finalPercentFontSize * percentScale;

                return (
                  <React.Fragment key={i}>
                    <Rect
                      x={x0}
                      y={y0}
                      width={w}
                      height={h}
                      fill={bg}
                      stroke="#111"
                      strokeWidth={0.4}
                      rx={3}
                    />

                    {/* 회사명 */}
                    {nameLines.map((line: string, idx: number) => {
                      const y =
                        currentY +
                        (idx === 0
                          ? finalNameFontSize / 2
                          : finalNameLineHeight + finalNameFontSize / 2);
                      return (
                        <SvgText
                          key={`name-${idx}`}
                          x={x0 + w / 2}
                          y={y}
                          fontSize={finalNameFontSize}
                          fontWeight="bold"
                          fill={textColor}
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          {line}
                        </SvgText>
                      );
                    })}

                    {(() => {
                      currentY += isMultiLine
                        ? finalNameLineHeight * 2
                        : finalNameFontSize;
                      currentY += finalSpacing * (isTop3 ? 1.5 : 1);
                      return null;
                    })()}

                    {/* 알림 개수 */}
                    {isTop3 &&
                      (() => {
                        // 실제 알림 개수 표시 (actualCount가 있으면 사용, 없으면 value)
                        const displayCount =
                          company.actualCount !== undefined
                            ? company.actualCount
                            : Math.floor(company.value);
                        const countText = `알림 ${displayCount}개`;
                        const result = (
                          <SvgText
                            x={x0 + w / 2}
                            y={currentY + finalCountFontSize / 2}
                            fontSize={finalCountFontSize}
                            fontWeight="600"
                            fill={textColor}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            opacity={0.9}
                          >
                            {countText}
                          </SvgText>
                        );
                        currentY += finalCountFontSize + finalSpacing * 2;
                        return result;
                      })()}

                    {/* 등락률 */}
                    <SvgText
                      x={x0 + w / 2}
                      y={currentY + adjustedPercentFontSize / 2}
                      fontSize={adjustedPercentFontSize}
                      fontWeight="400"
                      fill={textColor}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {percentText}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* 클릭 가능한 투명 레이어 */}
            {leaves.map((leaf, i) => {
              const { x0, y0, x1, y1 } = leaf;
              const w = x1 - x0;
              const h = y1 - y0;
              const company = leaf.data as CompanyNode;

              return (
                <Pressable
                  key={`pressable-${i}`}
                  style={{
                    position: "absolute",
                    left: x0,
                    top: y0,
                    width: w,
                    height: h,
                  }}
                  onPress={() =>
                    handleBoxPress(company.stockCode, company.name)
                  }
                >
                  {/* 투명한 터치 영역 */}
                </Pressable>
              );
            })}
          </>
        ) : null}
      </View>

      {/* 색상 범례 */}
      {!loading && companies.length > 0 && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>가격 변동률 색상 가이드</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#F63C3C" }]}
              />
              <Text style={styles.legendText}>+3% 이상</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#9F373A" }]}
              />
              <Text style={styles.legendText}>+1% ~ +3%</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#6B3439" }]}
              />
              <Text style={styles.legendText}>+0.3% ~ +1%</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#32373C" }]}
              />
              <Text style={styles.legendText}>-0.3% ~ +0.3%</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#263D53" }]}
              />
              <Text style={styles.legendText}>-1% ~ -0.3%</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#1F4D75" }]}
              />
              <Text style={styles.legendText}>-3% ~ -1%</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendBox, { backgroundColor: "#018DFF" }]}
              />
              <Text style={styles.legendText}>-3% 이하</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    paddingBottom: 12,
    elevation: 3,
    marginBottom: 24,
    minHeight: 400,
    position: "relative",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    fontFamily: "Pretendard",
    marginRight: 8,
  },
  blinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  loadingContainer: {
    height: 360,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Pretendard",
  },
  emptyContainer: {
    height: 360,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyIcon: {
    width: 80,
    height: 80,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Pretendard",
    textAlign: "center",
    paddingVertical: 20,
  },
  legendContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
    marginBottom: 12,
    textAlign: "center",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 6,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  legendText: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Pretendard",
    fontWeight: "500",
  },
});
