import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  async signUp({ email, password, fullName }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPasswordForEmail(email) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
    }

    const redirectUrl = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
