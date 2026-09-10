import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, saveSession, clearSession } from './session';
import { setSessionExpiredHandler } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        try {
          const me = await authApi.fetchMe();
          setUser(me);
        } catch {
          await clearSession();
        }
      }
      setIsLoading(false);
    })();
  }, []);
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);
  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: async (studentId, password) => {
        const session = await authApi.login(studentId, password);
        await saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        });
        setUser(session.user);
      },
      signup: async (data) => {
        const result = await authApi.signup(data);
        if (!result.pending) {
          await saveSession({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          setUser(result.user);
        }
        return result;
      },
      updateProfile: async (data) => {
        const updated = await authApi.updateProfile(data);
        setUser(updated);
        return updated;
      },
      uploadAvatar: async (formData) => {
        const updated = await authApi.uploadAvatar(formData);
        setUser(updated);
        return updated;
      },
      logout: async () => {
        const session = await getSession();
        await clearSession();
        setUser(null);
        if (session) {
          authApi.logoutRequest(session.refreshToken).catch(() => {});
        }
      },
    }),
    [user, isLoading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
