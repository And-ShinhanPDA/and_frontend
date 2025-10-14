// PriceAlertToast.tsx
import { Typography } from "@/components/ui/Typography";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Kakao from "../../assets/images/companies/logo_13_카카오.svg";
import Samsung from "../../assets/images/companies/logo_1_삼성전자.svg";
import Hynix from "../../assets/images/companies/logo_2_하이닉스.svg";
import Naver from "../../assets/images/companies/logo_7_네이버.svg";
import Mypage from "../../assets/images/mypage.svg";

const alerts = [
  {
    id: 1,
    name: "삼성전자",
    message: "삼성전자 설정 가격에 도달했습니다!",
    logo: Samsung,
  },
  {
    id: 2,
    name: "SK하이닉스",
    message: "SK하이닉스 조건이 충족되었습니다!",
    logo: Hynix,
  },
  {
    id: 3,
    name: "NAVER",
    message: "NAVER 설정 조건을 달성했습니다!",
    logo: Naver,
  },
  {
    id: 4,
    name: "KAKAO",
    message: "카카오가 설정 조건을 달성했습니다!",
    logo: Kakao,
  },
];

export default function PriceAlertToast() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % alerts.length);

        translateY.setValue(10);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const current = alerts[index];
  const Logo = current.logo;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.left,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Logo width={22} height={22} />
          <Typography weight="400" size={14} style={styles.text}>
            {current.message}
          </Typography>
        </Animated.View>

        <Pressable onPress={() => console.log("마이페이지 이동")} hitSlop={8}>
          <Mypage width={28} height={28} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  text: {
    color: "#444",
    flex: 1,
  },
});
