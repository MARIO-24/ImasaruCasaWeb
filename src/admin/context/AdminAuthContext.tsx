import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signInAdmin, signOutAdmin, checkAdminAuthorization } from '../../lib/supabase/client';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  adminEmail: string | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const verifyUserAdminStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setAdminEmail(null);
      return false;
    }

    const { isAuthorized, email } = await checkAdminAuthorization(currentUser.id);
    setIsAdmin(isAuthorized);
    setAdminEmail(email || currentUser.email || null);
    return isAuthorized;
  };

  const refreshAuth = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Check session persistence settings
      const isRememberMe = localStorage.getItem('imasaru_remember_me') === 'true';
      const isSessionActive = sessionStorage.getItem('imasaru_session_active') === 'true';

      // If user did not opt into "Mantener sesión iniciada" and this is a new browser session, clear old storage
      if (!isRememberMe && !isSessionActive) {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAdminEmail(null);
          setLoading(false);
          return;
        }
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        sessionStorage.setItem('imasaru_session_active', 'true');
        await verifyUserAdminStatus(currentSession.user);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
    } catch (err) {
      console.error('Error al comprobar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initial check
    refreshAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      if (newSession?.user) {
        sessionStorage.setItem('imasaru_session_active', 'true');
        await verifyUserAdminStatus(newSession.user);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string, 
    password: string, 
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setLoading(true);

    const { data, error } = await signInAdmin(email, password);

    if (error) {
      setLoading(false);
      const friendlyError = error.message.includes('Invalid login credentials')
        ? 'Correo electrónico o contraseña incorrectos.'
        : error.message;
      setAuthError(friendlyError);
      return { success: false, error: friendlyError };
    }

    if (data.user) {
      if (rememberMe) {
        localStorage.setItem('imasaru_remember_me', 'true');
      } else {
        localStorage.removeItem('imasaru_remember_me');
      }
      sessionStorage.setItem('imasaru_session_active', 'true');

      setUser(data.user);
      setSession(data.session);
      const authorized = await verifyUserAdminStatus(data.user);
      setLoading(false);

      if (!authorized) {
        return {
          success: false,
          error: 'No tienes permisos de administración en Casa Vacacional Imasaru Gestión.'
        };
      }

      return { success: true };
    }

    setLoading(false);
    return { success: false, error: 'No se pudo iniciar sesión.' };
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('imasaru_remember_me');
    sessionStorage.removeItem('imasaru_session_active');
    await signOutAdmin();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminEmail(null);
    setAuthError(null);
    setLoading(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        adminEmail,
        loading,
        authError,
        signIn,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth debe ser usado dentro de un AdminAuthProvider');
  }
  return context;
};

