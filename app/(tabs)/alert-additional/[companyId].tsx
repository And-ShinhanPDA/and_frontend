import BollingerBandCondition from "@/components/add-card/bollingerband/bollingerband-condition";
import CurrentStatusCard from "@/components/add-card/current-status";
import PriceConditionCard from "@/components/add-card/price/price-condition";
import RSIConditionCard from "@/components/add-card/rsi/rsi-condition";
import SMAConditionCard from "@/components/add-card/sma/sma-condition";
import VolumeConditionCard from "@/components/add-card/volume/volume-condition";
import Week52ConditionCard from "@/components/add-card/week52/week52-condition";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Arrow from "../../../assets/images/arrow.svg";
export default function CompanyAlertDetail() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const tabs = [
    "제목",
    "가격",
    "후행",
    "52주",
    "거래량",
    "SMA",
    "RSI",
    "볼린저밴드",
  ];

  const [expanded, setExpanded] = useState(false);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconWrapper}
        >
          <Arrow width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.title}>{name}</Text>
      </View>
      <ScrollView
        style={styles.tabBar}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab, idx) => (
          <TouchableOpacity key={idx} style={styles.tabItem}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <CurrentStatusCard
        time="11:38 기준"
        currentPrice={50000}
        openPrice={50000}
        high52w={55000}
        low52w={45000}
        volume={50}
        bollingerUpper={50000}
        bollingerLower={50000}
        rsi={50}
        movingAverage={50}
      />
      <View style={styles.divider} />
      <TextInput
        style={styles.titleInput}
        placeholder="이 조건을 대표할 수 있는 한 줄 제목"
        placeholderTextColor="#A4A4A4"
      />
      <View style={styles.divider} />
      <PriceConditionCard />
      <Week52ConditionCard />
      <VolumeConditionCard />
      <SMAConditionCard />
      <RSIConditionCard />
      <BollingerBandCondition />
      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => setIsPresetOpen(true)}
        >
          <Text style={styles.presetText}>프리셋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => console.log("조건 저장")}
        >
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ConditionBottomSheet
        visible={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        ratio={0.8}
      >
        <PresetSelect onClose={() => setIsPresetOpen(false)} />
      </ConditionBottomSheet>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 55,
    justifyContent: "center",
    marginBottom: 22,
  },
  iconWrapper: {
    position: "absolute",
    left: 2,
  },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },

  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tabItem: {
    marginRight: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 7,
    backgroundColor: "#F5F6F8",
    marginVertical: 11,
    marginHorizontal: -16,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fff",
    marginTop: 11,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 40,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#F7F7F7",
  },
  presetText: { fontSize: 15, color: "#333", fontWeight: "500" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "flex-end",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  saveText: { fontSize: 15, color: "#fff", fontWeight: "600" },
  icon: { width: 16, height: 16 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
});
