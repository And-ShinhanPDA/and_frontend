import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { getDeviceId } from "@/utils/deviceInfo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  const { showAlert, AlertComponent } = useCustomAlert();

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

      // 디바이스 ID 가져오기
      const deviceId = await getDeviceId();

      console.log("🆔 [Login] deviceId:", deviceId);

      await signIn({ email, password, deviceId });
      router.replace("/(tabs)");
    } catch (error: any) {
      showAlert({
        title: "로그인 실패",
        message: error.message || "로그인에 실패했습니다.",
        buttons: [{ text: "확인" }],
      });
    } finally {
      setLoading(false);
    }
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

          <PrimaryButton title="로그인" onPress={onSubmit} disabled={loading} />

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
});
