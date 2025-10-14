import CustomHeader from "@/components/header/header";
import ActivatedCompanyCard from "@/components/home/active-company";
import ActivatedConditionCard from "@/components/home/active-condition";
import PriceAlertToast from "@/components/home/price-toast-alert";
import TreemapChart from "@/components/home/treemap-chart";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.wrapper}>
      <CustomHeader
        leftContent="custom"
        showBackButton={false}
        customLeft={<PriceAlertToast />}
        rightButtons="preset-and-mypage"
        onPresetPress={() => console.log("프리셋 열기")}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <ActivatedConditionCard />
        <ActivatedCompanyCard />
        <TreemapChart />
      </ScrollView>
    </View>
  );
}

export const options = {
  title: "홈 화면",
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
});
