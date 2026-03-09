import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Copy, Check, ExternalLink, Loader2, History, Coins, AlertTriangle, Info, Key, Eye, EyeOff, Lock } from 'lucide-react';
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSecrets, setExportSecrets] = useState<{ address?: string; privateKey?: string; mnemonic?: string; chain?: string; warning?: string } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

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

  const handleExportWallet = async () => {
    if (!exportPassword.trim()) return;
    setExportLoading(true);
    setExportError('');
    try {
      const { data } = await usersApi.exportWallet(exportPassword);
      if (data.success && data.data) {
        setExportSecrets(data.data);
      } else {
        setExportError((data as unknown as Record<string, string>).error || 'Failed to export wallet');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      setExportError(axiosErr.response?.status === 401 ? 'Incorrect password' : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const copySecret = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
    setExportPassword('');
    setExportError('');
    setExportSecrets(null);
    setShowPrivateKey(false);
    setShowMnemonic(false);
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
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-warning/30 text-warning text-sm font-medium hover:bg-warning/5"
              >
                <Key size={16} /> Export Private Key
              </button>

              {showExportModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeExportModal}>
                  <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle size={24} />
                      <h3 className="font-bold text-lg">Export Private Key</h3>
                    </div>

                    {!exportSecrets ? (
                      <>
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-sm text-red-600">
                            Your private key and recovery phrase give full access to your wallet and funds. Never share them with anyone.
                          </p>
                        </div>
                        <p className="text-sm text-text-secondary text-center">
                          Enter your password to export your wallet secrets.
                        </p>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                          <input
                            type="password"
                            value={exportPassword}
                            onChange={(e) => { setExportPassword(e.target.value); setExportError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleExportWallet()}
                            placeholder="Password"
                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        {exportError && <p className="text-sm text-error">{exportError}</p>}
                        <button
                          onClick={handleExportWallet}
                          disabled={!exportPassword.trim() || exportLoading}
                          className="w-full py-3 rounded-xl bg-warning text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                          {exportLoading ? 'Exporting...' : 'Export Wallet'}
                        </button>
                        <button onClick={closeExportModal} className="w-full py-2 text-sm text-muted hover:text-text-primary">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Address */}
                        {exportSecrets.address && (
                          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-secondary">Wallet Address</span>
                              <button onClick={() => copySecret(exportSecrets.address!, 'Address')} className="p-1 hover:bg-gray-200 rounded">
                                <Copy size={14} className="text-primary-deep" />
                              </button>
                            </div>
                            <code className="text-xs break-all text-text-primary block">{exportSecrets.address}</code>
                          </div>
                        )}

                        {/* Private Key */}
                        {exportSecrets.privateKey && (
                          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-secondary">Private Key</span>
                              <div className="flex gap-1">
                                <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="p-1 hover:bg-gray-200 rounded">
                                  {showPrivateKey ? <EyeOff size={14} className="text-primary-deep" /> : <Eye size={14} className="text-primary-deep" />}
                                </button>
                                <button onClick={() => copySecret(exportSecrets.privateKey!, 'Private key')} className="p-1 hover:bg-gray-200 rounded">
                                  <Copy size={14} className="text-primary-deep" />
                                </button>
                              </div>
                            </div>
                            <code className="text-xs break-all text-text-primary block font-mono">
                              {showPrivateKey ? exportSecrets.privateKey : '*'.repeat(64)}
                            </code>
                          </div>
                        )}

                        {/* Mnemonic */}
                        {exportSecrets.mnemonic && (
                          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-secondary">Recovery Phrase</span>
                              <div className="flex gap-1">
                                <button onClick={() => setShowMnemonic(!showMnemonic)} className="p-1 hover:bg-gray-200 rounded">
                                  {showMnemonic ? <EyeOff size={14} className="text-primary-deep" /> : <Eye size={14} className="text-primary-deep" />}
                                </button>
                                <button onClick={() => copySecret(exportSecrets.mnemonic!, 'Recovery phrase')} className="p-1 hover:bg-gray-200 rounded">
                                  <Copy size={14} className="text-primary-deep" />
                                </button>
                              </div>
                            </div>
                            {showMnemonic ? (
                              <div className="grid grid-cols-3 gap-2">
                                {exportSecrets.mnemonic.split(' ').map((word, i) => (
                                  <div key={i} className="bg-white rounded-lg px-2 py-1 text-xs">
                                    <span className="text-muted">{i + 1}.</span> <span className="font-medium">{word}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg px-3 py-2 text-xs text-center text-muted">
                                * * * * * * * * * * * *
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chain */}
                        {exportSecrets.chain && (
                          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                            <span className="text-xs text-text-secondary">Network:</span>
                            <span className="text-xs font-medium text-text-primary">{exportSecrets.chain}</span>
                          </div>
                        )}

                        {/* Warning */}
                        <div className="bg-red-50 rounded-xl p-3 flex items-start gap-2">
                          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-600">
                            {exportSecrets.warning || 'Never share your private key or mnemonic with anyone.'}
                          </p>
                        </div>

                        <button onClick={closeExportModal} className="w-full py-3 rounded-xl bg-gray-100 text-text-primary font-medium text-sm">
                          Done
                        </button>
                      </>
                    )}
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
