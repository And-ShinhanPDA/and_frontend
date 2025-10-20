import { NativeModules } from "react-native";
import SharedGroupPreferences from "react-native-shared-group-preferences";

export const APP_GROUP_ID = "group.react.native.AND.widget";

const { WidgetReloader } = NativeModules;

/**
 * ✅ 조건 알림 데이터 저장
 * @param data - 조건 알림 리스트
 */
export const saveActivatedConditions = async (data: any) => {
  try {
    const jsonString = JSON.stringify(data);
    console.log("🔄 [Widget] 조건 알림 데이터 저장 시작...");
    console.log("📦 [Widget] 저장할 데이터:", jsonString);

    await SharedGroupPreferences.setItem(
      "activatedConditions",
      jsonString,
      APP_GROUP_ID
    );

    console.log("✅ [Widget] 조건 알림 데이터 저장 완료!");
    console.log(`📊 [Widget] 저장된 조건 수: ${data.length}개`);

    // 위젯 즉시 갱신
    if (WidgetReloader) {
      WidgetReloader.reloadAllWidgets();
      console.log("🔄 [Widget] 위젯 새로고침 요청 완료");
    }
  } catch (e) {
    console.error("❌ [Widget] 조건 알림 데이터 저장 실패:", e);
  }
};

/**
 * ✅ 기업 알림 데이터 저장
 * @param data - 기업 알림 리스트
 */
export const saveActivatedCompanies = async (data: any) => {
  try {
    const jsonString = JSON.stringify(data);
    console.log("🔄 [Widget] 기업 알림 데이터 저장 시작...");
    console.log("📦 [Widget] 저장할 데이터:", jsonString);

    await SharedGroupPreferences.setItem(
      "activatedCompanies",
      jsonString,
      APP_GROUP_ID
    );

    console.log("✅ [Widget] 기업 알림 데이터 저장 완료!");
    console.log(`📊 [Widget] 저장된 기업 수: ${data.length}개`);

    // 위젯 즉시 갱신
    if (WidgetReloader) {
      WidgetReloader.reloadAllWidgets();
      console.log("🔄 [Widget] 위젯 새로고침 요청 완료");
    }
  } catch (e) {
    console.error("❌ [Widget] 기업 알림 데이터 저장 실패:", e);
  }
};

/**
 * ✅ 현재 위젯 뷰 타입 저장 (조건 / 기업)
 * @param type - "conditions" | "companies"
 */
export const setWidgetViewType = async (type: "conditions" | "companies") => {
  try {
    await SharedGroupPreferences.setItem("widgetViewType", type, APP_GROUP_ID);
    console.log("✅ [Widget] 뷰 타입 저장 성공:", type);

    // 위젯 새로고침
    if (WidgetReloader) {
      WidgetReloader.reloadAllWidgets();
      console.log("🔄 [Widget] 위젯 새로고침 요청 완료");
    }
  } catch (e) {
    console.error("❌ [Widget] 뷰 타입 저장 실패:", e);
  }
};

/**
 * ✅ 위젯 강제 새로고침 (디버깅용)
 */
export const refreshWidgetManually = () => {
  try {
    if (WidgetReloader) {
      WidgetReloader.reloadAllWidgets();
      console.log("🔄 [Widget] 위젯 강제 새로고침 요청 완료");
    } else {
      console.warn("⚠️ [Widget] WidgetReloader 모듈을 찾을 수 없습니다");
    }
  } catch (e) {
    console.error("❌ [Widget] 위젯 강제 새로고침 실패:", e);
  }
};
