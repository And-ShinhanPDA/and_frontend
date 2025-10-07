import ActivatedCompanyCard from "@/components/home/active-company";
import ActivatedConditionCard from "@/components/home/active-condition";
import PriceAlertToast from "@/components/home/price-toast-alert";
import TreemapChart from "@/components/home/treemap-chart";
import { ScrollView, StyleSheet } from "react-native";
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <PriceAlertToast />
      <ActivatedConditionCard />
      <ActivatedCompanyCard />
      <TreemapChart />
    </ScrollView>
  );
}

export const options = {
  title: "홈 화면",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
});
