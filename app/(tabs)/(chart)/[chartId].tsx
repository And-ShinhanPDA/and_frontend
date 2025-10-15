import ChartScreen from "@/components/chart/chart-view";
import CustomHeader from "@/components/header/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChartDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();

  const companyName = name || "기업명 없음";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader
        title={
          <View style={styles.centerHeader}>
            <Text style={styles.company}>{companyName}</Text>
            <Text style={styles.priceText}>355,500원 -0.5%</Text>
          </View>
        }
        centerTitle={true}
        showBackButton={true}
      />
      <ChartScreen companyName={companyName} />
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
