// import SharedGroupPreferences from "react-native-shared-group-preferences";

export const APP_GROUP_ID = "group.react.native.AND.widget";

/**
 * ✅ 조건 알림 데이터 저장
 * @param data - 조건 알림 리스트
 */
export const saveActivatedConditions = async (data: any) => {
  console.log("🔄 조건 알림 위젯 데이터 저장 (임시 비활성화):", data);
  return;

  // try {
  //   const jsonString = JSON.stringify(data);
  //   await SharedGroupPreferences.setItem(
  //     "activatedConditions",
  //     jsonString,
  //     APP_GROUP_ID
  //   );
  //   console.log("✅ 조건 알림 위젯 데이터 저장 성공:", jsonString);

  //   // 위젯 즉시 갱신
  //   // NativeModules.SharedWidget?.reloadAllTimelines?.();
  // } catch (e) {
  //   console.error("❌ 조건 알림 위젯 데이터 저장 실패:", e);
  // }
};

/**
 * ✅ 기업 알림 데이터 저장
 * @param data - 기업 알림 리스트
 */
export const saveActivatedCompanies = async (data: any) => {
  console.log("🔄 기업 알림 위젯 데이터 저장 (임시 비활성화):", data);
  return;

  // try {
  //   const jsonString = JSON.stringify(data);
  //   await SharedGroupPreferences.setItem(
  //     "activatedCompanies",
  //     jsonString,
  //     APP_GROUP_ID
  //   );
  //   console.log("✅ 기업 알림 위젯 데이터 저장 성공:", jsonString);

  //   // 위젯 즉시 갱신
  //   // NativeModules.SharedWidget?.reloadAllTimelines?.();
  // } catch (e) {
  //   console.error("❌ 기업 알림 위젯 데이터 저장 실패:", e);
  // }
};

/**
 * ✅ 현재 위젯 뷰 타입 저장 (조건 / 기업)
 * @param type - "conditions" | "companies"
 */
export const setWidgetViewType = async (type: "conditions" | "companies") => {
  console.log("🔄 위젯 뷰 타입 저장 (임시 비활성화):", type);
  return;

  // try {
  //   await SharedGroupPreferences.setItem("widgetViewType", type, APP_GROUP_ID);
  //   console.log("✅ 위젯 뷰 타입 저장 성공:", type);

  //   // 위젯 새로고침 → Swift에서 viewType 읽어서 조건/기업 탭 전환
  //   // NativeModules.SharedWidget?.reloadAllTimelines?.();
  // } catch (e) {
  //   console.error("❌ 위젯 뷰 타입 저장 실패:", e);
  // }
};

/**
 * ✅ 위젯 강제 새로고침 (디버깅용)
 */
export const refreshWidgetManually = () => {
  console.log("🔄 위젯 강제 새로고침 (임시 비활성화)");
  return;

  // try {
  //   // NativeModules.SharedWidget?.reloadAllTimelines?.();
  //   console.log("🔄 위젯 강제 새로고침 요청 완료 (주석 처리됨)");
  // } catch (e) {
  //   console.error("❌ 위젯 강제 새로고침 실패:", e);
  // }
};
