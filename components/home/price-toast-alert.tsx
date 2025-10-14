import { Typography } from "@/components/ui/Typography";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";

const alerts = [
  {
    id: 1,
    name: "삼성전자",
    message: "삼성전자 설정 가격 도달!",
    logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
  },
  {
    id: 2,
    name: "SK하이닉스",
    message: "SK하이닉스 조건 충족!",
    logo: require("@/assets/images/companies/logo_2_하이닉스.png"),
  },
  {
    id: 3,
    name: "NAVER",
    message: "NAVER 조건 달성!",
    logo: require("@/assets/images/companies/logo_7_네이버.png"),
  },
  {
    id: 4,
    name: "KAKAO",
    message: "카카오 조건 달성!",
    logo: require("@/assets/images/companies/logo_13_카카오.png"),
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
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Image
        source={current.logo}
        style={{ width: 24, height: 24, borderRadius: 6 }}
        resizeMode="contain"
      />
      <Typography weight="500" size={15} style={styles.text} numberOfLines={1}>
        {current.message}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 250,
    marginLeft: 10,
  },
  text: {
    color: "#333",
  },
});
