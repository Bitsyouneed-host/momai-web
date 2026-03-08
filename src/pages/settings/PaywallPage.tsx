import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { ArrowLeft, Star, Check, Phone, Calendar, Search, Users, Sparkles, Loader2, Wallet, Shield } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionApi } from '../../api/subscription';
import { useContractMint, type MintTxState } from '../../hooks/useContractMint';
import { TIER_PRO, TIER_PRO_PLUS, ACTIVE_CHAIN, NFT_CONTRACT_ADDRESS, NFT_ABI } from '../../lib/contracts';
import client from '../../api/client';

const features = [
  { icon: Phone, label: 'AI Phone Calls (automated booking)' },
  { icon: Sparkles, label: 'SMS Notifications' },
  { icon: Calendar, label: 'Calendar Sync' },
  { icon: Search, label: 'Provider Management' },
  { icon: Users, label: 'Platform AI' },
];

type PaymentMethod = 'avax' | 'usdt';

const durationOptions = [
  { months: 1, label: '1 Month', discount: 0 },
  { months: 3, label: '3 Months', discount: 10 },
  { months: 12, label: '12 Months', discount: 25 },
];

const txStateLabels: Record<MintTxState, string> = {
  idle: '',
  'switching-chain': 'Switching to Avalanche...',
  approving: 'Approving USDT... (sign in wallet)',
  signing: 'Sign transaction in wallet...',
  pending: 'Transaction sent...',
  confirming: 'Confirming on-chain...',
  verifying: 'Verifying subscription...',
  success: 'Success!',
  error: 'Transaction failed',
};

