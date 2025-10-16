// components/modals/LogoutAlert.tsx  (기존 LogoutModal 대체)
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

interface LogoutAlertProps {
  visible: boolean;
  userName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutAlert({
  visible,
  userName = "사용자",
  onConfirm,
  onCancel,
}: LogoutAlertProps) {
  const wasVisible = useRef(false);

  useEffect(() => {
    // visible 이 false -> true 로 바뀌는 순간에만 Alert 표시
    if (!wasVisible.current && visible) {
      wasVisible.current = true;

      Alert.alert(
        `${userName} 님`,
        `\n로그아웃 하시겠습니까?`,
        [
          { text: "아니오", style: "cancel", onPress: onCancel },
          { text: "예", onPress: onConfirm },
        ],
        {
          // 안드로이드에서 바깥 터치/Back 키로 닫힘 허용
          cancelable: true,
          // onDismiss: 버튼을 누르지 않고 닫혔을 때 콜백
          onDismiss: onCancel,
        }
      );
    }

    // Alert가 뜬 후 부모가 visible=false로 내려주면 다음 표시를 위해 리셋
    if (wasVisible.current && !visible) {
      wasVisible.current = false;
    }
  }, [visible, userName, onCancel, onConfirm]);

  // UI 렌더링 필요 없음 (Alert는 네이티브)
  return null;
}
