import CompanyHeader from "@/components/ui/alert-companyHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function CompanyAlertDetail() {
  const { name } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>현재 시점 (예시)</Text>
        <Text>현재가: 50,000원</Text>
        <Text>52주 최고가: 55,000원</Text>
        <Text>52주 최저가: 45,000원</Text>
        <Text>RSI(14일): 50</Text>
      </View>

      {/* 조건 설정 영역 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>조건 설정</Text>
        {/* TODO: 가격, 52주, 거래량, SMA, RSI, 볼린저 밴드 UI 추가 */}
      </View>

      <PrimaryButton title="저장" onPress={() => console.log("조건 저장")} />
    </ScrollView>
  );
}

CompanyAlertDetail.options = ({ route }: any) => {
  const { name } = route.params || {};
  return {
    headerTitle: () => <CompanyHeader title={name ?? "알림 상세"} />,
    headerStyle: {
      shadowOpacity: 0,
      elevation: 0,
      borderBottomWidth: 0,
    },
    headerTitleAlign: "left",
    headerTitleContainerStyle: {
      left: 0,
      paddingLeft: 5,
    },
    headerRightContainerStyle: {
      paddingRight: 20,
    },
  };
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
});
