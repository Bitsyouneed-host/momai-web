import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, CreditCard, Wallet, LogOut, ChevronRight, Lock,
  FileText, Scale, Mail, Calendar, Info,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { subscription } = useSubscriptionStore();

  const tierName = subscription?.tier === 'pro_plus' ? 'Pro+' : subscription?.tier === 'pro' ? 'Pro' : 'Free';
  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
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

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 text-error font-medium hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}
