import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthTextInput } from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    await signIn({ email, password });
    router.replace("/(tabs)");
  };

  return (
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

      <PrimaryButton title="로그인" onPress={onSubmit} />

      <View style={styles.footer}>
        <Typography weight="400" size={14}>
          아직 회원이 아니신가요?
        </Typography>
        <Pressable onPress={() => router.replace("/signUp")}>
          <Typography weight="400" size={14} style={styles.link}>
            회원가입2
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
