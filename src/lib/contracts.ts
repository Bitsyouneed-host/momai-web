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
  43113: '0x88a5036f9DCd85bcAC8564CB2Ef4781F8Bb14595', // Fuji
  43114: '', // Mainnet (not deployed yet)
};

export const USDT_CONTRACT_ADDRESS: Record<number, string> = {
  43113: '0xb64808c1Aaf5374794aE91C7C6331f48367fec32', // MockUSDT (USDT.BMW) for testing
  43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
};

export const MOMAI_TOKEN_ADDRESS: Record<number, string> = {
  43113: '0x9b1341ce9a841318C9e111aFB73F94ef62Efd783', // Fuji
  43114: '', // Mainnet (not deployed yet)
};

export const ESCROW_CONTRACT_ADDRESS: Record<number, string> = {
  43113: '0x0ff2E031c64731eb94828CFf6F9ecB6d8E901187', // Fuji
  43114: '', // Mainnet (not deployed yet)
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
  'function isValid(uint256 tokenId) public view returns (bool)',
  'function daysRemaining(uint256 tokenId) public view returns (uint256)',
  'function getPassInfo(uint256 tokenId) external view returns (uint8 tier, uint32 callsPerMonth, uint64 startDate, uint64 expiresAt, string purchaseChain, bool valid)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

// ABI fragments for ERC20 (USDT) interactions
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];
