import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, CreditCard, Wallet, LogOut, ChevronRight, Lock,
  FileText, Scale, Mail, Calendar, Info, Smartphone, Download, Trash2,
  AlertTriangle, X,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { usersApi } from '../../api/users';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { subscription } = useSubscriptionStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const tierName = subscription?.tier === 'pro_plus' ? 'Pro+' : subscription?.tier === 'pro' ? 'Pro' : 'Free';
  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await usersApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete account. Please try again.')
          : 'Failed to delete account. Please try again.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      {/* Profile */}
      <GlassCard onClick={() => navigate('/settings/profile')}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={24} className="text-primary-deep" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-text-primary">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-text-secondary">{user?.email || 'No email'}</div>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </GlassCard>

      {/* Insurance */}
      <GlassCard onClick={() => navigate('/settings/insurance')}>
        <div className="flex items-center gap-3">
          <Shield size={18} className={user?.insurance?.hasInsurance ? 'text-success' : 'text-muted'} />
          <span className="flex-1 text-sm font-medium text-text-primary">Insurance</span>
          <span className="text-xs text-text-secondary">
            {user?.insurance?.hasInsurance ? user.insurance.provider || 'Added' : 'Not Set'}
          </span>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </GlassCard>

      {/* Subscription */}
      <GlassCard onClick={() => navigate('/settings/paywall')}>
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-accent" />
          <span className="flex-1 text-sm font-medium text-text-primary">Subscription</span>
          <span className="text-xs text-text-secondary">{tierName}</span>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </GlassCard>

      {/* Wallet */}
      <GlassCard onClick={() => navigate('/settings/wallet')}>
        <div className="flex items-center gap-3">
          <Wallet size={18} className="text-primary-deep" />
          <div className="flex-1">
            <div className="text-sm font-medium text-text-primary">Wallet</div>
            {walletAddress && (
              <div className="text-xs text-text-secondary font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            )}
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard onClick={() => navigate('/notifications')}>
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-warning" />
          <span className="flex-1 text-sm font-medium text-text-primary">Notifications</span>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </GlassCard>

      {/* Calendar Integration */}
      <GlassCard>
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-primary-deep" />
          <span className="flex-1 text-sm font-medium text-text-primary">Calendar Integration</span>
          <span className="text-xs text-muted">Coming Soon</span>
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard>
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">Two-Factor Auth</span>
          <span className="text-xs text-muted">Coming Soon</span>
        </div>
      </GlassCard>

      {/* Legal & Support */}
      <div className="pt-2">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">Legal & Support</h3>
        <div className="space-y-2">
          <GlassCard onClick={() => navigate('/settings/privacy')}>
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-text-secondary" />
              <span className="flex-1 text-sm font-medium text-text-primary">Privacy Policy</span>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </GlassCard>
          <GlassCard onClick={() => navigate('/settings/terms')}>
            <div className="flex items-center gap-3">
              <Scale size={18} className="text-text-secondary" />
              <span className="flex-1 text-sm font-medium text-text-primary">Terms & Conditions</span>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </GlassCard>
          <GlassCard onClick={() => navigate('/settings/contact')}>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-text-secondary" />
              <span className="flex-1 text-sm font-medium text-text-primary">Contact Us</span>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* About */}
      <GlassCard>
        <div className="flex items-center gap-3">
          <Info size={18} className="text-text-secondary" />
          <span className="flex-1 text-sm font-medium text-text-primary">About</span>
          <span className="text-xs text-muted">MOM AI Web v1.0.0</span>
        </div>
      </GlassCard>

      {/* Get Mobile App */}
      <div className="pt-2">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">Get the App</h3>
        <GlassCard
          onClick={() => window.open('https://github.com/Bitsyouneed-host/momai-android-releases/releases/latest', '_blank')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Smartphone size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">Download for Android</div>
              <div className="text-xs text-text-secondary">Get the MOM AI mobile app</div>
            </div>
            <Download size={18} className="text-primary-deep" />
          </div>
        </GlassCard>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 text-error font-medium hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        Log Out
      </button>

      {/* Delete Account */}
      <div className="pt-2">
        <button
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-300 text-error font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle size={22} />
                <h2 className="text-lg font-bold">Delete Account</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, appointments, wallet, and subscription will be permanently removed.
            </p>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Type <span className="font-mono font-bold text-error">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>

            {deleteError && (
              <p className="text-sm text-error bg-red-50 rounded-lg px-3 py-2">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-text-primary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-error text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
