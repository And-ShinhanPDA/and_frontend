import { saveActivatedCompanies } from "@/services/widgetShare";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type CompanyAlert = {
  id: number;
  name: string;
  price: string;
  count: number;
  logo: ImageSourcePropType;
};

const sampleCompanies: CompanyAlert[] = [
  {
    id: 1,
    name: "신한 지주",
    price: "70,800",
    count: 1,
    logo: require("../../assets/images/companies/logo_12_신한금융그룹.png"),
  },
  {
    id: 2,
    name: "삼성전자",
    price: "86,000",
    count: 1,
    logo: require("../../assets/images/companies/logo_1_삼성전자.png"),
  },
  {
    id: 3,
    name: "NAVER",
    price: "254,000",
    count: 1,
    logo: require("../../assets/images/companies/logo_7_네이버.png"),
  },
  {
    id: 4,
    name: "SK하이닉스",
    price: "395,500",
    count: 1,
    logo: require("../../assets/images/companies/logo_2_하이닉스.png"),
  },
];

// 깜빡이는 점 컴포넌트
const BlinkingDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.blinkingDot, { opacity }]} />;
};

export default function ActivatedCompanyCard({
  data = sampleCompanies,
}: {
  data?: CompanyAlert[];
}) {
  useEffect(() => {
    saveActivatedCompanies(data);
  }, [data]);

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>활성화 된 기업 알림</Text>
        <BlinkingDot />
      </View>

      <View style={styles.card}>
        {data.map((item, index) => {
          const isLast = index === data.length - 1;

          return (
            <View key={item.id} style={[styles.row, isLast && styles.rowLast]}>
              <View style={styles.left}>
                <Image
                  source={item.logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>

              <Text style={styles.count}>{item.count}개</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const LOGO_SIZE = 35;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    paddingBottom: 12,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    fontFamily: "Pretendard",
    marginRight: 8,
  },
  blinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  rowLast: {
    marginBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginRight: 8,
    borderRadius: 9,
  },
  name: {
    fontSize: 14,
    color: "#111",
    fontFamily: "Pretendard",
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Pretendard",
  },
  count: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Pretendard",
  },
});
