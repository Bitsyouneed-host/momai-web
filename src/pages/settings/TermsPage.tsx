import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Terms & Conditions</h1>
      </div>

      <GlassCard>
        <div className="prose prose-sm max-w-none text-text-primary">
          <p className="text-xs text-muted mb-4">Last Updated: January 20, 2026</p>

          <Section title="1. Agreement to Terms">
            <p>By accessing or using the MOM AI application and related services (&quot;Service&quot;) operated by Blakes IT Solutions LLC (&quot;Company&quot;), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>MOM AI provides AI-powered appointment booking services, including: AI phone calling to book appointments, SMS-based booking, calendar synchronization, MOMAI token-based payment system, and NFT season pass subscriptions.</p>
          </Section>

          <Section title="3. Eligibility">
            <p>You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement.</p>
          </Section>

          <Section title="4. AI Calling Services">
            <p>You authorize MOM AI to make phone calls and send messages on your behalf. AI agents will identify themselves as calling on your behalf. We do not guarantee that any call will result in a successful booking. Provider availability, responses, and actions are outside our control.</p>
          </Section>

          <Section title="5. MOMAI Tokens and Cryptocurrency">
            <p>MOMAI tokens are utility tokens used solely for accessing services within the MOM AI platform. They are NOT investments, securities, or financial instruments. Tokens have no guaranteed monetary value outside the platform. All blockchain transactions are final and irreversible. Failed bookings where the AI spoke to a provider will still consume tokens. Tokens held in escrow are returned if the booking is cancelled before the AI call.</p>
          </Section>

          <Section title="6. Wallet Connection and Security">
            <p><strong>External Wallets:</strong> You are solely responsible for the security of your external wallet (MetaMask, Coinbase, etc.). We never have access to your private keys.</p>
            <p><strong>In-App Wallets:</strong> Private keys for in-app created wallets are stored on your device. We are not responsible for lost keys.</p>
            <p><strong>Generated Custodial Wallets:</strong> For email users, we generate wallets with encrypted keys stored on our servers. You are responsible for maintaining access to your account.</p>
            <p>You are responsible for all gas fees associated with blockchain transactions.</p>
          </Section>

          <Section title="7. User Responsibilities">
            <p>You agree to: provide accurate information, use the Service only for lawful purposes, not use the Service for harassment or fraud, maintain the security of your account credentials.</p>
          </Section>

          <Section title="8. Fees, Payments, and Refunds">
            <p>Services are accessed through MOMAI tokens. Promotional tokens may be granted at our discretion. Refunds are handled on a case-by-case basis at our sole discretion.</p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>All content, features, and functionality of the Service are owned by Blakes IT Solutions LLC and are protected by copyright, trademark, and other intellectual property laws.</p>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT ANY BOOKING ATTEMPT WILL BE SUCCESSFUL.</p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLAKES IT SOLUTIONS LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </Section>

          <Section title="12. Assumption of Risk">
            <p>You acknowledge the risks of: AI technology failures, cryptocurrency price volatility, irreversible blockchain transactions, wallet security breaches due to your own actions, third-party service outages.</p>
          </Section>

          <Section title="13. Indemnification">
            <p>You agree to indemnify and hold harmless Blakes IT Solutions LLC from any claims, damages, or expenses arising from your use of the Service.</p>
          </Section>

          <Section title="14. Dispute Resolution">
            <p>Any disputes shall first be attempted to be resolved informally within 30 days. If unresolved, disputes shall be settled by binding arbitration in Denver, Colorado. YOU AGREE TO WAIVE YOUR RIGHT TO PARTICIPATE IN CLASS ACTION LAWSUITS.</p>
          </Section>

          <Section title="15. Termination">
            <p>We may terminate or suspend your account at any time, with or without cause. Upon termination, your right to use the Service will immediately cease.</p>
          </Section>

          <Section title="16. Governing Law">
            <p>These Terms shall be governed by the laws of the State of Colorado, without regard to conflict of law provisions. Exclusive jurisdiction shall be Denver, Colorado.</p>
          </Section>

          <Section title="17. Contact Us">
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
