import { treemap as d3Treemap, hierarchy } from "d3-hierarchy";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type CompanyNode = {
  name: string;
  value: number; // 알림 갯수
  percent: number; // 주식 등락률
};
type RootNode = { children: CompanyNode[] };

export default function TreemapChart() {
  const [cardWidth, setCardWidth] = useState(0);
  const CARD_HEIGHT = 400;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setCardWidth(width - 25);
  };

  // 나중에 실제 값으로 대체
  const companies: CompanyNode[] = [
    { name: "삼성전자", value: 25, percent: 3.4 },
    { name: "SK하이닉스", value: 20, percent: 5.59 },
    { name: "NAVER", value: 12, percent: -4.5 },
    { name: "카카오", value: 10, percent: -3.5 },
    { name: "현대차", value: 8, percent: 0.23 },
    { name: "기아", value: 7, percent: -0.44 },
    { name: "LG에너지솔루션", value: 6, percent: -1.97 },
    { name: "POSCO홀딩스", value: 5, percent: 0.8 },
    { name: "삼성바이오로직스", value: 5, percent: -0.5 },
    { name: "KB금융", value: 4, percent: -0.67 },
    { name: "신한지주", value: 4, percent: -0.42 },
    { name: "하나금융지주", value: 3, percent: -0.3 },
    { name: "카카오뱅크", value: 3, percent: 1.2 },
    { name: "HD현대", value: 3, percent: 0.9 },
    { name: "HMM", value: 2, percent: 1.1 },
    { name: "한화솔루션", value: 2, percent: 5.38 },
    { name: "LG화학", value: 2, percent: -2.1 },
    { name: "대한항공", value: 1, percent: 0.0 },
    { name: "아모레퍼시픽", value: 1, percent: -1.8 },
    { name: "CJ제일제당", value: 1, percent: 0.3 },
  ];

  // 7단계 색상 (진한빨강 → 진한파랑)
  const colorBins = [
    { limit: 3, color: "#F63C3C" }, // 진한 빨강
    { limit: 1, color: "#9F373A" }, // 중간 빨강
    { limit: 0.3, color: "#6B3439" }, // 어두운 빨강
    { limit: -0.3, color: "#32373C" }, // 회색
    { limit: -1, color: "#263D53" }, // 어두운 파랑
    { limit: -3, color: "#1F4D75" }, // 중간 파랑
    { limit: -Infinity, color: "#018DFF" }, // 진한 파랑
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

  // treemap 계산로직
  let leaves: any[] = [];
  if (cardWidth > 0) {
    const root = hierarchy<CompanyNode | RootNode>({ children: companies }).sum(
      (d) => (d as CompanyNode).value
    );
    const treemapLayout = d3Treemap<CompanyNode | RootNode>()
      .size([cardWidth, CARD_HEIGHT])
      .paddingInner(2)
      .round(true);
    leaves = treemapLayout(root).leaves();
  }

  return (
    <View style={styles.card} onLayout={handleLayout}>
      <Text style={styles.cardTitle}>한 눈에 보기</Text>

      {cardWidth > 0 && (
        <Svg width={cardWidth} height={CARD_HEIGHT}>
          {leaves.map((leaf, i) => {
            const { x0, y0, x1, y1 } = leaf;
            const w = x1 - x0;
            const h = y1 - y0;
            const company = leaf.data as CompanyNode;
            const bg = getColor(company.percent);
            const textColor = getTextColor(bg);

            const fontSize = Math.max(6, Math.min(w / 6, 12));
            const percentSize = Math.max(5, fontSize - 2);

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
                <SvgText
                  x={x0 + w / 2}
                  y={y0 + h / 2 - 4}
                  fontSize={fontSize}
                  fontWeight="bold"
                  fill={textColor}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {company.name}
                </SvgText>
                <SvgText
                  x={x0 + w / 2}
                  y={y0 + h / 2 + 10}
                  fontSize={percentSize}
                  fill={textColor}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {company.percent > 0
                    ? `+${company.percent.toFixed(2)}%`
                    : `${company.percent.toFixed(2)}%`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
});
