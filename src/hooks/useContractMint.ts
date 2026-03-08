import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  ACTIVE_CHAIN,
  NFT_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  NFT_ABI,
  ERC20_ABI,
} from '../lib/contracts';
import { subscriptionApi } from '../api/subscription';
import { useSubscriptionStore } from '../stores/subscriptionStore';

export type MintTxState =
  | 'idle'
  | 'switching-chain'
  | 'approving'
  | 'signing'
  | 'pending'
  | 'confirming'
  | 'verifying'
  | 'success'
  | 'error';

export function useContractMint() {
  const [txState, setTxState] = useState<MintTxState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);

  const reset = useCallback(() => {
    setTxState('idle');
    setError(null);
    setTxHash(null);
  }, []);

  const ensureCorrectChain = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== ACTIVE_CHAIN.chainId) {
      setTxState('switching-chain');
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ACTIVE_CHAIN.chainIdHex }],
        });
      } catch (switchError: unknown) {
        // Chain not added — try to add it
        if ((switchError as { code?: number })?.code === 4902) {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ACTIVE_CHAIN.chainIdHex,
              chainName: ACTIVE_CHAIN.name,
              rpcUrls: [ACTIVE_CHAIN.rpcUrl],
              blockExplorerUrls: [ACTIVE_CHAIN.blockExplorer],
              nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  };

  const mintWithAVAX = useCallback(async (tier: number, durationMonths: number) => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask.');
      setTxState('error');
      return;
    }

    reset();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await ensureCorrectChain(provider);

      // Re-create provider after potential chain switch
      const freshProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await freshProvider.getSigner();

      const nftAddress = NFT_CONTRACT_ADDRESS[ACTIVE_CHAIN.chainId];
      if (!nftAddress) {
        throw new Error('NFT contract not deployed on this chain');
      }

      const nftContract = new ethers.Contract(nftAddress, NFT_ABI, signer);

      // Get on-chain price
      setTxState('signing');
      const price: bigint = await nftContract.getPrice(tier, durationMonths);

      // Call publicMint with AVAX value
      const tx = await nftContract.publicMint(tier, durationMonths, { value: price });
      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed on-chain');
      }

      // Verify with backend
      setTxState('verifying');
      const chainName = ACTIVE_CHAIN.chainId === 43113 ? 'avalancheFuji' : 'avalanche';
      await subscriptionApi.verifyNFTPurchase(tx.hash, chainName);
      await fetchStatus();

      setTxState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      // User rejected
      if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
        setError('Transaction cancelled');
      } else {
        setError(msg);
      }
      setTxState('error');
    }
  }, [reset, fetchStatus]);

  const mintWithUSDT = useCallback(async (tier: number, durationMonths: number) => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask.');
      setTxState('error');
      return;
    }

    reset();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await ensureCorrectChain(provider);

      const freshProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await freshProvider.getSigner();
      const userAddress = await signer.getAddress();

      const nftAddress = NFT_CONTRACT_ADDRESS[ACTIVE_CHAIN.chainId];
      const usdtAddress = USDT_CONTRACT_ADDRESS[ACTIVE_CHAIN.chainId];
      if (!nftAddress || !usdtAddress) {
        throw new Error('Contracts not deployed on this chain');
      }

      const nftContract = new ethers.Contract(nftAddress, NFT_ABI, signer);
      const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, signer);

      // Get USDT price from contract (6 decimals)
      setTxState('signing');
      const usdtPrice: bigint = await nftContract.getUSDPrice(tier, durationMonths);

      // Check current allowance
      const currentAllowance: bigint = await usdtContract.allowance(userAddress, nftAddress);

      if (currentAllowance < usdtPrice) {
        // Need approval first
        setTxState('approving');
        const approveTx = await usdtContract.approve(nftAddress, usdtPrice);
        await approveTx.wait();
      }

      // Call publicMintWithUSDT
      setTxState('signing');
      const tx = await nftContract.publicMintWithUSDT(tier, durationMonths);
      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed on-chain');
      }

      // Verify with backend
      setTxState('verifying');
      const chainName = ACTIVE_CHAIN.chainId === 43113 ? 'avalancheFuji' : 'avalanche';
      await subscriptionApi.verifyNFTPurchase(tx.hash, chainName);
      await fetchStatus();

      setTxState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
        setError('Transaction cancelled');
      } else {
        setError(msg);
      }
      setTxState('error');
    }
  }, [reset, fetchStatus]);

  return { txState, error, txHash, mintWithAVAX, mintWithUSDT, reset };
}
