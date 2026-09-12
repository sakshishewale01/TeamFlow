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

  extractPathFromUrl(avatarUrl) {
    if (!avatarUrl || typeof avatarUrl !== 'string') return null;
    const match = avatarUrl.match(/\/avatars\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  },

  async deleteAvatarFile(avatarUrl) {
    if (!isSupabaseConfigured || !avatarUrl) return;
    const filePath = this.extractPathFromUrl(avatarUrl);
    if (!filePath) return;

    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
      if (error) {
        console.warn('[profileService] Failed to remove avatar file from storage:', error);
      }
    } catch (err) {
      console.warn('[profileService] deleteAvatarFile caught error:', err);
    }
  },

  async updateProfileName(userId, fullName) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }
    const cleanName = (fullName || '').trim();
    if (!cleanName) {
      throw new Error('Full name cannot be empty.');
    }
    return await this.updateProfile(userId, { fullName: cleanName });
  },

  async uploadAvatar(userId, file, previousAvatarUrl = null) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!file || !validTypes.includes(file.type)) {
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
      throw new Error(uploadError.message || 'Failed to upload avatar to storage.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profiles table with new avatar_url
    await this.updateProfile(userId, { avatarUrl: publicUrl });

    // Safely remove previous avatar from storage if it exists
    if (previousAvatarUrl && previousAvatarUrl !== publicUrl) {
      await this.deleteAvatarFile(previousAvatarUrl);
    }

    return publicUrl;
  },

  async removeAvatar(userId, currentAvatarUrl = null) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }

    // 1. Clean up file in storage if URL is available
    if (currentAvatarUrl) {
      await this.deleteAvatarFile(currentAvatarUrl);
    }

    // 2. Clear avatar_url column in database
    const updated = await this.updateProfile(userId, { avatarUrl: null });
    return updated;
  },

  async createProfileIfMissing(userId, userEmail, fullName = '') {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: fullName,
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
