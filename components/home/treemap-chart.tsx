import { treemap as d3Treemap, hierarchy } from "d3-hierarchy";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type CompanyNode = {
  name: string;
  value: number;
  percent: number;
};
type RootNode = { children: CompanyNode[] };

export default function TreemapChart() {
  const [cardWidth, setCardWidth] = useState(0);
  const CARD_HEIGHT = 400;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setCardWidth(width - 25);
  };

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
    const charWidth = fontSize * 0.65;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);

    if (text.length <= maxCharsPerLine) {
      return [text];
    }

    const mid = Math.ceil(text.length / 2);
    return [text.slice(0, mid), text.slice(mid)];
  };

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

  const top3Values = [...companies]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((c) => c.name);

  return (
    <View style={styles.card} onLayout={handleLayout}>
      <Text style={styles.cardTitle}>한 눈에 보기</Text>

      {cardWidth > 0 && (
        <Svg width={cardWidth} height={CARD_HEIGHT} pointerEvents="none">
          {leaves.map((leaf, i) => {
            const { x0, y0, x1, y1 } = leaf;
            const w = x1 - x0;
            const h = y1 - y0;
            const company = leaf.data as CompanyNode;
            const bg = getColor(company.percent);
            const textColor = getTextColor(bg);

            const isTop3 = top3Values.includes(company.name);

            // 👇 상위 3개는 더 큰 폰트 크기
            const baseFontSize = Math.max(
              9,
              Math.min(
                w / (isTop3 ? 4 : 4.5), // 상위 3개: w/4, 나머지: w/4.5
                h / (isTop3 ? 5 : 5.5), // 상위 3개: h/5, 나머지: h/5.5
                isTop3 ? 20 : 18 // 상위 3개 최대: 20, 나머지: 18
              )
            );

            const nameLines = wrapText(company.name, w - 6, baseFontSize);
            const isMultiLine = nameLines.length > 1;

            const nameFontSize = baseFontSize;
            const countFontSize = Math.max(7, baseFontSize * 0.8);
            const percentFontSize = Math.max(7, baseFontSize * 0.85);

            const nameLineHeight = nameFontSize + 1;
            const spacing = isTop3 ? 4 : 3; // 👈 상위 3개는 간격도 더 넓게

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
                {nameLines.map((line, idx) => {
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
                  currentY += finalSpacing * (isTop3 ? 1.5 : 1); // 👈 상위 3개는 간격 1.5배
                  return null;
                })()}

                {/* 알림 개수 */}
                {isTop3 &&
                  (() => {
                    const countText = `알림 ${company.value}개`;
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
                  y={currentY + finalPercentFontSize / 2}
                  fontSize={finalPercentFontSize}
                  fontWeight="400"
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
    // shadowColor: "#000",
    // shadowOpacity: 0.08,
    // shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
});
