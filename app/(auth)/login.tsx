import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 [LOGIN] 시도 중...", { email, url: "http://43.203.153.18/alert/api/auth/login" });
      
      await signIn({ email, password });
      
      console.log("✅ [LOGIN] 성공!");
      Alert.alert("로그인 성공", "환영합니다!", [
        { text: "확인", onPress: () => router.replace("/(tabs)") }
      ]);
    } catch (error: any) {
      console.error("❌ [LOGIN] 실패:", error);
      
      // 백엔드 에러 메시지 추출
      const errorDetails = {
        message: error.message || "알 수 없는 오류",
        status: error.response?.status || "N/A",
        statusText: error.response?.statusText || "N/A",
        data: JSON.stringify(error.response?.data || {}, null, 2),
        url: error.config?.url || "N/A",
        code: error.code || "N/A",
      };

      console.log("📋 [LOGIN] 에러 상세:", errorDetails);

      // 사용자에게 자세한 에러 표시
      Alert.alert(
        "로그인 실패",
        `${errorDetails.message}\n\n` +
        `Status: ${errorDetails.status}\n` +
        `URL: ${errorDetails.url}\n\n` +
        `백엔드 응답:\n${errorDetails.data}`,
        [{ text: "확인" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <PrimaryButton title={loading ? "로그인 중..." : "로그인"} onPress={onSubmit} disabled={loading} />

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
