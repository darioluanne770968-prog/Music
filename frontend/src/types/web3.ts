// Web3 区块链深度集成类型定义

// 去中心化音乐平台
export interface DecentralizedMusicPlatform {
  id: string;
  name: string;
  blockchain: BlockchainNetwork;
  smartContracts: SmartContract[];
  daoEnabled: boolean;
  tokenomics: Tokenomics;
  governance: DAOGovernance;
  features: Web3Feature[];
}

export type BlockchainNetwork =
  | 'ethereum'
  | 'polygon'
  | 'solana'
  | 'avalanche'
  | 'arbitrum'
  | 'optimism'
  | 'base';

export interface SmartContract {
  id: string;
  name: string;
  type: 'royalty' | 'nft' | 'dao' | 'staking' | 'marketplace' | 'license';
  address: string;
  network: BlockchainNetwork;
  abi: string;
  verified: boolean;
  deployedAt: Date;
}

// 代币经济学
export interface Tokenomics {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  circulatingSupply: number;
  currentPrice: number;
  marketCap: number;
  distribution: TokenDistribution;
  utilities: TokenUtility[];
  vestingSchedule: VestingSchedule[];
}

export interface TokenDistribution {
  community: number; // 百分比
  team: number;
  investors: number;
  treasury: number;
  staking: number;
  liquidity: number;
  marketing: number;
}

export interface TokenUtility {
  type: 'governance' | 'staking' | 'payment' | 'access' | 'rewards' | 'nft_minting';
  description: string;
  multiplier?: number;
}

export interface VestingSchedule {
  recipient: string;
  amount: number;
  startDate: Date;
  cliffMonths: number;
  vestingMonths: number;
  released: number;
}

// DAO治理
export interface DAOGovernance {
  id: string;
  name: string;
  treasury: number;
  members: number;
  proposals: DAOProposal[];
  votingRules: VotingRules;
  councils: DAOCouncil[];
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  category: ProposalCategory;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startTime: Date;
  endTime: Date;
  executionTime?: Date;
  transactions: ProposalTransaction[];
}

export type ProposalCategory =
  | 'treasury'
  | 'governance'
  | 'feature'
  | 'partnership'
  | 'artist_grant'
  | 'community'
  | 'technical';

export type ProposalStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'passed'
  | 'rejected'
  | 'executed'
  | 'cancelled';

export interface ProposalTransaction {
  target: string;
  value: number;
  calldata: string;
  description: string;
}

export interface VotingRules {
  minVotingPower: number;
  quorumPercentage: number;
  passingThreshold: number;
  votingPeriod: number; // 天
  executionDelay: number; // 天
  delegationEnabled: boolean;
}

export interface DAOCouncil {
  id: string;
  name: string;
  role: 'artist' | 'community' | 'technical' | 'treasury';
  members: DAOMember[];
  powers: string[];
}

export interface DAOMember {
  address: string;
  name?: string;
  avatar?: string;
  votingPower: number;
  delegatedPower: number;
  joinedAt: Date;
  proposalsCreated: number;
  votesParticipated: number;
}

// NFT碎片化
export interface FractionalNFT {
  id: string;
  originalNFTId: string;
  contractAddress: string;
  tokenSymbol: string;
  totalFractions: number;
  availableFractions: number;
  pricePerFraction: number;
  originalValue: number;
  holders: FractionHolder[];
  tradingEnabled: boolean;
  buyoutPrice: number;
  buyoutThreshold: number;
  royaltyDistribution: RoyaltyDistribution;
  metadata: FractionalNFTMetadata;
}

export interface FractionHolder {
  address: string;
  fractions: number;
  percentage: number;
  acquiredAt: Date;
  averagePrice: number;
}

export interface RoyaltyDistribution {
  artistPercentage: number;
  platformPercentage: number;
  holderPercentage: number;
  distributionFrequency: 'daily' | 'weekly' | 'monthly';
  totalDistributed: number;
  lastDistribution: Date;
}

export interface FractionalNFTMetadata {
  name: string;
  description: string;
  image: string;
  audio: string;
  artist: string;
  album?: string;
  releaseDate: Date;
  edition: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'date' | 'boost_percentage';
}

