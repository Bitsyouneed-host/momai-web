import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Shield, Clock, Sparkles, Plus, Calendar, Phone, Mail, ChevronRight } from 'lucide-react';
import { ethers } from 'ethers';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { appointmentsApi } from '../../api/appointments';
import { usersApi } from '../../api/users';
import { ACTIVE_CHAIN, NFT_CONTRACT_ADDRESS, NFT_ABI } from '../../lib/contracts';
import type { Appointment } from '../../types/appointment';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { subscription, tokenBalance, useTokenSystem } = useSubscriptionStore();
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [passInfo, setPassInfo] = useState<{ tokenId: string; tier: string; callsPerMonth: number; daysRemaining: number; expiresAt: Date; isValid: boolean } | null>(null);

  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  // Fetch season pass token ID from backend, then read on-chain
  useEffect(() => {
    if (!walletAddress) return;
    usersApi.getWalletInfo().then(({ data }) => {
      if (data.success && data.data) {
        const sp = (data.data as Record<string, unknown>).seasonPass as { tokenId?: string } | undefined;
        if (sp?.tokenId) {
          const tokenId = sp.tokenId;
          const provider = new ethers.JsonRpcProvider(ACTIVE_CHAIN.rpcUrl);
          const nftAddress = NFT_CONTRACT_ADDRESS[ACTIVE_CHAIN.chainId];
          if (!nftAddress) return;
          const contract = new ethers.Contract(nftAddress, NFT_ABI, provider);
          Promise.all([contract.getPassInfo(tokenId), contract.daysRemaining(tokenId)]).then(([info, days]) => {
            const tierNum = Number(info[0]);
            setPassInfo({
              tokenId,
              tier: tierNum === 2 ? 'Pro+' : tierNum === 1 ? 'Pro' : 'Unknown',
              callsPerMonth: Number(info[1]),
              daysRemaining: Number(days),
              expiresAt: new Date(Number(info[3]) * 1000),
              isValid: info[5],
            });
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, [walletAddress]);

  useEffect(() => {
    appointmentsApi.list({ status: 'scheduled' }).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).appointments as Appointment[]) || [];
        const sorted = list
          .filter((a) => new Date(a.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 3);
        setUpcoming(sorted);
      }
    }).catch(() => {});
  }, []);

  const tier = subscription?.tier || 'free';
  const tierName = tier === 'pro_plus' ? 'Pro+' : tier === 'pro' ? 'Pro' : 'Free';
  const callsUsed = subscription?.callUsage?.used ?? 0;
  const callsLimit = subscription?.callUsage?.limit ?? 0;
  const percentUsed = callsLimit > 0 ? (callsUsed / callsLimit) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.firstName || 'there'}
        </h1>
        <p className="text-text-secondary">What would you like to do today?</p>
      </div>

      {/* Connect Email Banner (for wallet-only users who skipped email) */}
      {!user?.email && (
        <button
          onClick={() => navigate('/connect-email')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <Mail size={24} />
            <div className="text-left flex-1">
              <div className="font-bold text-sm">Connect Your Email</div>
              <div className="text-xs opacity-90">Get 29 USDT + 10 MOMAI tokens + gas fees covered</div>
            </div>
            <ChevronRight size={20} />
          </div>
        </button>
      )}

      {/* Subscription Status */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <StatusBadge status={tier} />
            <span className="ml-2 text-sm text-text-secondary">{tierName} Plan</span>
          </div>
          {subscription?.paymentProvider === 'crypto' && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
              Crypto
            </span>
          )}
        </div>
        {useTokenSystem ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">MOMAI Tokens:</span>
            <span className="font-bold text-text-primary">{tokenBalance}</span>
          </div>
        ) : tier !== 'free' ? (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">AI Calls Used</span>
              <span className="font-medium text-text-primary">{callsUsed} / {callsLimit}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentUsed >= 90 ? 'bg-error' : percentUsed >= 70 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Upgrade to Pro to unlock AI-powered bookings
          </p>
        )}
      </GlassCard>

      {/* Season Pass NFT */}
      {passInfo && (
        <GlassCard className={passInfo.isValid ? '!border-success/30 !bg-success/5' : '!border-error/30 !bg-error/5'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className={passInfo.isValid ? 'text-success' : 'text-error'} />
              <span className="text-sm font-semibold text-text-primary">Season Pass #{passInfo.tokenId}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passInfo.isValid ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {passInfo.isValid ? 'Active' : 'Expired'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-text-secondary">Tier</div>
              <div className="text-sm font-bold text-text-primary">{passInfo.tier}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-secondary">Calls/Month</div>
              <div className="text-sm font-bold text-text-primary">{passInfo.callsPerMonth}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-secondary flex items-center gap-1"><Clock size={10} /> Remaining</div>
              <div className={`text-sm font-bold ${passInfo.daysRemaining <= 7 ? 'text-warning' : 'text-text-primary'}`}>
                {passInfo.daysRemaining} {passInfo.daysRemaining === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted">
            Expires {passInfo.expiresAt.toLocaleDateString()}
          </div>
        </GlassCard>
      )}

      {/* MOM ME Hero Button */}
      <button
        onClick={() => navigate('/mom-me')}
        className="w-full p-5 rounded-2xl bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <Wand2 size={28} />
          <div className="text-left">
            <div className="font-bold text-lg">MOM ME!</div>
            <div className="text-sm opacity-90">Find a provider & book automatically</div>
          </div>
        </div>
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="!p-4" onClick={() => navigate('/booking/new')}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <span className="text-sm font-medium">AI Book</span>
          </div>
        </GlassCard>
        <GlassCard className="!p-4" onClick={() => navigate('/appointments/new')}>
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-success" />
            <span className="text-sm font-medium">New Apt</span>
          </div>
        </GlassCard>
        <GlassCard className="!p-4" onClick={() => navigate('/calendar')}>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary-deep" />
            <span className="text-sm font-medium">Calendar</span>
          </div>
        </GlassCard>
        <GlassCard className="!p-4" onClick={() => navigate('/booking/pending')}>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        </GlassCard>
      </div>

      {/* Insurance */}
      {user?.insurance?.hasInsurance ? (
        <GlassCard>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-success" />
            <span className="text-sm font-medium text-text-primary">Insurance Added</span>
            <span className="text-xs text-text-secondary ml-auto">{user.insurance.provider}</span>
          </div>
        </GlassCard>
      ) : (
        <button
          onClick={() => navigate('/settings/profile')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-accent text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} />
            <span className="font-medium text-sm">Add Insurance Info</span>
          </div>
        </button>
      )}

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('/appointments')}
            className="text-sm text-primary-deep font-medium"
          >
            View All
          </button>
        </div>
        {upcoming.length === 0 ? (
          <GlassCard>
            <div className="text-center py-4">
              <Calendar size={28} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-text-secondary">No upcoming appointments</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {upcoming.map((apt) => (
              <GlassCard
                key={apt._id}
                className="!p-4"
                onClick={() => navigate(`/appointments/${apt._id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-xs text-text-secondary">{formatDate(apt.startTime)}</div>
                    <div className="text-sm font-semibold text-text-primary">{formatTime(apt.startTime)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">{apt.title}</div>
                    {apt.providerName && (
                      <div className="text-xs text-text-secondary truncate">{apt.providerName}</div>
                    )}
                  </div>
                  {apt.bookingMethod !== 'manual' && (
                    <Phone size={14} className="text-accent shrink-0" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
