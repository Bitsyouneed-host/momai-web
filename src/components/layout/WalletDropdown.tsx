import { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function WalletDropdown() {
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const walletAddress = user?.walletAddress || user?.generatedWallet?.address;

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow"
      >
        <Wallet size={14} className="text-primary-deep" />
        {walletAddress ? (
          <span className="text-[10px] font-mono text-text-secondary">
            {formatAddress(walletAddress)}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-muted">No Wallet</span>
        )}
      </button>

      {isOpen && walletAddress && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
            <p className="text-xs text-text-secondary mb-2">Wallet Address</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="text-xs bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                {walletAddress}
              </code>
              <button onClick={copyAddress} className="p-1 hover:bg-gray-100 rounded">
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
              </button>
            </div>
            <a
              href={`https://testnet.snowtrace.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-deep hover:underline"
            >
              <ExternalLink size={12} />
              View on Explorer
            </a>
          </div>
        </>
      )}
    </div>
  );
}
