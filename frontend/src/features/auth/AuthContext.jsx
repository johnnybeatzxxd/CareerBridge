import { createContext, useContext, useMemo, useState } from 'react';
import { jsonRequest } from '../../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('jobsite_token');
    const savedUser = localStorage.getItem('jobsite_user');
    return token && savedUser ? { token, user: JSON.parse(savedUser) } : null;
  });

  function persist(nextSession) {
    localStorage.setItem('jobsite_token', nextSession.token);
    localStorage.setItem('jobsite_user', JSON.stringify(nextSession.user));
    setSession(nextSession);
    return nextSession;
  }

  async function login(credentials) {
    return persist(await jsonRequest('/auth/login', 'POST', credentials));
  }

  async function register(details) {
    return jsonRequest('/auth/register', 'POST', details);
  }

  async function verifyEmail(details) {
    return persist(await jsonRequest('/auth/verify-email', 'POST', details));
  }

  async function resendOtp(email) {
    return jsonRequest('/auth/resend-otp', 'POST', { email });
  }

  async function logout() {
    try {
      await jsonRequest('/auth/logout', 'POST');
    } finally {
      localStorage.removeItem('jobsite_token');
      localStorage.removeItem('jobsite_user');
      setSession(null);
    }
  }

  function updateUser(user) {
    if (!session) return;
    persist({ ...session, user });
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.token || null,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      updateUser,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
