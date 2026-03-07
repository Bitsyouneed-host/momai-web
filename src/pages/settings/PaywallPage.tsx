import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Check, Phone, Calendar, Search, Users, Sparkles, Loader2, Wallet } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionApi } from '../../api/subscription';
import client from '../../api/client';

const features = [
  { icon: Phone, label: 'AI Phone Calls (automated booking)' },
  { icon: Sparkles, label: 'SMS Notifications' },
  { icon: Calendar, label: 'Calendar Sync' },
  { icon: Search, label: 'Provider Management' },
  { icon: Users, label: 'Platform AI' },
];

type PaymentMethod = 'avax' | 'usdt';

export default function PaywallPage() {
  const navigate = useNavigate();
  const { subscription, tokenBalance, useTokenSystem, fetchStatus } = useSubscriptionStore();
  const user = useAuthStore((s) => s.user);

  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('avax');
  const [avaxPrice, setAvaxPrice] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const currentTier = subscription?.tier || 'free';
  const tierName = currentTier === 'pro_plus' ? 'Pro+' : currentTier === 'pro' ? 'Pro' : 'Free';
  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  const planPrices = { pro: 29, pro_plus: 72 };

  useEffect(() => {
    subscriptionApi.getCryptoPrice().then(({ data }) => {
      if (data.success && data.data) setAvaxPrice(data.data.avaxPrice);
    }).catch(() => {});
  }, []);

  const getAvaxAmount = (usdPrice: number) => {
    if (!avaxPrice || avaxPrice === 0) return '...';
    return (usdPrice / avaxPrice).toFixed(4);
  };

  const handlePay = async () => {
    if (!selectedPlan) return;
    if (!walletAddress) {
      toast.error('Please connect a wallet first');
      navigate('/settings/wallet');
      return;
    }

    setIsPaying(true);
    try {
      const { data } = await client.post('/subscription/crypto/pay', {
        planId: selectedPlan,
        tokenType: paymentMethod === 'avax' ? 'native' : 'usdt',
      });

      if (data.success) {
        toast.success('Payment successful! Subscription activated.');
        await fetchStatus();
        setSelectedPlan(null);
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

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
      <GlassCard
        className={`${currentTier === 'pro' ? '!border-primary/50 ring-2 ring-primary/20' : ''} ${selectedPlan === 'pro' ? '!border-accent/50 ring-2 ring-accent/20' : ''}`}
        onClick={() => currentTier !== 'pro' ? setSelectedPlan('pro') : undefined}
      >
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
        {currentTier === 'pro' && (
          <div className="text-center text-sm text-success font-medium">Current Plan</div>
        )}
        {currentTier !== 'pro' && selectedPlan !== 'pro' && (
          <button
            onClick={() => setSelectedPlan('pro')}
            className="w-full py-3 rounded-xl bg-primary/10 text-primary-deep font-medium text-sm"
          >
            Select Plan
          </button>
        )}
        {selectedPlan === 'pro' && (
          <div className="text-center text-sm text-accent font-medium">Selected</div>
        )}
      </GlassCard>

      {/* Pro+ Plan */}
      <GlassCard
        className={`${currentTier === 'pro_plus' ? '!border-accent/50 ring-2 ring-accent/20' : ''} ${selectedPlan === 'pro_plus' ? '!border-accent/50 ring-2 ring-accent/20' : ''}`}
        onClick={() => currentTier !== 'pro_plus' ? setSelectedPlan('pro_plus') : undefined}
      >
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
        {currentTier === 'pro_plus' && (
          <div className="text-center text-sm text-accent font-medium">Current Plan</div>
        )}
        {currentTier !== 'pro_plus' && selectedPlan !== 'pro_plus' && (
          <button
            onClick={() => setSelectedPlan('pro_plus')}
            className="w-full py-3 rounded-xl bg-accent/10 text-accent font-medium text-sm"
          >
            Select Plan
          </button>
        )}
        {selectedPlan === 'pro_plus' && (
          <div className="text-center text-sm text-accent font-medium">Selected</div>
        )}
      </GlassCard>

      {/* Payment Section (shown when plan selected) */}
      {selectedPlan && (
        <GlassCard className="!border-accent/30">
          <h3 className="font-semibold text-text-primary mb-3">Payment</h3>

          {/* Payment Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod('avax')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                paymentMethod === 'avax'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-primary/15 text-text-secondary'
              }`}
            >
              AVAX
            </button>
            <button
              onClick={() => setPaymentMethod('usdt')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                paymentMethod === 'usdt'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-primary/15 text-text-secondary'
              }`}
            >
              USDT
            </button>
          </div>

          {/* Price Display */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {selectedPlan === 'pro' ? 'Pro' : 'Pro+'} Plan
              </span>
              <span className="font-bold text-text-primary">
                {paymentMethod === 'usdt'
                  ? `$${planPrices[selectedPlan]} USDT`
                  : `${getAvaxAmount(planPrices[selectedPlan])} AVAX`
                }
              </span>
            </div>
            {paymentMethod === 'avax' && avaxPrice && (
              <div className="text-xs text-muted mt-1 text-right">
                1 AVAX = ${avaxPrice.toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Wallet Status */}
          {!walletAddress && (
            <div className="bg-warning/10 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-warning" />
              <span className="text-xs text-warning font-medium">
                Connect a wallet first to make payments
              </span>
            </div>
          )}

          <PrimaryButton
            onClick={handlePay}
            isLoading={isPaying}
            disabled={!walletAddress}
            className="!from-accent !to-pink-500"
          >
            {isPaying ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
            ) : (
              `Pay ${paymentMethod === 'usdt' ? `$${planPrices[selectedPlan]} USDT` : `${getAvaxAmount(planPrices[selectedPlan])} AVAX`}`
            )}
          </PrimaryButton>

          <button onClick={() => setSelectedPlan(null)} className="w-full text-center text-sm text-muted py-2 mt-1">
            Cancel
          </button>
        </GlassCard>
      )}

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
        <h3 className="font-semibold text-text-primary mb-3">What&apos;s Included</h3>
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
