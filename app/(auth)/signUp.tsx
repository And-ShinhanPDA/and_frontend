import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { SignUpFormValues, SignUpPayload } from "@/types/auth";
import { validateSignUp } from "@/utils/validators";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const values: SignUpFormValues = { name, email, password, confirmPassword };
    const error = validateSignUp(values);

    if (error) {
      showAlert({
        title: "입력 오류",
        message: error,
        buttons: [{ text: "확인" }],
      });
      return;
    }

    try {
      setLoading(true);
      const payload: SignUpPayload = { name, email, password, fcmToken: "", deviceId: "" };
      await signUp(payload);

      showAlert({
        title: "회원가입 성공",
        message: "환영합니다!",
        buttons: [
          {
            text: "확인",
            onPress: () => router.replace("/login"),
          },
        ],
      });
    } catch (error: any) {
      showAlert({
        title: "회원가입 실패",
        message: error.message || "회원가입 중 오류가 발생했습니다.",
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

          <PrimaryButton title="회원가입" onPress={onSubmit} disabled={loading} />

          <View style={styles.footer}>
            <Typography weight="400" size={14}>
              이미 계정이 있으신가요?
            </Typography>
            <Pressable onPress={() => router.replace("/login")}>
              <Typography weight="400" size={14} style={styles.link}>
                로그인
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
});
