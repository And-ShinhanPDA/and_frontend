import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { SignUpFormValues, SignUpPayload } from "@/types/auth";
import { getDeviceId, getFCMToken } from "@/utils/deviceInfo";
import { requestNotificationPermission } from "@/utils/notificationPermission";
import { validateSignUp } from "@/utils/validators";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const values: SignUpFormValues = { name, email, password, confirmPassword };
    const error = validateSignUp(values);

    if (error) {
      Alert.alert("입력 오류", error);
      return;
    }

    try {
      setLoading(true);

      // 1. 알림 권한 요청
      console.log("🔔 [SIGNUP] 알림 권한 요청 시작...");
      const permissionGranted = await requestNotificationPermission();

      let fcmToken = "";
      if (permissionGranted) {
        // 2. 권한 승인 시 FCM 토큰 발급
        const token = await getFCMToken();
        fcmToken = token || "";
        console.log("🔥 [SIGNUP] FCM Token:", fcmToken || "<empty>");
      } else {
        console.log("⚠️ [SIGNUP] 알림 권한 거부됨 - 토큰 없이 진행");
      }

      // 3. 디바이스 ID 가져오기
      const deviceId = await getDeviceId();
      console.log("🆔 [SIGNUP] Device ID:", deviceId);

      const payload: SignUpPayload = {
        name,
        email,
        password,
        fcmToken,
        deviceId,
      };

      await signUp(payload);

      // 토큰 정보 확인 모달
      Alert.alert(
        "회원가입 성공",
        `환영합니다!\n\n📱 디바이스 정보\n\nFCM Token:\n${fcmToken || "(권한 없음)"}\n\nDevice ID:\n${deviceId}`,
        [{ text: "확인", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      console.error("❌ [SIGNUP] 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "회원가입 중 오류가 발생했습니다.";
      Alert.alert("회원가입 실패", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Typography weight="700" size={24} style={styles.title}>
          회원가입
        </Typography>

        <AuthTextInput
          label="이름"
          icon="person"
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
        />

        <AuthTextInput
          label="이메일"
          icon="email"
          value={email}
          onChangeText={setEmail}
          placeholder="이메일을 입력하세요"
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

        <AuthTextInput
          label="비밀번호 확인"
          icon="lock"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="비밀번호를 다시 입력하세요"
          isPassword
        />

        <PrimaryButton
          title={loading ? "회원가입 중..." : "회원가입"}
          onPress={onSubmit}
          disabled={loading}
        />

        <View style={styles.footer}>
          <Typography weight="400" size={14}>
            이미 회원이신가요?
          </Typography>
          <Pressable onPress={() => router.replace("/login")}>
            <Typography weight="400" size={14} style={styles.link}>
              로그인
            </Typography>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
});
