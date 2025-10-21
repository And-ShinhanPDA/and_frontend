import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import ActivatedCompanyCard from "@/components/home/active-company";
import ActivatedConditionCard from "@/components/home/active-condition";
import PriceAlertToast from "@/components/home/price-toast-alert";
import TreemapChart from "@/components/home/treemap-chart";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { refreshWidgetManually } from "@/services/widgetShare";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type HeatmapData = {
  stockCode: string;
  alertCount: number;
  priceRate: number;
};

export default function HomeScreen() {
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const { signOut, user, accessToken } = useAuth();
  const router = useRouter();

  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  // 자식 컴포넌트의 새로고침 함수 참조
  const conditionRefreshRef = useRef<(() => void) | undefined>(undefined);
  const companyRefreshRef = useRef<(() => void) | undefined>(undefined);

  const fetchHeatmapData = async () => {
    if (!accessToken) {
      console.log("accessToken 없음 - 히트맵 로드 불가");
      setHeatmapLoading(false);
      return;
    }

    try {
      setHeatmapLoading(true);

      const results = await alertService.getAlertHeatmap(accessToken);
      setHeatmapData(results);

      console.log(`홈 화면 - 히트맵 데이터 ${results.length}개 로드 완료`);
    } catch (err: any) {
      console.error("홈 화면 - 히트맵 데이터 조회 실패:", err);
    } finally {
      setHeatmapLoading(false);
    }
  };

  // 활성화된 조건/기업 알림 데이터 새로고침 및 위젯 업데이트
  const fetchTriggeredConditions = useCallback(async () => {
    if (!accessToken) return;

    try {
      console.log("🔄 [홈] 활성화된 알림 데이터 새로고침 시작...");

      // 히트맵 데이터도 함께 새로고침
      await fetchHeatmapData();

      // 위젯 강제 새로고침 (자식 컴포넌트들이 useFocusEffect로 자동 새로고침됨)
      refreshWidgetManually();

      console.log("✅ [홈] 모든 데이터 + 위젯 새로고침 완료");
    } catch (err) {
      console.error("❌ [홈] 데이터 새로고침 실패:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchHeatmapData();
  }, [accessToken]);

  // 화면이 포커스될 때마다 데이터 새로고침 (위젯 즉시 업데이트)
  useFocusEffect(
    useCallback(() => {
      fetchTriggeredConditions();
    }, [fetchTriggeredConditions])
  );

  // 로그아웃 핸들러
  const handleLogout = async () => {
    console.log("=== 로그아웃 시작 ===");
    console.log("user 전체:", user);
    console.log("user.name:", user?.name);
    console.log("userName prop:", user?.name || "사용자");
    try {
      await signOut();
      console.log("로그아웃 성공");
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
        <TreemapChart data={heatmapData} loading={heatmapLoading} />
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
