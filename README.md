# MOM AI - Web App

The browser-based client for **MOM AI** — an AI-powered appointment booking platform with Web3 integration. Users describe what they need, and AI calls or texts businesses to book appointments on their behalf. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** + TypeScript 5.9 | UI framework |
| **Vite 7** | Build tool with HMR |
| **Tailwind CSS 4** | Styling |
| **Zustand 5** | State management |
| **Axios** | HTTP client with JWT refresh interceptor |
| **ethers.js 6** | On-chain interactions (NFT minting, escrow approval, balances) |
| **React Router 7** | Client-side routing |
| **react-hot-toast** | Toast notifications |
| **Lucide React** | Icons |

## Getting Started

```bash
git clone https://github.com/Bitsyouneed-host/momai-web.git
cd momai-web
npm install
cp .env.example .env    # Edit with your values
npm run dev             # http://localhost:5173
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://backend-production-5aa0.up.railway.app/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (for provider search) | _(empty)_ |

## Features

### Authentication
- **Email Login** — Passwordless 6-digit OTP code sent to email, auto-account creation, profile completion flow
- **Wallet Login** — Core app / WalletConnect browser extension connection, auto wallet generation on backend
- **Connect Email** — Wallet-only users can link their email post-signup and receive 29 USDT + 10 MOMAI + gas bonus

### AI Booking
- **MOM ME!** — Describe what you need, search providers by zip code via Google Places, select one, and the AI calls or texts to book for you
- **Manual AI Booking** — Enter a provider's phone number directly, the AI handles the rest
- **Auto Escrow Approval** — Automatically approves the escrow smart contract for email users (no manual on-chain interaction needed). External wallet users approve via Core app popup
- **Booking Status** — Real-time tracking: pending → calling → in-progress → success / failed / voicemail / no-answer
- **Transcripts** — View full AI conversation transcripts and booking outcomes

### Appointments
- Full CRUD with recurring support (daily, weekly, monthly)
- Calendar view with date navigation
- Invitees and reminders
- Filter by status

### Wallet & Web3
- **Balances** — View AVAX, USDT, MOMAI token balances in real-time
- **Send Funds** — Transfer AVAX, USDT, MOMAI tokens, or Season Pass NFTs to any wallet (OTP email verification required)
- **Export Private Key** — OTP-protected key export for backend-managed wallets. Import into Core app or any EVM-compatible wallet
- **NFT Season Pass** — View active pass status, tier, calls remaining, days until expiration
- **Token History** — Track all MOMAI token spends, refunds, and escrow events

### Subscription
- Free / Pro / Pro+ plan tiers
- Pay with AVAX (Chainlink oracle pricing) or USDT (stablecoin)
- On-chain NFT Season Pass minting (direct from Core app or backend-managed for email users)
- Real-time contract pricing displayed before purchase

### Providers
- Browse and manage favorite providers
- Search by keyword, category, location
- Google Places integration for discovering new providers

### Settings
- Profile management (name, phone, DOB, address, emergency contact)
- Insurance information
- Privacy policy, terms of service, contact support

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Email/wallet auth with OTP |
| `/` | HomePage | Dashboard, subscription status, NFT pass, quick actions |
| `/connect-email` | ConnectEmailPage | Email verification for wallet users (bonus rewards) |
| `/mom-me` | MomMePage | AI-powered provider search & auto-book |
| `/booking/new` | NewBookingPage | Manual AI booking creation |
| `/booking` | BookingPage | Booking request list |
| `/booking/pending` | PendingBookingsPage | Pending bookings view |
| `/booking/:id` | BookingDetailPage | Booking details + transcript |
| `/appointments` | AppointmentsPage | Appointment list |
| `/appointments/new` | NewAppointmentPage | Create manual appointment |
| `/appointments/:id` | AppointmentDetailPage | Appointment details |
| `/calendar` | CalendarPage | Calendar view |
| `/search` | SearchPage | Provider search |
| `/providers` | ProvidersPage | Provider directory |
| `/settings` | SettingsPage | Settings hub |
| `/settings/profile` | ProfilePage | Edit profile + insurance |
| `/settings/wallet` | WalletPage | Wallet, balances, send funds, export key |
| `/settings/paywall` | PaywallPage | Subscription upgrade + NFT minting |
| `/settings/insurance` | InsurancePage | Insurance details |
| `/notifications` | NotificationsPage | Notification center |

## Project Structure

```
src/
├── api/                        # API modules (Axios)
│   ├── auth.ts                 # Login, OTP, wallet auth, trial verification
│   ├── users.ts                # Profile, wallet info, send funds, export key
│   ├── booking.ts              # AI booking requests
│   ├── appointments.ts         # Appointment CRUD
│   ├── subscription.ts         # Subscription status, NFT mint verification
│   ├── providers.ts            # Provider CRUD
│   ├── categories.ts           # Service categories
│   ├── search.ts               # Google Places search
│   ├── tokens.ts               # Token spend history
│   └── client.ts               # Axios instance with JWT interceptor
├── components/
│   ├── layout/                 # AppShell, TabBar, WalletDropdown, NotificationButton
│   ├── shared/                 # ProtectedRoute, GradientBackground
│   └── ui/                     # GlassCard, StyledInput, PrimaryButton, Modal, StatusBadge
├── hooks/
│   └── useContractMint.ts      # NFT minting hook (Core app + backend)
├── lib/
│   └── contracts.ts            # Chain config, contract addresses, ABIs
├── pages/                      # 23+ page components (grouped by feature)
├── stores/
│   ├── authStore.ts            # User auth state (login, logout, fetchUser)
│   └── subscriptionStore.ts    # Subscription, token balance, AVAX price
├── types/                      # TypeScript interfaces
├── App.tsx                     # Router configuration
└── main.tsx                    # Entry point
```

## Blockchain Integration

The web app interacts with smart contracts on Avalanche for token payments, escrow, and NFT subscriptions.

| Config | Value |
|--------|-------|
| **Network** | Avalanche Fuji Testnet (Chain ID: 43113) |
| **RPC** | `https://api.avax-test.network/ext/bc/C/rpc` |
| **Explorer** | [testnet.snowtrace.io](https://testnet.snowtrace.io) |

### Deployed Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| MomAISeasonPass (ERC-721) | `0x88a5036f9DCd85bcAC8564CB2Ef4781F8Bb14595` | NFT subscription passes |
| MomAIToken (ERC-20) | `0x9b1341ce9a841318C9e111aFB73F94ef62Efd783` | MOMAI utility token |
| MomAIEscrow | `0x0ff2E031c64731eb94828CFf6F9ecB6d8E901187` | Token escrow for bookings |
| MockUSDT (ERC-20) | `0xb64808c1Aaf5374794aE91C7C6331f48367fec32` | Test stablecoin (USDT.BMW) |

### How Escrow Works

1. User creates a booking request
2. 1 MOMAI token is escrowed on-chain via the MomAIEscrow contract
3. AI agent calls/texts the provider
4. **Success** → token released to platform treasury
5. **Failure** → token refunded to user's wallet

Email users are auto-approved by the backend. External wallet users (Core app) approve via a browser wallet popup before their first booking.

## Build & Deploy

```bash
npm run build     # TypeScript check + Vite build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

Deployed to Railway as a static site serving the `dist/` directory.

## Security

- All secrets loaded from environment variables (`.env` file, gitignored)
- JWT tokens stored in memory (Zustand store) with automatic refresh via Axios interceptor
- Private key export and fund transfers require OTP email verification on the backend
- No secrets or API keys are hardcoded in source code
- `.env` is gitignored — use `.env.example` as a template

## Related Repositories

- [momai-backend](https://github.com/Bitsyouneed-host/momai-backend) — Node.js/Express API *(coming soon)*
- [momai-android](https://github.com/Bitsyouneed-host/momai-android) — Android app (Kotlin/Jetpack Compose) *(coming soon)*
- [momai-ios](https://github.com/Bitsyouneed-host/momai-ios) — iOS app (Swift/SwiftUI) *(coming soon)*
- [momai-contracts](https://github.com/Bitsyouneed-host/momai-contracts) — Solidity smart contracts *(coming soon)*

## License

Proprietary. All rights reserved.
