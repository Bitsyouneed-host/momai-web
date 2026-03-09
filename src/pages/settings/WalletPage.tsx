import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Copy, Check, ExternalLink, Loader2, History, Coins, AlertTriangle, Info, Key, Eye, EyeOff, Mail, Send } from 'lucide-react';
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
  const [exportStep, setExportStep] = useState<'warning' | 'code' | 'secrets'>('warning');
  const [exportCode, setExportCode] = useState('');
  const [exportMaskedEmail, setExportMaskedEmail] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSecrets, setExportSecrets] = useState<{ address?: string; privateKey?: string; mnemonic?: string; chain?: string; warning?: string } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Send funds state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState<'details' | 'code' | 'success'>('details');
  const [sendToken, setSendToken] = useState<'avax' | 'usdt' | 'momai' | 'nft'>('avax');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCode, setSendCode] = useState('');
  const [sendMaskedEmail, setSendMaskedEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendTxHash, setSendTxHash] = useState('');
  const [sendExplorerUrl, setSendExplorerUrl] = useState('');
  const [seasonPassTokenId, setSeasonPassTokenId] = useState<string | null>(null);

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
          if (walletData.seasonPass) {
            const sp = walletData.seasonPass as { tokenId?: string };
            setSeasonPassTokenId(sp.tokenId || null);
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

  const handleExportSendCode = async () => {
    setExportLoading(true);
    setExportError('');
    try {
      const { data } = await usersApi.exportWalletSendCode();
      if (data.success && data.data) {
        setExportMaskedEmail((data.data as unknown as Record<string, string>).email || '');
        setExportStep('code');
      } else {
        setExportError((data as unknown as Record<string, string>).message || 'Failed to send code');
      }
    } catch {
      setExportError('Failed to send verification code');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportVerifyCode = async () => {
    if (exportCode.length !== 6) return;
    setExportLoading(true);
    setExportError('');
    try {
      const { data } = await usersApi.exportWalletVerifyCode(exportCode);
      if (data.success && data.data) {
        setExportSecrets(data.data);
        setExportStep('secrets');
      } else {
        setExportError((data as unknown as Record<string, string>).message || 'Verification failed');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { message?: string } } };
      setExportError(axiosErr.response?.data?.message || (axiosErr.response?.status === 401 ? 'Incorrect code' : 'Verification failed'));
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
    setExportStep('warning');
    setExportCode('');
    setExportMaskedEmail('');
    setExportError('');
    setExportSecrets(null);
    setShowPrivateKey(false);
    setShowMnemonic(false);
  };

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const TOKEN_OPTIONS = [
    { type: 'avax' as const, label: 'AVAX' },
    { type: 'usdt' as const, label: 'USDT' },
    { type: 'momai' as const, label: 'MOMAI' },
    { type: 'nft' as const, label: 'Season Pass' },
  ];

  const getSendBalance = (type: string) => {
    switch (type) {
      case 'avax': return avaxBalance ? `${parseFloat(avaxBalance).toFixed(4)} AVAX` : '...';
      case 'usdt': return usdtBalance ? `${parseFloat(usdtBalance).toFixed(2)} USDT` : '...';
      case 'momai': return `${tokenBalance} MOMAI`;
      case 'nft': return seasonPassTokenId ? `Token #${seasonPassTokenId}` : 'None';
      default: return '0';
    }
  };

  const handleSendCode = async () => {
    if (!isValidAddress(sendTo)) { setSendError('Invalid wallet address'); return; }
    if (sendToken !== 'nft' && (!sendAmount || parseFloat(sendAmount) <= 0)) { setSendError('Enter a valid amount'); return; }
    if (sendToken === 'nft' && !seasonPassTokenId) { setSendError('No season pass found'); return; }
    setSendLoading(true);
    setSendError('');
    try {
      const amt = sendToken === 'nft' ? (seasonPassTokenId || '0') : sendAmount;
      const { data } = await usersApi.sendFundsSendCode({ tokenType: sendToken, amount: amt, to: sendTo });
      if (data.success && data.data) {
        setSendMaskedEmail((data.data as unknown as Record<string, string>).email || '');
        setSendStep('code');
      } else {
        setSendError((data as unknown as Record<string, string>).message || 'Failed to send code');
      }
    } catch {
      setSendError('Failed to send verification code');
    } finally {
      setSendLoading(false);
    }
  };

  const handleSendConfirm = async () => {
    if (sendCode.length !== 6) return;
    setSendLoading(true);
    setSendError('');
    try {
      const amt = sendToken === 'nft' ? (seasonPassTokenId || '0') : sendAmount;
      const nftTokenId = sendToken === 'nft' ? parseInt(seasonPassTokenId || '0') : undefined;
      const { data } = await usersApi.sendFundsConfirm({ code: sendCode, to: sendTo, tokenType: sendToken, amount: amt, tokenId: nftTokenId });
      if (data.success && data.data) {
        setSendTxHash(data.data.txHash);
        setSendExplorerUrl(data.data.explorer);
        setSendStep('success');
      } else {
        setSendError((data as unknown as Record<string, string>).message || 'Transfer failed');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || '';
      setSendError(msg.includes('insufficient') ? 'Insufficient funds' : (axiosErr.response?.status === 401 ? 'Incorrect code' : 'Transfer failed'));
    } finally {
      setSendLoading(false);
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendStep('details');
    setSendToken('avax');
    setSendTo('');
    setSendAmount('');
    setSendCode('');
    setSendMaskedEmail('');
    setSendError('');
    setSendTxHash('');
    setSendExplorerUrl('');
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

          {/* Send Funds */}
          <button
            onClick={() => setShowSendModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark"
          >
            <Send size={16} /> Send Funds
          </button>

          {showSendModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeSendModal}>
              <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 text-primary-deep">
                  <Send size={24} />
                  <h3 className="font-bold text-lg">Send Funds</h3>
                </div>

                {sendStep === 'details' ? (
                  <>
                    <div className="bg-orange-50 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                      <p className="text-xs text-warning">Blockchain transfers are irreversible. Double-check the address and amount.</p>
                    </div>

                    {/* Token selector */}
                    <div>
                      <label className="text-xs font-semibold text-text-secondary block mb-2">Select Token</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TOKEN_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => { setSendToken(opt.type); setSendError(''); }}
                            className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                              sendToken === opt.type
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Wallet size={14} className="text-primary-deep" />
                      <span className="text-xs text-text-secondary">Balance:</span>
                      <span className="text-xs font-bold text-text-primary">{getSendBalance(sendToken)}</span>
                    </div>

                    {/* Recipient */}
                    <input
                      type="text"
                      value={sendTo}
                      onChange={(e) => { setSendTo(e.target.value.trim()); setSendError(''); }}
                      placeholder="Recipient address (0x...)"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />

                    {/* Amount (hidden for NFT) */}
                    {sendToken !== 'nft' ? (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={sendAmount}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '' || /^\d*\.?\d*$/.test(v)) { setSendAmount(v); setSendError(''); }
                        }}
                        placeholder={`Amount (${TOKEN_OPTIONS.find((o) => o.type === sendToken)?.label})`}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                    ) : seasonPassTokenId ? (
                      <div className="bg-gray-50 rounded-xl p-3 text-xs">
                        <span className="text-text-secondary">Sending:</span>{' '}
                        <span className="font-bold">Season Pass #{seasonPassTokenId}</span>
                      </div>
                    ) : null}

                    {sendError && <p className="text-sm text-error">{sendError}</p>}

                    <button
                      onClick={handleSendCode}
                      disabled={sendLoading || !sendTo || (sendToken !== 'nft' && !sendAmount)}
                      className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                      {sendLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                    <button onClick={closeSendModal} className="w-full py-2 text-sm text-muted hover:text-text-primary">Cancel</button>
                  </>
                ) : sendStep === 'code' ? (
                  <>
                    <p className="text-sm text-text-secondary text-center">
                      Enter the 6-digit code sent to <span className="font-medium">{sendMaskedEmail}</span>
                    </p>

                    {/* Transfer summary */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Sending</span>
                        <span className="font-bold">
                          {sendToken === 'nft' ? `Season Pass #${seasonPassTokenId}` : `${sendAmount} ${TOKEN_OPTIONS.find((o) => o.type === sendToken)?.label}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">To</span>
                        <span className="font-bold font-mono">{sendTo.slice(0, 8)}...{sendTo.slice(-6)}</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={sendCode}
                      onChange={(e) => { setSendCode(e.target.value.replace(/\D/g, '')); setSendError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendConfirm()}
                      placeholder="000000"
                      className="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl border border-gray-200 font-mono focus:outline-none focus:border-primary"
                    />
                    {sendError && <p className="text-sm text-error">{sendError}</p>}
                    <button
                      onClick={handleSendConfirm}
                      disabled={sendCode.length !== 6 || sendLoading}
                      className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {sendLoading ? 'Sending...' : 'Confirm & Send'}
                    </button>
                    <button onClick={handleSendCode} disabled={sendLoading} className="w-full py-2 text-sm text-muted hover:text-text-primary">Resend Code</button>
                    <button onClick={closeSendModal} className="w-full py-2 text-sm text-muted hover:text-text-primary">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                        <Check size={32} className="text-success" />
                      </div>
                      <h4 className="text-lg font-bold text-text-primary">Transfer Sent!</h4>
                      <p className="text-sm text-text-secondary">Your transaction has been submitted to the blockchain.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Transaction Hash</span>
                        <button onClick={() => copySecret(sendTxHash, 'Hash')} className="p-1 hover:bg-gray-200 rounded">
                          <Copy size={14} className="text-primary-deep" />
                        </button>
                      </div>
                      <code className="text-xs break-all text-text-primary block font-mono">
                        {sendTxHash.slice(0, 12)}...{sendTxHash.slice(-8)}
                      </code>
                    </div>

                    {sendExplorerUrl && (
                      <a
                        href={sendExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-primary-deep hover:bg-gray-50"
                      >
                        <ExternalLink size={16} /> View on Snowtrace
                      </a>
                    )}

                    <button onClick={closeSendModal} className="w-full py-3 rounded-xl bg-gray-100 text-text-primary font-medium text-sm">Done</button>
                  </>
                )}
              </div>
            </div>
          )}

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

                    {exportStep === 'warning' ? (
                      <>
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-sm text-red-600">
                            Your private key and recovery phrase give full access to your wallet and funds. Never share them with anyone.
                          </p>
                        </div>
                        <p className="text-sm text-text-secondary text-center">
                          We&apos;ll send a verification code to your email to confirm your identity.
                        </p>
                        {exportError && <p className="text-sm text-error">{exportError}</p>}
                        <button
                          onClick={handleExportSendCode}
                          disabled={exportLoading}
                          className="w-full py-3 rounded-xl bg-warning text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                          {exportLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                        <button onClick={closeExportModal} className="w-full py-2 text-sm text-muted hover:text-text-primary">
                          Cancel
                        </button>
                      </>
                    ) : exportStep === 'code' ? (
                      <>
                        <p className="text-sm text-text-secondary text-center">
                          Enter the 6-digit code sent to <span className="font-medium">{exportMaskedEmail}</span>
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={exportCode}
                          onChange={(e) => { setExportCode(e.target.value.replace(/\D/g, '')); setExportError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleExportVerifyCode()}
                          placeholder="000000"
                          className="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl border border-gray-200 font-mono focus:outline-none focus:border-primary"
                        />
                        {exportError && <p className="text-sm text-error">{exportError}</p>}
                        <button
                          onClick={handleExportVerifyCode}
                          disabled={exportCode.length !== 6 || exportLoading}
                          className="w-full py-3 rounded-xl bg-warning text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                          {exportLoading ? 'Verifying...' : 'Verify & Export'}
                        </button>
                        <button
                          onClick={handleExportSendCode}
                          disabled={exportLoading}
                          className="w-full py-2 text-sm text-muted hover:text-text-primary"
                        >
                          Resend Code
                        </button>
                        <button onClick={closeExportModal} className="w-full py-2 text-sm text-muted hover:text-text-primary">
                          Cancel
                        </button>
                      </>
                    ) : exportSecrets ? (
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
                    ) : null}
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
