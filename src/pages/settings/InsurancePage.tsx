import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Shield } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuthStore } from '../../stores/authStore';
import { usersApi } from '../../api/users';

export default function InsurancePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [hasInsurance, setHasInsurance] = useState(user?.insurance?.hasInsurance || false);
  const [provider, setProvider] = useState(user?.insurance?.provider || '');
  const [policyNumber, setPolicyNumber] = useState(user?.insurance?.policyNumber || '');
  const [groupNumber, setGroupNumber] = useState(user?.insurance?.groupNumber || '');
  const [memberId, setMemberId] = useState(user?.insurance?.memberId || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.insurance) {
      setHasInsurance(user.insurance.hasInsurance || false);
      setProvider(user.insurance.provider || '');
      setPolicyNumber(user.insurance.policyNumber || '');
      setGroupNumber(user.insurance.groupNumber || '');
      setMemberId(user.insurance.memberId || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await usersApi.updateMe({
        insurance: {
          hasInsurance,
          provider: hasInsurance ? provider.trim() : undefined,
          policyNumber: hasInsurance ? policyNumber.trim() : undefined,
          groupNumber: hasInsurance ? groupNumber.trim() : undefined,
          memberId: hasInsurance ? memberId.trim() : undefined,
        },
      });
      if (data.success) {
        await useAuthStore.getState().fetchUser();
        toast.success('Insurance info saved');
        navigate('/settings');
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save insurance info');
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
        <h1 className="text-2xl font-bold text-text-primary">Insurance</h1>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className={hasInsurance ? 'text-success' : 'text-muted'} />
            <span className="font-semibold text-text-primary">I have insurance</span>
          </div>
          <button
            onClick={() => setHasInsurance(!hasInsurance)}
            className={`w-12 h-7 rounded-full transition-colors relative ${hasInsurance ? 'bg-success' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${hasInsurance ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {hasInsurance && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Insurance Provider</label>
              <input
                type="text"
                placeholder="e.g. Blue Cross Blue Shield"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Policy Number</label>
              <input
                type="text"
                placeholder="Policy Number"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Group Number</label>
              <input
                type="text"
                placeholder="Group Number"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Member ID</label>
              <input
                type="text"
                placeholder="Member ID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </GlassCard>

      <PrimaryButton onClick={handleSave} isLoading={isSaving}>
        Save Insurance Info
      </PrimaryButton>
    </div>
  );
}
