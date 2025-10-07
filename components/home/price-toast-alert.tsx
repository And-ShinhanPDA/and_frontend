import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Kakao from "../../assets/images/companies/logo_13_카카오.svg";
import Samsung from "../../assets/images/companies/logo_1_삼성전자.svg";
import Hynix from "../../assets/images/companies/logo_2_하이닉스.svg";
import Naver from "../../assets/images/companies/logo_7_네이버.svg";
import Mypage from "../../assets/images/mypage.svg";

// 추후 실제 데이터로 교체 필요
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

  // 위로 올라가며 fade-out
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
        <Text style={styles.text}>{current.message}</Text>
      </Animated.View>

      <Pressable
        onPress={() => router.push("/mypage")}
        style={styles.mypageBtn}
        hitSlop={8}
      >
        <Mypage width={26} height={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6F6F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  text: {
    fontSize: 14,
    color: "#444",
    flexShrink: 1,
  },
  mypageBtn: {
    marginLeft: 10,
  },
});