// 代币激励系统
export interface TokenIncentive {
  id: string;
  type: IncentiveType;
  name: string;
  description: string;
  rewardAmount: number;
  rewardToken: string;
  requirements: IncentiveRequirement[];
  maxRedemptions: number;
  currentRedemptions: number;
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

export type IncentiveType =
  | 'listen'
  | 'share'
  | 'create'
  | 'curate'
  | 'stake'
  | 'refer'
  | 'participate'
  | 'feedback'
  | 'milestone';

export interface IncentiveRequirement {
  type: 'action' | 'threshold' | 'time' | 'streak';
  target: string;
  value: number;
  completed: boolean;
}

// 智能合约版税
export interface SmartContractRoyalty {
  id: string;
  songId: string;
  contractAddress: string;
  network: BlockchainNetwork;
  stakeholders: RoyaltyStakeholder[];
  automaticDistribution: boolean;
  minimumPayout: number;
  payoutCurrency: string;
  totalEarned: number;
  pendingPayout: number;
  history: RoyaltyPayment[];
}

export interface RoyaltyStakeholder {
  address: string;
  name: string;
  role: 'artist' | 'producer' | 'songwriter' | 'label' | 'publisher';
  percentage: number;
  verified: boolean;
}

export interface RoyaltyPayment {
  id: string;
  amount: number;
  currency: string;
  txHash: string;
  timestamp: Date;
  recipients: PaymentRecipient[];
}

export interface PaymentRecipient {
  address: string;
  amount: number;
  role: string;
}

// 钱包集成
export interface Web3Wallet {
  address: string;
  provider: WalletProvider;
  chainId: number;
  network: BlockchainNetwork;
  balance: WalletBalance;
  nfts: OwnedNFT[];
  tokens: TokenBalance[];
  transactions: WalletTransaction[];
  connectedAt: Date;
}

export type WalletProvider =
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'phantom'
  | 'rainbow'
  | 'trust';

export interface WalletBalance {
  native: number;
  usd: number;
  symbol: string;
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  usdValue: number;
  logo?: string;
}

export interface OwnedNFT {
  id: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string;
  audio?: string;
  collection: string;
  rarity?: string;
  floorPrice?: number;
  lastSalePrice?: number;
}

export interface WalletTransaction {
  hash: string;
  type: 'send' | 'receive' | 'mint' | 'swap' | 'stake' | 'claim';
  from: string;
  to: string;
  value: number;
  token?: string;
  gasUsed: number;
  gasFee: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockNumber: number;
}

// 音乐NFT市场
export interface NFTMarketplace {
  id: string;
  listings: NFTListing[];
  auctions: NFTAuction[];
  collections: NFTCollection[];
  volume24h: number;
  volumeTotal: number;
  floorPrice: number;
  uniqueHolders: number;
}

export interface NFTListing {
  id: string;
  nftId: string;
  seller: string;
  price: number;
  currency: string;
  listedAt: Date;
  expiresAt?: Date;
  offers: NFTOffer[];
}

export interface NFTOffer {
  id: string;
  buyer: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface NFTAuction {
  id: string;
  nftId: string;
  seller: string;
  startPrice: number;
  reservePrice: number;
  currentBid: number;
  highestBidder?: string;
  bids: AuctionBid[];
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
}

export interface AuctionBid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  txHash: string;
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  artistId: string;
  contractAddress: string;
  coverImage: string;
  totalItems: number;
  uniqueOwners: number;
  floorPrice: number;
  volumeTraded: number;
  royaltyPercentage: number;
  verified: boolean;
}

// 音乐许可证NFT
export interface MusicLicenseNFT {
  id: string;
  songId: string;
  licenseType: LicenseType;
  terms: LicenseTerms;
  price: number;
  maxMints: number;
  minted: number;
  holders: string[];
  contractAddress: string;
  metadata: LicenseMetadata;
}

export type LicenseType =
  | 'personal'
  | 'commercial'
  | 'sync'
  | 'remix'
  | 'exclusive'
  | 'sample';

export interface LicenseTerms {
  duration: 'perpetual' | 'limited';
  durationDays?: number;
  territory: 'worldwide' | 'regional';
  regions?: string[];
  usage: string[];
  restrictions: string[];
  attribution: boolean;
  transferable: boolean;
  sublicensable: boolean;
}

export interface LicenseMetadata {
  songName: string;
  artistName: string;
  isrc?: string;
  bpm?: number;
  key?: string;
  genre: string;
  releasedAt: Date;
}

// 质押系统
export interface StakingPool {
  id: string;
  name: string;
  token: string;
  rewardToken: string;
  apy: number;
  totalStaked: number;
  totalRewards: number;
  minStake: number;
  lockPeriod: number; // 天
  status: 'active' | 'paused' | 'ended';
  userStakes: UserStake[];
}

export interface UserStake {
  userId: string;
  amount: number;
  rewards: number;
  stakedAt: Date;
  unlocksAt: Date;
  autoCompound: boolean;
}

export type Web3Feature =
  | 'nft_minting'
  | 'fractional_ownership'
  | 'dao_governance'
  | 'token_rewards'
  | 'staking'
  | 'royalty_streaming'
  | 'license_nfts'
  | 'social_tokens'
  | 'metaverse_integration';