export default function PaywallPage() {
  const navigate = useNavigate();
  const { subscription, tokenBalance, useTokenSystem, fetchStatus } = useSubscriptionStore();
  const user = useAuthStore((s) => s.user);

  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('avax');
  const [durationMonths, setDurationMonths] = useState(1);
  const [avaxPrice, setAvaxPrice] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { txState, error: mintError, txHash, mintWithAVAX, mintWithUSDT, reset: resetMint } = useContractMint();

  const currentTier = subscription?.tier || 'free';
  const tierName = currentTier === 'pro_plus' ? 'Pro+' : currentTier === 'pro' ? 'Pro' : 'Free';
  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  // External wallet = MetaMask/injected provider available AND user is wallet-auth or has external wallet
  const isExternalWallet = !!window.ethereum && (!user?.generatedWallet || user?.generatedWallet?.provider === 'external');

  const planPrices = { pro: 29, pro_plus: 72 };

  // Contract prices keyed by "tier-duration-method"
  const [contractPrices, setContractPrices] = useState<Record<string, string>>({});

  // Fetch prices directly from the smart contract so display matches actual charge
  useEffect(() => {
    subscriptionApi.getCryptoPrice().then(({ data }) => {
      if (data.success && data.data) setAvaxPrice(data.data.avaxPrice);
    }).catch(() => {});

    // Fetch contract prices for all plan/duration combinations
    const fetchContractPrices = async () => {
      const nftAddress = NFT_CONTRACT_ADDRESS[ACTIVE_CHAIN.chainId];
      if (!nftAddress) return;
      try {
        const provider = new ethers.JsonRpcProvider(ACTIVE_CHAIN.rpcUrl);
        const contract = new ethers.Contract(nftAddress, NFT_ABI, provider);
        const prices: Record<string, string> = {};

        for (const tier of [TIER_PRO, TIER_PRO_PLUS]) {
          for (const dur of [1, 3, 12]) {
            try {
              const avaxWei: bigint = await contract.getPrice(tier, dur);
              prices[`${tier}-${dur}-avax`] = ethers.formatEther(avaxWei);
            } catch {
              // Contract call failed, leave empty
            }
            try {
              const usdtRaw: bigint = await contract.getUSDPrice(tier, dur);
              prices[`${tier}-${dur}-usdt`] = ethers.formatUnits(usdtRaw, 6);
            } catch {
              // Contract call failed, leave empty
            }
          }
        }
        setContractPrices(prices);
      } catch {
        // Fallback: contract not reachable
      }
    };
    fetchContractPrices();
  }, []);

  const getDiscountedPrice = (usdPrice: number) => {
    const opt = durationOptions.find((d) => d.months === durationMonths);
    const total = usdPrice * durationMonths;
    return opt && opt.discount > 0 ? total * (1 - opt.discount / 100) : total;
  };

  const getFormattedPrice = (plan: 'pro' | 'pro_plus') => {
    const tier = plan === 'pro' ? TIER_PRO : TIER_PRO_PLUS;
    const key = `${tier}-${durationMonths}-${paymentMethod}`;
    const contractPrice = contractPrices[key];

    if (contractPrice) {
      if (paymentMethod === 'usdt') {
        return `$${parseFloat(contractPrice).toFixed(2)} USDT`;
      }
      return `${parseFloat(contractPrice).toFixed(4)} AVAX`;
    }

    // Fallback to USD calculation if contract prices not loaded yet
    const usdPrice = planPrices[plan];
    if (paymentMethod === 'usdt') {
      return `$${getDiscountedPrice(usdPrice).toFixed(2)} USDT`;
    }
    if (!avaxPrice || avaxPrice === 0) return '... AVAX';
    return `${(getDiscountedPrice(usdPrice) / avaxPrice).toFixed(4)} AVAX`;
  };

  // External wallet: sign directly via MetaMask
  const handleExternalPay = async () => {
    if (!selectedPlan) return;
    const tier = selectedPlan === 'pro' ? TIER_PRO : TIER_PRO_PLUS;
    if (paymentMethod === 'avax') {
      await mintWithAVAX(tier, durationMonths);
    } else {
      await mintWithUSDT(tier, durationMonths);
    }
  };

  // Backend-managed wallet: backend signs on behalf
  const handleBackendPay = async () => {
    if (!selectedPlan) return;
    if (!walletAddress) {
      toast.error('Please connect a wallet first');
      navigate('/settings/wallet');
      return;
    }

    setIsPaying(true);
    try {
      const { data } = await client.post('/subscription/nft/mint', {
        tier: selectedPlan === 'pro' ? TIER_PRO : TIER_PRO_PLUS,
        durationMonths,
        tokenType: paymentMethod === 'avax' ? 'native' : 'usdt',
        chain: 'avalancheFuji',
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

  const handlePay = () => {
    if (isExternalWallet) {
      handleExternalPay();
    } else {
      handleBackendPay();
    }
  };

  const isMinting = txState !== 'idle' && txState !== 'success' && txState !== 'error';

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
            <div className="text-xs text-text-secondary">/month</div>
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
            <div className="text-xs text-text-secondary">/month</div>
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

          {/* Duration Selector */}
          <div className="mb-4">
            <p className="text-xs text-text-secondary mb-2">Duration</p>
            <div className="flex gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.months}
                  onClick={() => setDurationMonths(opt.months)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors relative ${
                    durationMonths === opt.months
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-primary/15 text-text-secondary'
                  }`}
                >
                  {opt.label}
                  {opt.discount > 0 && (
                    <span className="absolute -top-2 -right-1 text-[9px] bg-success text-white px-1.5 py-0.5 rounded-full font-bold">
                      -{opt.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

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
                {selectedPlan === 'pro' ? 'Pro' : 'Pro+'} Plan ({durationMonths}mo)
              </span>
              <span className="font-bold text-text-primary">
                {getFormattedPrice(selectedPlan)}
              </span>
            </div>
            {paymentMethod === 'avax' && avaxPrice && (
              <div className="text-xs text-muted mt-1 text-right">
                1 AVAX = ${avaxPrice.toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Wallet Status */}
          {!walletAddress && !window.ethereum && (
            <div className="bg-warning/10 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-warning" />
              <span className="text-xs text-warning font-medium">
                Connect a wallet first to make payments
              </span>
            </div>
          )}

          {/* External wallet indicator */}
          {isExternalWallet && (
            <div className="bg-primary/5 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary-deep" />
              <span className="text-xs text-text-secondary">
                You&apos;ll sign this transaction in your wallet (MetaMask)
              </span>
            </div>
          )}

          {/* Transaction Progress (external wallet) */}
          {isMinting && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{txStateLabels[txState]}</p>
                  {txHash && (
                    <a
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-deep hover:underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mint Success */}
          {txState === 'success' && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-success" />
                <div>
                  <p className="text-sm font-medium text-success">Subscription activated!</p>
                  {txHash && (
                    <a
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-deep hover:underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mint Error */}
          {txState === 'error' && mintError && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-error">{mintError}</p>
              <button onClick={resetMint} className="text-xs text-primary-deep font-medium mt-1 hover:underline">
                Try again
              </button>
            </div>
          )}

          <PrimaryButton
            onClick={handlePay}
            isLoading={isPaying || isMinting}
            disabled={(!walletAddress && !window.ethereum) || isMinting}
            className="!from-accent !to-pink-500"
          >
            {isPaying || isMinting ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
            ) : (
              `Pay ${getFormattedPrice(selectedPlan)}`
            )}
          </PrimaryButton>

          <button onClick={() => { setSelectedPlan(null); resetMint(); }} className="w-full text-center text-sm text-muted py-2 mt-1">
            Cancel
          </button>
        </GlassCard>
      )}

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
