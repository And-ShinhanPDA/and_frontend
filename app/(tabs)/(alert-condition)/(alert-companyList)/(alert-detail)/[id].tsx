import Arrow from "@/assets/images/arrow.svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import PriceConditionSimpleCard from "@/components/add-card/price/price-simple";

import { Typography } from "@/components/ui/Typography";

export default function ConditionAlertDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [isPresetOpen, setIsPresetOpen] = useState(false);

  const tabs = ["제목", "가격", "52주", "거래량", "SMA", "RSI", "볼린저 밴드"];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Arrow width={22} height={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>조건 알림 상세 화면</Text>

        <View style={styles.rightButtons}>
          <Pressable
            onPress={() => console.log("프리셋으로 추가 버튼")}
            style={styles.presetHeaderButton}
          >
            <Image
              source={require("@/assets/images/preset.png")}
              style={{ width: 12, height: 12, marginRight: 3 }}
              resizeMode="contain"
            />
            <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
              프리셋으로 추가
            </Typography>
          </Pressable>

          <TouchableOpacity
            onPress={() =>
              router.push("/(tabs)/condition-alertDetail/modify/[modifyID]")
            }
            style={styles.modifyButton}
          >
            <Image
              source={require("@/assets/images/alert/modify.png")}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab, idx) => (
            <TouchableOpacity key={idx} style={styles.tabItem}>
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBarBorder} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* 제목*/}
        <TextInput
          style={styles.titleInput}
          placeholder="이 조건을 대표할 수 있는 한 줄 제목"
          placeholderTextColor="#A4A4A4"
        />

        <View style={styles.divider} />

        {/* 조건 카드 */}
        <PriceConditionSimpleCard />
        {/* <Week52ConditionCard />
        <VolumeConditionCard />
        <SMAConditionCard />
        <RSIConditionCard />
        <BollingerBandCondition /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  presetHeaderButton: {
    backgroundColor: "rgba(76, 197, 58, 0.15)",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  modifyButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  tabBarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabBarBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  tabItem: {
    marginRight: 20,
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
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
    marginVertical: 10,
  },

  divider: {
    height: 7,
    backgroundColor: "#F5F6F8",
    marginVertical: 10,
    marginHorizontal: -16,
    width: "100%",
    alignSelf: "stretch",
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  scrollContentContainer: {
    paddingBottom: 20,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    elevation: 5,
    paddingBottom: 30,
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
  presetText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
});
