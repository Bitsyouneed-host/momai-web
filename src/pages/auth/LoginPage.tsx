import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Wallet, CheckCircle } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

type Step = 'email' | 'code' | 'profile' | 'wallet-email' | 'wallet-code' | 'wallet-welcome';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [walletEmail, setWalletEmail] = useState('');
  const [welcomeTokens, setWelcomeTokens] = useState(0);

  // Redirect if already authenticated (unless in wallet email verification flow)
  if (isAuthenticated && step !== 'wallet-email' && step !== 'wallet-code' && step !== 'wallet-welcome') {
    navigate('/', { replace: true });
    return null;
  }

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.sendEmailCode(email.trim().toLowerCase());
      if (data.success) {
        toast.success('Verification code sent to your email');
        setStep('code');
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
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.verifyEmailCode(email.trim().toLowerCase(), trimmedCode);
      if (data.success && data.data) {
        const { accessToken, refreshToken, user, requiresProfile } = data.data;
        if (requiresProfile || !user?.firstName) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          setNeedsProfile(true);
          setStep('profile');
        } else {
          login(accessToken, refreshToken, user);
          toast.success(`Welcome back, ${user.firstName}!`);
          navigate('/', { replace: true });
        }
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } } };
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.message
        || (err instanceof Error ? err.message : 'Verification failed');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.completeProfile(firstName.trim(), lastName.trim());
      if (data.success && data.data) {
        useAuthStore.getState().setUser(data.data);
        useAuthStore.setState({ isAuthenticated: true });
        toast.success(`Welcome, ${data.data.firstName}!`);
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use wallet login');
      return;
    }
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const walletAddress = accounts[0];
      const { data } = await authApi.walletLogin(walletAddress);
      if (data.success && data.data) {
        const { accessToken, refreshToken, user, requiresProfile } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        if (requiresProfile || !user?.firstName) {
          setNeedsProfile(true);
          setStep('profile');
        } else if (!user?.email) {
          // Wallet user with no email — prompt for email verification
          login(accessToken, refreshToken, user);
          setStep('wallet-email');
        } else {
          login(accessToken, refreshToken, user);
          toast.success(`Welcome back, ${user.firstName}!`);
          navigate('/', { replace: true });
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Wallet login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletEmailSendCode = async () => {
    if (!walletEmail.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.walletTrialSendCode(walletEmail.trim().toLowerCase());
      if (data.success) {
        if (data.data?.alreadyVerified) {
          toast.success('Email already verified!');
          navigate('/', { replace: true });
        } else {
          toast.success('Verification code sent to your email');
          setStep('wallet-code');
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

  const handleWalletEmailVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) return;
    setIsLoading(true);
    try {
      const { data } = await authApi.walletTrialVerifyCode(trimmedCode);
      if (data.success) {
        const tokensGranted = data.data?.tokensGranted || 0;
        setWelcomeTokens(tokensGranted);
        setStep('wallet-welcome');
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

  const handleSkipWalletEmail = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-top to-gradient-bottom flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">MOM AI</h1>
          <p className="text-text-secondary mt-1">AI-powered appointment booking</p>
        </div>

        <GlassCard>
          {step === 'email' && (
            <div className="space-y-5">
              <div className="text-center">
                <Mail size={32} className="mx-auto text-primary mb-2" />
                <h2 className="text-lg font-semibold text-text-primary">Sign In</h2>
                <p className="text-sm text-text-secondary">Enter your email to get started</p>
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
                disabled={!email.trim()}
              >
                <span className="flex items-center justify-center gap-2">
                  Continue <ArrowRight size={18} />
                </span>
              </PrimaryButton>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/90 px-3 text-muted">or</span>
                </div>
              </div>

              <SecondaryButton onClick={handleWalletLogin}>
                <span className="flex items-center justify-center gap-2">
                  <Wallet size={18} />
                  Connect Wallet
                </span>
              </SecondaryButton>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-5">
              <div className="text-center">
                <CheckCircle size={32} className="mx-auto text-success mb-2" />
                <h2 className="text-lg font-semibold text-text-primary">Check Your Email</h2>
                <p className="text-sm text-text-secondary">
                  Enter the 6-digit code sent to <br />
                  <strong>{email}</strong>
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
                Verify Code
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
                      await authApi.sendEmailCode(email.trim().toLowerCase());
                      toast.success('New code sent');
                    } catch {
                      toast.error('Failed to resend code');
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

          {step === 'profile' && needsProfile && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-text-primary">Complete Your Profile</h2>
                <p className="text-sm text-text-secondary">Tell us your name to get started</p>
              </div>

              <StyledInput
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <StyledInput
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompleteProfile()}
              />

              <PrimaryButton
                onClick={handleCompleteProfile}
                isLoading={isLoading}
                disabled={!firstName.trim() || !lastName.trim()}
              >
                Get Started
              </PrimaryButton>
            </div>
          )}

          {step === 'wallet-email' && (
            <div className="space-y-5">
              <div className="text-center">
                <Mail size={32} className="mx-auto text-primary mb-2" />
                <h2 className="text-lg font-semibold text-text-primary">Verify Your Email</h2>
                <p className="text-sm text-text-secondary">
                  Confirm your email to receive <strong>29 USDT + 10 MOMAI tokens</strong> and gas fees covered!
                </p>
              </div>

              <StyledInput
                type="email"
                placeholder="you@example.com"
                value={walletEmail}
                onChange={(e) => setWalletEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWalletEmailSendCode()}
              />

              <PrimaryButton
                onClick={handleWalletEmailSendCode}
                isLoading={isLoading}
                disabled={!walletEmail.trim()}
              >
                Send Code
              </PrimaryButton>

              <button
                onClick={handleSkipWalletEmail}
                className="w-full text-sm text-text-secondary hover:text-primary-deep transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 'wallet-code' && (
            <div className="space-y-5">
              <div className="text-center">
                <CheckCircle size={32} className="mx-auto text-success mb-2" />
                <h2 className="text-lg font-semibold text-text-primary">Enter Verification Code</h2>
                <p className="text-sm text-text-secondary">
                  We sent a 6-digit code to <br />
                  <strong>{walletEmail}</strong>
                </p>
              </div>

              <StyledInput
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleWalletEmailVerifyCode()}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />

              <PrimaryButton
                onClick={handleWalletEmailVerifyCode}
                isLoading={isLoading}
                disabled={code.trim().length !== 6}
              >
                Verify Code
              </PrimaryButton>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkipWalletEmail}
                  className="text-sm text-text-secondary hover:text-primary-deep transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={async () => {
                    setCode('');
                    setIsLoading(true);
                    try {
                      await authApi.walletTrialSendCode(walletEmail.trim().toLowerCase());
                      toast.success('New code sent');
                    } catch {
                      toast.error('Failed to resend code');
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

          {step === 'wallet-welcome' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-text-primary">Welcome to the MVP/Beta!</h2>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 text-center space-y-2">
                <p className="text-sm text-text-secondary">The creator has given you:</p>
                <p className="text-2xl font-bold text-success">29 USDT</p>
                {welcomeTokens > 0 && (
                  <p className="text-base font-bold text-warning">+ {welcomeTokens} MOMAI Tokens + Gas</p>
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
    </div>
  );
}

// Extend window for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}
