import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Warren from "../../assets/images/preset/warren.svg";

const presets = {
  내: [
    {
      id: 1,
      name: "워렌 버핏",
      desc: "사용 지표: 50일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
    {
      id: 2,
      name: "벤저민 그레이엄",
      desc: "사용 지표: 50일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
    {
      id: 3,
      name: "찰리 멍거",
      desc: "사용 지표: 50일 이동평균선 (SMA), 200일 이동평균선 (SMA)",
      image: Warren,
    },
    {
      id: 4,
      name: "피터 린치",
      desc: "사용 지표: 50일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
    {
      id: 5,
      name: "마크 미너비니",
      desc: "사용 지표: 50일 이동평균선 (SMA), 200일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
    {
      id: 6,
      name: "윌리엄 오닐",
      desc: "사용 지표: 20일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
  ],
  유명인: [
    {
      id: 3,
      name: "찰리 멍거",
      desc: "사용 지표: 50일 이동평균선 (SMA), 200일 이동평균선 (SMA)",
      image: Warren,
    },
    {
      id: 4,
      name: "피터 린치",
      desc: "사용 지표: 50일 이동평균선 (SMA), 거래량",
      image: Warren,
    },
  ],
  추천: [
    {
      id: 5,
      name: "추세추종 (골든 크로스)",
      desc: "사용 지표: 50일 이동평균선 (SMA)",
      image: Warren,
    },
    {
      id: 6,
      name: "추세추종 (데드 크로스)",
      desc: "사용 지표: 50일 이동평균선 (SMA)",
      image: Warren,
    },
  ],
};
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 * 2 - 14) / 2;

export default function PresetSelect({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<"내" | "유명인" | "추천">("내");
  const currentList = presets[category];

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(["내", "유명인", "추천"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, category === tab && styles.activeTab]}
            onPress={() => setCategory(tab)}
          >
            <Text
              style={[styles.tabText, category === tab && styles.activeTabText]}
            >
              {tab} 프리셋
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {currentList.map((p) => (
            <TouchableOpacity key={p.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <p.image width={70} height={70} />
              </View>

              <View style={styles.textCenter}>
                <Text style={styles.name}>{p.name}</Text>
              </View>

              <Text style={styles.desc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>닫기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: "80%",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#000" },
  tabText: { fontSize: 13, color: "#555" },
  activeTabText: { color: "#fff" },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    right: 10,
    top: 8,
    opacity: 0.9,
  },
  textCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  desc: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  closeBtn: {
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  closeText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
