import { SignUpFormValues } from "@/types/auth";

export function validateSignUp({
  name,
  email,
  password,
  confirmPassword,
}: SignUpFormValues): string | null {
  if (!name) return "이름을 입력해주세요.";
  if (!email) return "이메일을 입력해주세요.";
  if (!password) return "비밀번호를 입력해주세요.";
  if (password !== confirmPassword) return "비밀번호가 일치하지 않습니다.";
  return null;
}
