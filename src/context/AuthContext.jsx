import React, { useEffect, useState, useCallback } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { AuthContext } from './authContextDef';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId, userEmail, userMetaName) => {
    if (!userId || !isSupabaseConfigured) {
      setProfile(null);
      return null;
    }

    try {
      let data = await profileService.getProfile(userId);
      if (!data) {
        // Fallback create if database trigger has slight delay or was missing
        data = await profileService.createProfileIfMissing(userId, userEmail, userMetaName);
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('[AuthContext] Failed to load profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await fetchUserProfile(user.id, user.email, user.user_metadata?.full_name);
    }
    return null;
  }, [user, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const initialSession = await authService.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            await fetchUserProfile(
              initialSession.user.id,
              initialSession.user.email,
              initialSession.user.user_metadata?.full_name
            );
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(
          currentUser.id,
          currentUser.email,
          currentUser.user_metadata?.full_name
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Auth Operations
  const signIn = async ({ email, password }) => {
    const data = await authService.signIn({ email, password });
    return data;
  };

  const signUp = async ({ email, password, fullName }) => {
    const data = await authService.signUp({ email, password, fullName });
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    return await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword);
  };

  // Aliases for flexible call patterns (e.g. login(email, password) vs signIn({ email, password }))
  const login = async (emailOrObj, maybePassword) => {
    if (typeof emailOrObj === 'object' && emailOrObj !== null) {
      return await signIn(emailOrObj);
    }
    return await signIn({ email: emailOrObj, password: maybePassword });
  };

  const signup = async (emailOrObj, maybePassword, maybeFullName) => {
    if (typeof emailOrObj === 'object' && emailOrObj !== null) {
      return await signUp(emailOrObj);
    }
    return await signUp({ email: emailOrObj, password: maybePassword, fullName: maybeFullName });
  };

  const logout = signOut;

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(session && user),
    signIn,
    signUp,
    signOut,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from '../hooks/useAuth';
export default AuthProvider;
