import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { authApi } from '../../api/auth';

type Step = 'email' | 'code' | 'welcome';

export default function ConnectEmailPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokensGranted, setTokensGranted] = useState(0);

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.walletTrialSendCode(email.trim().toLowerCase());
      if (data.success) {
        if (data.data?.alreadyVerified) {
          toast.success('Email already verified!');
          navigate('/', { replace: true });
        } else {
          toast.success('Verification code sent');
          setStep('code');
        }
      } else {
        toast.error(data.message || 'Failed to send code');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length !== 6) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.walletTrialVerifyCode(code.trim());
      if (data.success) {
        setTokensGranted(data.data?.tokensGranted || 0);
        setStep('welcome');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Connect Email</h1>
      </div>

      <GlassCard>
        {step === 'email' && (
          <div className="space-y-5">
            <div className="text-center">
              <Mail size={48} className="mx-auto text-primary mb-3" />
              <h2 className="text-lg font-semibold text-text-primary">Connect Your Email</h2>
              <p className="text-sm text-text-secondary mt-1">
                Verify your email to receive <strong>29 USDT + 10 MOMAI tokens</strong> and gas fees covered!
              </p>
            </div>

            <StyledInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
            />

            <PrimaryButton
              onClick={handleSendCode}
              isLoading={isLoading}
              disabled={!email.includes('@')}
            >
              Send Verification Code
            </PrimaryButton>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-5">
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-success mb-3" />
              <h2 className="text-lg font-semibold text-text-primary">Enter Verification Code</h2>
              <p className="text-sm text-text-secondary mt-1">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <StyledInput
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
            />

            <PrimaryButton
              onClick={handleVerifyCode}
              isLoading={isLoading}
              disabled={code.trim().length !== 6}
            >
              Verify & Connect
            </PrimaryButton>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep('email'); setCode(''); }}
                className="text-sm text-text-secondary hover:text-primary-deep transition-colors"
              >
                Different email
              </button>
              <button
                onClick={async () => {
                  setCode('');
                  setIsLoading(true);
                  try {
                    await authApi.walletTrialSendCode(email.trim().toLowerCase());
                    toast.success('New code sent');
                  } catch {
                    toast.error('Failed to resend');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-sm text-primary-deep hover:text-primary-dark font-medium transition-colors"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {step === 'welcome' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-text-primary">Welcome to the MVP/Beta!</h2>
            </div>

            <div className="bg-orange-50 rounded-xl p-5 text-center space-y-2">
              <p className="text-sm text-text-secondary">The creator has given you:</p>
              <p className="text-3xl font-bold text-success">29 USDT</p>
              {tokensGranted > 0 && (
                <p className="text-lg font-bold text-warning">+ {tokensGranted} MOMAI Tokens + Gas</p>
              )}
            </div>

            <p className="text-sm text-text-secondary text-center">
              We also covered your gas fees so you can start transacting right away! This USDT is for testing while we are on testnet. When we move to mainnet, the app will accept real USDT.
            </p>

            <p className="text-center font-semibold text-primary-deep">
              Have fun and thank you for playing!
            </p>

            <PrimaryButton onClick={() => navigate('/', { replace: true })}>
              Let&apos;s Go!
            </PrimaryButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
