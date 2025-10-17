import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import ActivatedCompanyCard from "@/components/home/active-company";
import ActivatedConditionCard from "@/components/home/active-condition";
import PriceAlertToast from "@/components/home/price-toast-alert";
import TreemapChart from "@/components/home/treemap-chart";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const { signOut, user } = useAuth();
  const router = useRouter();

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("로그아웃 성공");
      // 로그인 화면으로 이동
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CustomHeader
        leftContent="custom"
        showBackButton={false}
        customLeft={<PriceAlertToast />}
        rightButtons="mypage"
        onPresetPress={() => setIsPresetOpen(true)}
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ActivatedConditionCard />
        <ActivatedCompanyCard />
        <TreemapChart />
      </ScrollView>

      <ConditionBottomSheet
        visible={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        ratio={0.8}
      >
        <PresetSelect onClose={() => setIsPresetOpen(false)} />
      </ConditionBottomSheet>

      <CustomBottomTab activeTab="홈" />
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
});
