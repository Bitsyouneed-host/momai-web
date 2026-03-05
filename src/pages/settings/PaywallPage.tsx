import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, Phone, Calendar, Search, Users, Sparkles } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSubscriptionStore } from '../../stores/subscriptionStore';

const features = [
  { icon: Phone, label: 'AI Phone Calls (automated booking)' },
  { icon: Sparkles, label: 'SMS Notifications' },
  { icon: Calendar, label: 'Calendar Sync' },
  { icon: Search, label: 'Provider Management' },
  { icon: Users, label: 'Platform AI' },
];

export default function PaywallPage() {
  const navigate = useNavigate();
  const { subscription, tokenBalance, useTokenSystem } = useSubscriptionStore();

  const currentTier = subscription?.tier || 'free';
  const tierName = currentTier === 'pro_plus' ? 'Pro+' : currentTier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Subscription</h1>
      </div>

      {/* Header */}
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
          <Star size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Upgrade to Pro</h2>
        <p className="text-sm text-text-secondary mt-1">Unlock AI-powered appointment booking</p>
      </div>

      {/* Current Plan */}
      {currentTier !== 'free' && (
        <GlassCard className="!border-success/30 !bg-success/5">
          <div className="flex items-center justify-between">
            <div>
              <StatusBadge status={currentTier} />
              <span className="ml-2 text-sm font-medium text-text-primary">{tierName} Plan - Active</span>
            </div>
            {useTokenSystem && (
              <span className="text-sm font-bold text-text-primary">{tokenBalance} MOMAI</span>
            )}
          </div>
          {subscription?.callUsage && !useTokenSystem && (
            <div className="mt-2 text-xs text-text-secondary">
              {subscription.callUsage.used} / {subscription.callUsage.limit} calls used
            </div>
          )}
        </GlassCard>
      )}

      {/* Pro Plan */}
      <GlassCard className={currentTier === 'pro' ? '!border-primary/50 ring-2 ring-primary/20' : ''}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-text-primary text-lg">Pro</h3>
            <p className="text-xs text-text-secondary">30 AI calls/month</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-text-primary">$29</div>
            <div className="text-xs text-text-secondary">USDT/month</div>
          </div>
        </div>
        {currentTier !== 'pro' && (
          <PrimaryButton onClick={() => navigate('/settings/wallet')}>
            Subscribe with Crypto
          </PrimaryButton>
        )}
        {currentTier === 'pro' && (
          <div className="text-center text-sm text-success font-medium">Current Plan</div>
        )}
      </GlassCard>

      {/* Pro+ Plan */}
      <GlassCard className={currentTier === 'pro_plus' ? '!border-accent/50 ring-2 ring-accent/20' : ''}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-text-primary text-lg">Pro+</h3>
            <p className="text-xs text-text-secondary">75 AI calls/month</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-text-primary">$72</div>
            <div className="text-xs text-text-secondary">USDT/month</div>
          </div>
        </div>
        {currentTier !== 'pro_plus' && (
          <PrimaryButton onClick={() => navigate('/settings/wallet')} className="!from-accent !to-pink-500">
            Subscribe with Crypto
          </PrimaryButton>
        )}
        {currentTier === 'pro_plus' && (
          <div className="text-center text-sm text-accent font-medium">Current Plan</div>
        )}
      </GlassCard>

      {/* BYOK */}
      <GlassCard className="opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-text-primary">BYOK</h3>
            <p className="text-xs text-text-secondary">Bring Your Own Keys</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
            Coming Soon
          </span>
        </div>
      </GlassCard>

      {/* Features */}
      <GlassCard>
        <h3 className="font-semibold text-text-primary mb-3">What's Included</h3>
        <div className="space-y-3">
          {features.map(({ label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Check size={14} className="text-success" />
              </div>
              <span className="text-sm text-text-primary">{label}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Payment tokens */}
      <div className="flex justify-center gap-3">
        <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          USDT
        </span>
        <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
          AVAX
        </span>
      </div>

      <p className="text-xs text-center text-muted px-4">
        Payments are processed on Avalanche C-Chain. AVAX prices use Chainlink oracle feeds.
      </p>
    </div>
  );
}
