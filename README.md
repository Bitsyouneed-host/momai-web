# MOM AI - Web App

Browser-based companion to the MOM AI mobile apps. Built with React 19, TypeScript, Vite, and Tailwind CSS. Deployed to Railway as a separate service.

## Tech Stack

- **React 19** + TypeScript 5.9
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 4** - Styling
- **Zustand 5** - State management
- **Axios** - HTTP client with JWT refresh interceptor
- **ethers.js 6** - On-chain reads (NFT status, balances, contract pricing)
- **React Router 7** - Client-side routing
- **react-hot-toast** - Notifications
- **Lucide React** - Icons

## Getting Started

```bash
npm install
npm run dev     # http://localhost:5173
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://backend-production-5aa0.up.railway.app/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (for provider search) | _(empty)_ |

## Features

### Authentication
- **Email Login** - 6-digit OTP code, auto-account creation, profile completion
- **Wallet Login** - MetaMask connection, auto wallet generation on backend
- **Connect Email** - Wallet-only users can link email post-signup for 29 USDT + 10 MOMAI + gas

### AI Booking
- **MOM ME!** - Describe what you need, search providers by zip code via Google Places, AI calls/texts to book
- **Manual AI Booking** - Enter provider phone number, AI handles the rest
- **Auto Escrow Approval** - Automatically approves escrow contract for email users when booking (no manual on-chain interaction)
- **Booking Status** - Track pending, in-progress, calling, success, failed, voicemail, no-answer states
- **Transcripts** - View full AI conversation transcripts and outcomes

### Appointments
- Full CRUD with recurring support (daily, weekly, monthly)
- Calendar view
- Invitees and reminders
- Filter by status

### Wallet & Web3
- **Balances** - View AVAX, USDT, MOMAI token balances
- **Send Funds** - Transfer AVAX, USDT, MOMAI, or NFTs (OTP-protected)
- **Export Private Key** - OTP-protected key export for backend-managed wallets
- **NFT Season Pass** - View active pass status, tier, days remaining, expiration
- **Token History** - Track MOMAI token spends

### Subscription
- Free / Pro / Pro+ plan tiers
- Pay with AVAX or USDT
- On-chain NFT Season Pass minting (direct from MetaMask or backend-managed)
- Real-time contract pricing via Chainlink oracle

### Providers
- Browse and manage favorite providers
- Search by keyword, category, location
- Google Places integration for new providers

### Settings
- Profile (name, phone, DOB, address, emergency contact)
- Insurance info
- Privacy policy, terms, contact

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Email/wallet auth with OTP |
| `/` | HomePage | Dashboard, subscription status, NFT pass, quick actions |
| `/connect-email` | ConnectEmailPage | Email verification for wallet users (29 USDT bonus) |
| `/mom-me` | MomMePage | AI-powered auto-find & book |
| `/booking/new` | NewBookingPage | Manual AI booking creation |
| `/booking` | BookingPage | Booking request list |
| `/booking/pending` | PendingBookingsPage | Pending bookings |
| `/booking/:id` | BookingDetailPage | Booking details + transcript |
| `/appointments` | AppointmentsPage | Appointment list |
| `/appointments/new` | NewAppointmentPage | Create manual appointment |
| `/appointments/:id` | AppointmentDetailPage | Appointment details |
| `/calendar` | CalendarPage | Calendar view |
| `/search` | SearchPage | Provider search |
| `/providers` | ProvidersPage | Provider directory |
| `/settings` | SettingsPage | Settings hub |
| `/settings/profile` | ProfilePage | Edit profile + insurance |
| `/settings/wallet` | WalletPage | Wallet, balances, send, export |
| `/settings/paywall` | PaywallPage | Subscription upgrade |
| `/settings/insurance` | InsurancePage | Insurance details |
| `/notifications` | NotificationsPage | Notification center |

## Project Structure

```
web/
├── src/
│   ├── api/                    # API modules
│   │   ├── auth.ts             # Login, OTP, wallet auth, trial verification
│   │   ├── users.ts            # Profile, wallet info, send funds, export
│   │   ├── booking.ts          # AI booking requests
│   │   ├── appointments.ts     # Appointment CRUD
│   │   ├── subscription.ts     # Subscription status, NFT mint verification
│   │   ├── providers.ts        # Provider CRUD
│   │   ├── categories.ts       # Service categories
│   │   ├── search.ts           # Google Places search
│   │   ├── tokens.ts           # Token spend history
│   │   └── client.ts           # Axios instance with JWT interceptor
│   ├── components/
│   │   ├── layout/             # AppShell, TabBar, WalletDropdown, NotificationButton
│   │   ├── shared/             # ProtectedRoute, GradientBackground
│   │   └── ui/                 # GlassCard, StyledInput, PrimaryButton, Modal, StatusBadge
│   ├── hooks/
│   │   └── useContractMint.ts  # NFT minting hook (MetaMask + backend)
│   ├── lib/
│   │   └── contracts.ts        # Chain config, contract addresses, ABIs
│   ├── pages/                  # 23+ page components (grouped by feature)
│   ├── stores/
│   │   ├── authStore.ts        # User auth state (login, logout, fetchUser)
│   │   └── subscriptionStore.ts # Subscription, token balance, AVAX price
│   ├── types/                  # TypeScript interfaces
│   ├── App.tsx                 # Router
│   └── main.tsx                # Entry point
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Blockchain Config

- **Network**: Avalanche Fuji Testnet (Chain ID: 43113)
- **RPC**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Explorer**: `https://testnet.snowtrace.io`
- **NFT Contract**: `0x88a5036f9DCd85bcAC8564CB2Ef4781F8Bb14595`
- **MockUSDT**: `0xb64808c1Aaf5374794aE91C7C6331f48367fec32`

## Build & Deploy

```bash
npm run build   # TypeScript check + Vite build → dist/
npm run lint    # ESLint
npm run preview # Preview production build locally
```

Deployed to Railway as a static site from the `dist/` directory.

## Security

- All API keys and secrets are loaded from environment variables (`.env` file, gitignored)
- JWT tokens stored in memory (Zustand store) with automatic refresh via Axios interceptor
- Private key export and fund transfers require OTP email verification on the backend
- No secrets are hardcoded in source code
- `.env` is gitignored; use `.env.example` as a template
