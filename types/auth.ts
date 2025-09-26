export type User = { id: string; name: string; email: string };
export type SignInPayload = { email: string; password: string };
export type SignUpPayload = { name: string; email: string; password: string };
export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
