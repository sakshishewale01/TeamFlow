import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const profileService = {
  async getProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    return data;
  },

  async updateProfile(userId, { fullName, avatarUrl }) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (fullName !== undefined) updates.full_name = fullName.trim();
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  async uploadAvatar(userId, file) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP or GIF image.');
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image size must be less than 2MB.');
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async createProfileIfMissing(userId, userEmail, fullName = '') {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: userEmail,
          full_name: fullName,
          role: 'member',
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Fallback profile creation notice:', error);
    }
    return data;
  },
};
