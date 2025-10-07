import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Shinhan from "../../assets/images/companies/logo_12_신한금융그룹.svg";
import Samsung from "../../assets/images/companies/logo_1_삼성전자.svg";
import Hynix from "../../assets/images/companies/logo_2_하이닉스.svg";
import Naver from "../../assets/images/companies/logo_7_네이버.svg";
type CompanyAlert = {
  id: number;
  name: string;
  price: string;
  count: number;
  logo: any;
};

// 나중에 실제 데이터로 교체 필요
const sampleCompanies: CompanyAlert[] = [
  {
    id: 1,
    name: "신한 지주",
    price: "70,800",
    count: 1,
    logo: Shinhan,
  },
  {
    id: 2,
    name: "삼성전자",
    price: "86,000",
    count: 1,
    logo: Samsung,
  },
  {
    id: 3,
    name: "NAVER",
    price: "254,000",
    count: 1,
    logo: Naver,
  },
  {
    id: 4,
    name: "SK하이닉스",
    price: "395,500",
    count: 1,
    logo: Hynix,
  },
];

export default function ActivatedCompanyCard({
  data = sampleCompanies,
}: {
  data?: CompanyAlert[];
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>활성화 된 기업 알림</Text>

      {data.map((item) => {
        const Logo = item.logo;
        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.left}>
              <View style={styles.dot} />
              <Logo width={24} height={24} />
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
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CC439",
    marginRight: 8,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  name: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
  },
  price: {
    fontSize: 13,
    color: "#666",
  },
  count: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
