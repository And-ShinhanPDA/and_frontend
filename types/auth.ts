export type User = { id: number; name: string; email: string };

// 로그인: 이메일, 패스워드, FCM 토큰, 디바이스 ID
export type SignInPayload = {
  email: string;
  password: string;
  fcmToken: string;
  deviceId: string;
};

// 회원가입: 이메일, 이름, 패스워드만
export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};
export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse<T> {
  code: string;
  message: string;
  data: T;
}
