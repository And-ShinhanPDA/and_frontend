export type User = { id: Number; name: string; email: string };
export type SignInPayload = { email: string; password: string };
export type SignUpPayload = { 
  name: string; 
  email: string; 
  password: string;
  fcmToken: string;
  deviceId: string;
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
