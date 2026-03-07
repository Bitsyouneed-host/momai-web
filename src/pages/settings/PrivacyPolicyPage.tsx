import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Privacy Policy</h1>
      </div>

      <GlassCard>
        <div className="prose prose-sm max-w-none text-text-primary">
          <p className="text-xs text-muted mb-4">Last Updated: January 20, 2026</p>

          <Section title="1. Introduction">
            <p>Blakes IT Solutions LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operating as MOM AI, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the &quot;Service&quot;).</p>
            <p>Company Address: Denver, Colorado, United States</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Personal Information:</strong> Name, email address, phone number, date of birth, physical address, emergency contact information.</p>
            <p><strong>Appointment Information:</strong> Appointment details, provider information, scheduling preferences, AI call recordings and transcripts, insurance information (provider, policy number, group number).</p>
            <p><strong>Blockchain and Wallet Data:</strong> Wallet addresses (public), transaction hashes and history, token balances and spending activity, smart contract interactions, blockchain network data.</p>
            <p><strong>MOMAI Token Data:</strong> Token purchase and spending history, escrow transactions, gas fee payments, token balance changes.</p>
            <p><strong>Usage Data:</strong> App usage patterns, device information, IP address, browser type.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your information to: provide and maintain the Service, process appointment bookings via AI agents, manage MOMAI token transactions and escrow, send notifications about appointments and bookings, improve our AI calling capabilities, maintain security and prevent fraud.</p>
          </Section>

          <Section title="4. AI-Powered Services">
            <p>Our AI agents make phone calls and send messages on your behalf. Call recordings and transcripts are stored to verify booking outcomes. AI agents identify themselves as calling on your behalf. We analyze call data to improve service quality.</p>
          </Section>

          <Section title="5. Blockchain and Cryptocurrency Data">
            <p>Blockchain transactions are publicly visible and permanent. We store wallet addresses to associate accounts with on-chain activity. Transaction data on public blockchains cannot be deleted.</p>
            <p><strong>Wallet Security by Type:</strong></p>
            <ul>
              <li><strong>External Wallets</strong> (MetaMask, Coinbase, etc.): We never have access to your private keys. We only store your public wallet address.</li>
              <li><strong>In-App Created/Imported Wallets</strong> (iOS): Private keys are stored exclusively on your device in the iOS Keychain. We have no access to these keys.</li>
              <li><strong>Email User Generated Wallets:</strong> Encrypted private keys are stored on our servers using AES-256 encryption. This is necessary to process token transactions on your behalf.</li>
            </ul>
          </Section>

          <Section title="6. Information Sharing">
            <p>We may share your information with: service providers who assist in operating our platform, blockchain networks for transaction processing, legal authorities when required by law, business partners with your consent.</p>
          </Section>

          <Section title="7. Data Security">
            <p>We implement encryption, tokenization, and regular security assessments. However, no method of transmission over the Internet is 100% secure.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>Account data is retained while your account is active and for a reasonable period thereafter. Transaction records are maintained per legal requirements. Blockchain data is permanent. AI call recordings may be retained up to 2 years.</p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to: access your personal data, correct inaccurate data, request deletion (subject to blockchain limitations), opt-out of marketing communications, export your data.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>Our Service is not intended for users under 18 years of age. We do not knowingly collect information from children.</p>
          </Section>

          <Section title="11. California Privacy Rights (CCPA)">
            <p>California residents have additional rights including: the right to know what personal information is collected, the right to request deletion of personal information, the right to opt-out of the sale of personal information, the right to non-discrimination for exercising privacy rights.</p>
          </Section>

          <Section title="12. Contact Us">
            <p>For privacy-related inquiries, contact us at:</p>
            <p>Email: support@bitsyouneed.com</p>
            <p>Blakes IT Solutions LLC, Denver, CO</p>
          </Section>
        </div>
      </GlassCard>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-text-primary text-sm mb-2">{title}</h3>
      <div className="text-xs text-text-secondary space-y-2">{children}</div>
    </div>
  );
}
