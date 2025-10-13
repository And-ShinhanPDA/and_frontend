import ChartScreen from "@/components/chart/chart-view";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ChartDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const companyName = name || "기업명 없음";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.centerHeader}>
          <Text style={styles.company}>{companyName}</Text>
          <Text style={styles.priceText}>355,500원 -0.5%</Text>
        </View>
      ),
      headerLeft: () => (
        <Pressable
          onPress={() => router.replace("/chart")}
          style={{ paddingHorizontal: 16 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111" />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={() => console.log("마이페이지 이동")}>
          <Image
            source={require("@/assets/images/mypage.png")}
            style={{ width: 26, height: 26, marginRight: 10 }}
            resizeMode="contain"
          />
        </Pressable>
      ),
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#fff",
        shadowOpacity: 0,
        elevation: 0,
      },
    });
  }, [companyName]);

  return <ChartScreen companyName={companyName} />;
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
