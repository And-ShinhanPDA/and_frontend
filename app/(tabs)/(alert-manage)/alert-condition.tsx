import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";

type AlertCondition = {
  id: string;
  name: string;
  enabled: boolean;
};

export default function AlertCondition() {
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80); // 삭제버튼 실제 폭 측정용 상태값

  const [companies, setCompanies] = useState<AlertCondition[]>([
    { id: "1", name: "SMA랑 거래량 조건", enabled: false },
    { id: "2", name: "가격 설정 조건", enabled: false },
    { id: "3", name: "SMA 조건", enabled: false },
    { id: "4", name: "볼린저 밴드 조건", enabled: false },
  ]);

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    companies.forEach((company) => {
      anims[company.id] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, []);

  // 토글 스위치
  const toggleSwitch = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // 삭제 기능
  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  // 왼쪽 스와이프 시 fade out
  const handleRowOpen = (rowKey: string) => {
    const fadeAnim = fadeAnimations[rowKey];
    if (!fadeAnim) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 다시 닫을 시 fade in
  const handleRowClose = (rowKey: string) => {
    const fadeAnim = fadeAnimations[rowKey];
    if (!fadeAnim) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Image
          source={require("@/assets/images/alert/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="조건을 검색해보세요"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <SwipeListView
        data={companies.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onRowOpen={handleRowOpen}
        onRowClose={handleRowClose}
        rightOpenValue={-deleteWidth}
        renderItem={({ item, index }) => {
          const fadeAnim = fadeAnimations[item.id] || new Animated.Value(1);
          const filtered = companies.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          );
          const isLast = index === filtered.length - 1;

          return (
            <View
              style={[
                styles.itemRow,
                isLast && { borderBottomWidth: 1, borderColor: "#F5F6F8" },
              ]}
            >
              <View style={styles.itemText}>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                }}
              >
                <Switch
                  trackColor={{ false: "#ccc", true: "#4CC439" }}
                  thumbColor="#fff"
                  ios_backgroundColor="#E9E9EA"
                  onValueChange={() => toggleSwitch(item.id)}
                  value={item.enabled}
                />
              </Animated.View>
            </View>
          );
        }}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onLayout={(e) => setDeleteWidth(e.nativeEvent.layout.width)}
              onPress={() => deleteCompany(item.id)}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/(alert-manage)/alert-condition")}
      >
        <Image
          source={require("@/assets/images/alert/condition_alert.png")}
          style={styles.plusIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 40,
    margin: 22,
  },
  searchBar: { flex: 1, marginLeft: 6 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#F5F6F8",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
  },
  itemText: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Pretendard" },
  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
    fontFamily: "Pretendard",
  },
  hiddenContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    width: 80,
    height: "100%",
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "Pretendard",
  },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CC439B3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  plusIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  searchIcon: {
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginBottom: 2,
  },
});
