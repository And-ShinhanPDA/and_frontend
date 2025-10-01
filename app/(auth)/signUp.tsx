import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { SignUpFormValues, SignUpPayload } from "@/types/auth";
import { validateSignUp } from "@/utils/validators";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async () => {
    const values: SignUpFormValues = { name, email, password, confirmPassword };
    const error = validateSignUp(values);

    if (error) {
      Alert.alert("입력 오류", error);
      return;
    }

    const payload: SignUpPayload = { name, email, password };
    await signUp(payload);

    router.replace("/login");
  };

  return (
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

      <PrimaryButton title="회원가입" onPress={onSubmit} />

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
