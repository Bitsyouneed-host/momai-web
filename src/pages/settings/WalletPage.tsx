import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Copy, Check, ExternalLink, Loader2, History, Coins, AlertTriangle, Info } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { tokensApi, type TokenSpend } from '../../api/tokens';
import { usersApi } from '../../api/users';

export default function WalletPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { tokenBalance } = useSubscriptionStore();
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TokenSpend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [avaxBalance, setAvaxBalance] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [showExportWarning, setShowExportWarning] = useState(false);

  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;
  const isGeneratedWallet = user?.authMethod === 'email' && user?.generatedWallet?.address;

  useEffect(() => {
    tokensApi.getHistory({ limit: 20 }).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).spends as TokenSpend[]) || [];
        setHistory(list);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));

    if (walletAddress) {
      usersApi.getWalletInfo().then(({ data }) => {
        if (data.success && data.data) {
          const walletData = data.data as Record<string, unknown>;
          if (walletData.nativeBalance) {
            const nb = walletData.nativeBalance as { balance: string };
            setAvaxBalance(nb.balance);
          }
          if (walletData.usdtBalance) {
            const ub = walletData.usdtBalance as { balance: string };
            setUsdtBalance(ub.balance);
          }
        }
      }).catch(() => {});
    }
  }, [walletAddress]);

  const copyAddress = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch {
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const reasonLabels: Record<string, string> = {
    call: 'AI Call',
    cancel: 'Cancellation',
    reschedule: 'Reschedule',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Wallet</h1>
      </div>

      {walletAddress ? (
        <>
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <Wallet size={20} className="text-primary-deep" />
              <span className="text-sm font-semibold text-text-primary">Your Wallet</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <code className="text-xs flex-1 truncate text-text-secondary">{walletAddress}</code>
              <button onClick={copyAddress} className="p-1 hover:bg-gray-200 rounded">
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
              </button>
            </div>
            <a
              href={`https://testnet.snowtrace.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-2 text-xs text-primary-deep hover:underline"
            >
              <ExternalLink size={12} /> View on Snowtrace
            </a>
          </GlassCard>

          {/* Balances */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="!p-4">
              <div className="text-xs text-text-secondary mb-1">AVAX Balance</div>
              <div className="text-lg font-bold text-text-primary">
                {avaxBalance !== null ? `${parseFloat(avaxBalance).toFixed(4)}` : '...'}
              </div>
              <div className="text-[10px] text-muted">Avalanche</div>
            </GlassCard>
            <GlassCard className="!p-4">
              <div className="text-xs text-text-secondary mb-1">USDT Balance</div>
              <div className="text-lg font-bold text-text-primary">
                {usdtBalance !== null ? `${parseFloat(usdtBalance).toFixed(2)}` : '...'}
              </div>
              <div className="text-[10px] text-muted">USDT</div>
            </GlassCard>
            <GlassCard className="!p-4">
              <div className="text-xs text-text-secondary mb-1">MOMAI Tokens</div>
              <div className="text-lg font-bold text-text-primary">{tokenBalance}</div>
              <div className="text-[10px] text-muted">Available</div>
            </GlassCard>
          </div>

          {/* Fund Wallet */}
          <GlassCard className="!bg-primary/5 !border-primary/20">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-primary-deep shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Fund Your Wallet</p>
                <p className="text-xs text-text-secondary">
                  Send AVAX to your wallet address above to fund it for subscription payments and gas fees.
                  You can also send USDT (Avalanche C-Chain) for subscription payments.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Export Private Key */}
          {isGeneratedWallet && (
            <>
              <button
                onClick={() => setShowExportWarning(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-warning/30 text-warning text-sm font-medium hover:bg-warning/5"
              >
                <AlertTriangle size={16} /> Export Private Key
              </button>

              {showExportWarning && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowExportWarning(false)}>
                  <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle size={24} />
                      <h3 className="font-bold text-lg">Warning</h3>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Exporting your private key is a security risk. Anyone with your private key has full control of your wallet and funds.
                      Only export if you are moving to a self-custodial wallet.
                    </p>
                    <p className="text-xs text-muted">
                      This feature is not yet available on the web. Please use the mobile app to export your private key securely.
                    </p>
                    <button
                      onClick={() => setShowExportWarning(false)}
                      className="w-full py-3 rounded-xl bg-gray-100 text-text-primary font-medium text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <GlassCard>
          <div className="text-center py-4">
            <Wallet size={32} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-text-secondary mb-4">No wallet connected</p>
            <PrimaryButton onClick={connectMetaMask} isLoading={isConnecting}>
              Connect MetaMask
            </PrimaryButton>
          </div>
        </GlassCard>
      )}

      {/* Token History */}
      <div>
        <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <History size={16} /> Token History
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Coins size={40} />}
            title="No Token Activity"
            message="Your token spend history will appear here"
          />
        ) : (
          <div className="space-y-2">
            {history.map((tx) => (
              <GlassCard key={tx._id} className="!p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {reasonLabels[tx.reason] || tx.reason}
                    </div>
                    {tx.providerName && (
                      <div className="text-xs text-text-secondary">{tx.providerName}</div>
                    )}
                    <div className="text-[10px] text-muted">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-error">-{tx.amount} MOMAI</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
