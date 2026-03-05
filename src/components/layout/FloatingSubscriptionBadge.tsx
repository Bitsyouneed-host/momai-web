import { useNavigate } from 'react-router-dom';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { Bitcoin, Phone, DollarSign, ArrowUpCircle } from 'lucide-react';

export default function FloatingSubscriptionBadge() {
  const navigate = useNavigate();
  const { subscription, tokenBalance, useTokenSystem } = useSubscriptionStore();

  const tier = subscription?.tier || 'free';
  const isCrypto = subscription?.paymentProvider === 'crypto';
  const callsRemaining = useTokenSystem
    ? tokenBalance
    : subscription?.callUsage?.remaining ?? 0;

  const tierName = tier === 'pro_plus' ? 'Pro+' : tier === 'pro' ? 'Pro' : 'Free';

  const badgeColor = useTokenSystem
    ? tokenBalance <= 5
      ? 'bg-error'
      : tokenBalance <= 10
        ? 'bg-warning'
        : 'bg-primary'
    : 'bg-primary';

  return (
    <button
      onClick={() => navigate('/settings/paywall')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow"
    >
      {isCrypto && <Bitcoin size={14} className="text-orange-500" />}
      <span className="text-xs font-semibold text-text-primary">{tierName}</span>
      {tier !== 'free' || useTokenSystem ? (
        <>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold ${badgeColor}`}>
            {useTokenSystem ? <DollarSign size={8} /> : <Phone size={8} />}
            {callsRemaining}
          </span>
          {useTokenSystem && (
            <span className="text-[8px] font-medium text-text-secondary">MOMAI</span>
          )}
        </>
      ) : (
        <ArrowUpCircle size={12} className="text-primary" />
      )}
    </button>
  );
}
