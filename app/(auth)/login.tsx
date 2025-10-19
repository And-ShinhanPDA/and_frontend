import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { getDeviceId, getFCMToken } from "@/utils/deviceInfo";
import { requestNotificationPermission } from "@/utils/notificationPermission";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Keyboard,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenData, setTokenData] = useState({ fcmToken: "", deviceId: "" });
  const { showAlert, AlertComponent } = useCustomAlert();

  // 로그인 상태가 변경되면 자동으로 메인 화면으로 이동
  useEffect(() => {
    if (isLoggedIn && !loading) {
      console.log("✅ [LOGIN] 로그인 상태 확인 - 메인 화면으로 이동");
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, loading]);

  const onSubmit = async () => {
    if (!email || !password) {
      showAlert({
        title: "입력 오류",
        message: "이메일과 비밀번호를 입력해주세요.",
        buttons: [{ text: "확인" }],
      });
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 [LOGIN] 시도 중...", { email });

      // 1. 로그인 먼저 수행
      await signIn({ email, password });
      console.log("✅ [LOGIN] 성공!");

      // 2. 상태 업데이트 완료를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. 로그인 성공 후 알림 권한 요청
      console.log("🔔 [Notification] 권한 요청 시작...");
      const permissionGranted = await requestNotificationPermission();

      let fcmToken = "";
      let deviceId = "";

      if (permissionGranted) {
        // 4. FCM 토큰 발급 및 서버 전송
        const token = await getFCMToken();
        deviceId = await getDeviceId();
        fcmToken = token || "";

        console.log("🔥 [FCM] Token:", fcmToken || "<empty>");
        console.log("🆔 [Device] ID:", deviceId || "<empty>");

        if (token) {
          // TODO: 서버에 FCM 토큰 전송하는 API 호출
          // await sendFCMTokenToServer(token, deviceId);
          console.log("✅ [FCM] 토큰 서버 전송 준비 완료");
        }

        setTokenData({ fcmToken, deviceId });
      }
      
      console.log("🔥 [LOGIN] FCM Token & Device ID 저장 완료");
      console.log("📱 [LOGIN] useEffect가 자동으로 화면 전환을 처리합니다...");
    } catch (error: any) {
      console.error("❌ [LOGIN] 실패:", error);

      const errorDetails = {
        message: error.message || "알 수 없는 오류",
        status: error.response?.status || "N/A",
        statusText: error.response?.statusText || "N/A",
        data: JSON.stringify(error.response?.data || {}, null, 2),
        url: error.config?.url || "N/A",
        code: error.code || "N/A",
      };

      console.log("📋 [LOGIN] 에러 상세:", errorDetails);

      showAlert({
        title: "로그인 실패",
        message:
          `${errorDetails.message}\n\n` +
          `Status: ${errorDetails.status}\n` +
          `URL: ${errorDetails.url}\n\n` +
          `백엔드 응답:\n${errorDetails.data}`,
        buttons: [{ text: "확인" }],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    // Clipboard.setString(text);
    showAlert({
      title: "복사 완료",
      message: `${label}가 클립보드에 복사되었습니다.`,
      buttons: [{ text: "확인" }],
    });
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Typography weight="700" size={24} style={styles.title}>
            로그인
          </Typography>

          <AuthTextInput
            label="아이디"
            icon="email"
            value={email}
            onChangeText={setEmail}
            placeholder="아이디를 입력하세요"
          />

          <AuthTextInput
            label="비밀번호"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="비밀번호를 입력하세요"
            isPassword
          />

          <PrimaryButton
            title={loading ? "로그인 중..." : "로그인"}
            onPress={onSubmit}
            disabled={loading}
          />

          <View style={styles.footer}>
            <Typography weight="400" size={14}>
              아직 회원이 아니신가요?
            </Typography>
            <Pressable onPress={() => router.replace("/signUp")}>
              <Typography weight="400" size={14} style={styles.link}>
                회원가입
              </Typography>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* 커스텀 Alert */}
      <AlertComponent />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 30, gap: 20 },
  title: { marginBottom: 10 },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  link: { color: "#5ECA4D", marginLeft: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  modalContent: {
    maxHeight: 400,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  tokenSection: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: "#333",
  },
  tokenBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tokenText: {
    color: "#666",
    lineHeight: 18,
  },
  hint: {
    marginTop: 4,
    color: "#4CC439",
    textAlign: "center",
  },
});
