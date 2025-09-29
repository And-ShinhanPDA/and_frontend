import { authService } from "@/services/auth-service";
import { SignInPayload, SignUpPayload, User } from "@/types/auth";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "auth_token";

export function useAuthLogic() {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // DEV-MODE
        const IS_DEV = true;

        if (IS_DEV) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setToken(null);
          setUser(null);
          return;
        }

        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          const me = await authService.me(saved);
          if (me) {
            setToken(saved);
            setUser(me);
          } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          }
        }
      } catch (e) {
        console.warn("Auth restore error", e);
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInPayload) => {
    const { token: newToken, user: me } = await authService.signIn(
      email,
      password
    );
    setToken(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setUser(me);
  }, []);

  const signUp = useCallback(
    async ({ name, email, password }: SignUpPayload) => {
      const { token: newToken, user: me } = await authService.signUp({
        name,
        email,
        password,
      });
      setToken(newToken);
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setUser(me);
    },
    []
  );

  const signOut = useCallback(async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  return useMemo(
    () => ({
      isReady,
      isLoggedIn: Boolean(token && user),
      token,
      user,
      signIn,
      signUp,
      signOut,
    }),
    [isReady, token, user, signIn, signUp, signOut]
  );
}
