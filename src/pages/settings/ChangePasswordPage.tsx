import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Lock } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { usersApi } from '../../api/users';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setIsSaving(true);
    try {
      const { data } = await usersApi.changePassword(currentPassword, newPassword);
      if (data.success) {
        toast.success('Password changed successfully');
        navigate('/settings');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Change Password</h1>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Lock size={20} className="text-primary-deep" />
          <span className="font-semibold text-text-primary">Update Password</span>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </GlassCard>

      <PrimaryButton onClick={handleSave} isLoading={isSaving}>
        Update Password
      </PrimaryButton>
    </div>
  );
}
