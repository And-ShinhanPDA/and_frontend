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
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { alertService } from "@/services/alert-service";

// API 응답 타입
type TriggeredCondition = {
  conditionName: string;
  activeCompanyCount: number;
};

export default function HomeScreen() {
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const { signOut, user, accessToken } = useAuth();
  const router = useRouter();

  // 활성화된 조건 알림 상태 관리
  const [triggeredConditions, setTriggeredConditions] = useState<
    TriggeredCondition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 활성화된 조건 알림 조회 함수
  const fetchTriggeredConditions = async () => {
    if (!accessToken) {
      console.log("accessToken 없음");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const results = await alertService.getTriggeredConditionAlerts(
        accessToken
      );
      setTriggeredConditions(results);

      console.log(`홈 화면 - 활성화된 조건 알림 ${results.length}개 로드 완료`);
    } catch (err: any) {
      console.error("홈 화면 - 활성화된 조건 알림 조회 실패:", err);
      setError(
        err.response?.data?.message ||
          "활성화된 조건 알림을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTriggeredConditions();
  }, [accessToken]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    console.log("=== 로그아웃 시작 ===");
    console.log("user 전체:", user);
    console.log("user.name:", user?.name);
    console.log("userName prop:", user?.name || "사용자");
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
        <ActivatedConditionCard
          triggeredConditions={triggeredConditions}
          loading={loading}
        />
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
