import React, { useEffect, useState, useCallback } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { ROLES } from '../utils/constants';
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
        // If trigger has a slight delay or didn't exist yet, fallback create
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

  const login = async (email, password) => {
    const data = await authService.signIn({ email, password });
    return data;
  };

  const signup = async (email, password, fullName) => {
    const data = await authService.signUp({ email, password, fullName });
    return data;
  };

  const logout = async () => {
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

  // Role utilities
  const role = profile?.role || ROLES.MEMBER;
  const isAdmin = role === ROLES.ADMIN;
  const isManager = role === ROLES.MANAGER || isAdmin;
  const isMember = role === ROLES.MEMBER || isManager;
  const isViewer = role === ROLES.VIEWER;

  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(role);
  };

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    isAuthenticated: Boolean(session && user),
    isAdmin,
    isManager,
    isMember,
    isViewer,
    hasRole,
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

export default AuthProvider;
