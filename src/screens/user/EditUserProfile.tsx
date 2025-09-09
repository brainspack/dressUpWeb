import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { baseApi } from '../../api/baseApi';
import useAuthStore from '../../store/useAuthStore';

export interface UserProfile {
  id: string;
  name?: string;
  mobileNumber: string;
  role: string;
  language: string;
  createdAt: string;
  profileImage?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  language?: string;
}

const EditUserProfile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    language: 'EN',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await baseApi('/users/profile', { method: 'GET' });
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        language: profileData.language || 'EN',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await baseApi('/users/profile', {
        method: 'PATCH',
        data: formData,
      });
      setProfile(updatedProfile);
      
      // Update auth store with new user data
      if (user) {
        setUser({
          ...user,
          name: updatedProfile.name || user.name,
        });
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        language: profile.language || 'EN',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="HI">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {profile && (
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  value={profile.mobileNumber}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Mobile number cannot be changed</p>
              </div>
            )}

            {profile && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={profile.role}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Role cannot be changed</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditUserProfile;
