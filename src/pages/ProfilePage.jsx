import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Shield,
  Upload,
  Save,
  Info,
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import { profileService } from '../services/profileService';
import { validateFullName } from '../utils/validators';

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { role, roleMeta } = useRole();
  const toast = useToast();

  const [fullNameInput, setFullNameInput] = useState(null);
  const fullName = fullNameInput !== null ? fullNameInput : (profile?.full_name || '');
  const [nameError, setNameError] = useState(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    const err = validateFullName(fullName);
    if (err) {
      setNameError(err);
      return;
    }

    setNameError(null);
    setIsSavingName(true);

    try {
      await profileService.updateProfile(user.id, { fullName });
      await refreshProfile();
      toast.success('Your profile name has been updated.', 'Profile Saved');
    } catch (err) {
      console.error('Update name error:', err);
      toast.error(err.message || 'Failed to update name. RLS may have blocked this operation.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick check
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP).', 'Invalid File');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB.', 'File Too Large');
      return;
    }

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsUploadingAvatar(true);
    try {
      const publicUrl = await profileService.uploadAvatar(user.id, file);
      // Save avatar_url to profile record
      await profileService.updateProfile(user.id, { avatarUrl: publicUrl });
      await refreshProfile();
      toast.success('Profile avatar uploaded successfully!', 'Avatar Updated');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error(
        err.message || 'Storage upload failed. Please ensure the avatars bucket is created.',
        'Upload Failed'
      );
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const formattedCreatedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  const formattedUpdatedDate = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, role permissions, and authentication credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={roleMeta?.badgeColor || 'emerald'} size="lg" dot>
            {roleMeta?.label || 'Member'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary Card */}
        <div className="space-y-6">
          <Card className="text-center p-6 sm:p-8">
            <div className="relative inline-block mx-auto mb-4">
              <Avatar
                src={avatarPreview || profile?.avatar_url}
                name={profile?.full_name || user?.email || 'User'}
                size="2xl"
                className="ring-4 ring-indigo-500/10 dark:ring-indigo-500/20"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-xs">
                  <Spinner size="md" color="text-white" />
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {profile?.full_name || 'TeamFlow Member'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user?.email}
            </p>

            <div className="mt-4 flex justify-center">
              <Badge variant={roleMeta?.badgeColor || 'emerald'} size="md">
                Role: {roleMeta?.label || 'Member'}
              </Badge>
            </div>

            {/* Avatar Upload Trigger */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarSelect}
                className="hidden"
                id="avatar-file-input"
              />
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={Upload}
                isLoading={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Avatar
              </Button>
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                JPEG, PNG or WebP &bull; Max 2MB
              </p>
            </div>
          </Card>

          {/* Role Details Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-900 dark:text-white">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Assigned Permissions</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {roleMeta?.description || 'Standard workspace member privileges.'}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Security Notice:</span>
              </div>
              <p>
                Roles are enforced via PostgreSQL Row Level Security (RLS) triggers. Direct role modification by non-admin users is prevented at the database level.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Details & Account Meta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                General Profile Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your public name used across project boards, assignments, and comments.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdateName} className="space-y-5">
                <Input
                  label="Full Name"
                  id="profile-fullname"
                  name="fullName"
                  placeholder="e.g. Sarah Connor"
                  value={fullName}
                  onChange={(e) => {
                    setFullNameInput(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  error={nameError}
                  icon={User}
                  required
                />

                <Input
                  label="Email Address (Read-only)"
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  helperText="Email is bound to your Supabase authentication identity."
                  icon={Mail}
                />

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSavingName}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Metadata & Security Card */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Metadata & RLS Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identity details verified by PostgreSQL Row Level Security.
              </p>
            </CardHeader>

            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    User UUID (auth.uid())
                  </dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200 truncate" title={user?.id}>
                    {user?.id || '—'}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Assigned Role
                  </dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {role}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Member Since
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {formattedCreatedDate}
                  </dd>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Profile Last Updated
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {formattedUpdatedDate}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
