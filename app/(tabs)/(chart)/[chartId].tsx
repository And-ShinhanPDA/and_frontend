import ChartScreen from "@/components/chart/chart-view";
import CustomHeader from "@/components/header/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChartDetail() {
  const { name, stockCode, highlightTime } = useLocalSearchParams<{
    name: string;
    stockCode: string;
    highlightTime?: string;
  }>();
  const router = useRouter();

  console.log("[차트 페이지] ChartDetail 렌더링됨:", { name, stockCode });

  const companyName = name || "기업명 없음";
  const code = stockCode || "005930"; // 기본값으로 삼성전자

  console.log("[차트 페이지] 최종 값:", { companyName, code });

  const [currentPrice, setCurrentPrice] = useState<any>(null);

  const formatPrice = (price?: number) => {
    return price ? `${Math.round(price).toLocaleString()}원` : "-";
  };

  const formatDiff = (diff?: number, diffRate?: number) => {
    if (diff === undefined || diffRate === undefined) return "";
    const sign = diff >= 0 ? "+" : "";
    return ` ${sign}${diffRate.toFixed(2)}%`;
  };

  const getDiffColor = (diff?: number) => {
    if (diff === undefined || diff === null) return "#666";
    return diff >= 0 ? "#4CC439" : "#EF5350";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader
        title={
          <View style={styles.centerHeader}>
            <Text style={styles.company}>{companyName}</Text>
            <Text
              style={[
                styles.priceText,
                { color: getDiffColor(currentPrice?.diff) },
              ]}
            >
              {currentPrice
                ? `${formatPrice(currentPrice.currentPrice)}${formatDiff(
                    currentPrice.diff,
                    currentPrice.diffRate
                  )}`
                : "로딩 중..."}
            </Text>
          </View>
        }
        centerTitle={true}
        showBackButton={true}
      />
      <ChartScreen
        companyName={companyName}
        stockCode={code}
        onPriceUpdate={setCurrentPrice}
        highlightTime={highlightTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  company: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  priceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6DA9FF",
    marginTop: 1,
  },
});
