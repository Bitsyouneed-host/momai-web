import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Copy, Check, ExternalLink, Loader2, History } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../stores/authStore';
import { tokensApi, type TokenSpend } from '../../api/tokens';

export default function WalletPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TokenSpend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  useEffect(() => {
    tokensApi.getHistory({ limit: 20 }).then(({ data }) => {
      if (data.success && data.data) setHistory(data.data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

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

      {/* Wallet Info */}
      {walletAddress ? (
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
            icon={<History size={40} />}
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
