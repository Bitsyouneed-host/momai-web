// Contract addresses and ABIs for client-side interaction

export const CHAINS = {
  avalancheFuji: {
    chainId: 43113,
    chainIdHex: '0xa869',
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorer: 'https://testnet.snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
  avalanche: {
    chainId: 43114,
    chainIdHex: '0xa86a',
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
} as const;

// Default to testnet for now
export const ACTIVE_CHAIN = CHAINS.avalancheFuji;

// Contract addresses
export const NFT_CONTRACT_ADDRESS: Record<number, string> = {
  43113: '0xC8c03CC98c748C088647065C4ecf86655E2Ad5c7', // Fuji
  43114: '', // Mainnet (not deployed yet)
};

export const USDT_CONTRACT_ADDRESS: Record<number, string> = {
  43113: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
};

// Tier constants matching the contract
export const TIER_PRO = 1;
export const TIER_PRO_PLUS = 2;

// ABI fragments for the NFT Season Pass contract
export const NFT_ABI = [
  'function publicMint(uint8 tier, uint8 durationMonths) external payable returns (uint256)',
  'function publicMintWithUSDT(uint8 tier, uint8 durationMonths) external returns (uint256)',
  'function getPrice(uint8 tier, uint8 durationMonths) external view returns (uint256)',
  'function getUSDPrice(uint8 tier, uint8 durationMonths) public view returns (uint256)',
  'function hasValidPass(address owner) external view returns (bool)',
  'function getValidPassForOwner(address owner) external view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

// ABI fragments for ERC20 (USDT) interactions
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];
