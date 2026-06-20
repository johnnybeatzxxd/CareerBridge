import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  jsonRequest,
  restoreSession,
  SESSION_CLEARED_EVENT,
  SESSION_UPDATED_EVENT,
  storeSession,
} from '../../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('jobsite_token');
    const savedUser = localStorage.getItem('jobsite_user');
    return token && savedUser ? { token, user: JSON.parse(savedUser) } : null;
  });
  const [ready, setReady] = useState(Boolean(session));

  function persist(nextSession) {
    storeSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }

  useEffect(() => {
    function sessionUpdated(event) {
      setSession(event.detail);
      setReady(true);
    }
    function sessionCleared() {
      setSession(null);
      setReady(true);
    }
    window.addEventListener(SESSION_UPDATED_EVENT, sessionUpdated);
    window.addEventListener(SESSION_CLEARED_EVENT, sessionCleared);

    if (!session) {
      restoreSession()
        .then((restored) => {
          if (!restored) setReady(true);
        });
    }
    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, sessionUpdated);
      window.removeEventListener(SESSION_CLEARED_EVENT, sessionCleared);
    };
  }, []);

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
      clearSession();
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
      ready,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      updateUser,
    }),
    [ready, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
