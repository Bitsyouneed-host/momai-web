import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Search, Loader2, MapPin, Star, Phone, Check, AlertCircle, Wand2, RotateCcw,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { searchApi } from '../../api/search';
import { bookingApi } from '../../api/booking';
import type { SearchResult } from '../../types/search';

type Step = 'input' | 'searching' | 'results' | 'confirm' | 'booking' | 'complete' | 'error';

const providerTypes = [
  { id: 'doctor', label: 'Doctor', icon: '🩺' },
  { id: 'dentist', label: 'Dentist', icon: '🦷' },
  { id: 'hospital', label: 'Hospital', icon: '🏥' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'physiotherapist', label: 'Physical Therapy', icon: '🏋️' },
  { id: 'veterinary_care', label: 'Veterinarian', icon: '🐾' },
];

const timePreferences = ['Morning', 'Afternoon', 'Anytime'];

export default function MomMePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [selectedType, setSelectedType] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [details, setDetails] = useState('');
  const [timePreference, setTimePreference] = useState('Anytime');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const stepIndex = step === 'input' ? 0 : step === 'searching' ? 1 : step === 'results' ? 1 : step === 'confirm' ? 2 : 3;
  const stepLabels = ['Details', 'Search', 'Confirm', 'Done'];

  const handleSearch = async () => {
    if (!selectedType) { toast.error('Select a provider type'); return; }
    if (!zipCode.trim()) { toast.error('Enter a zip code'); return; }
    if (!details.trim()) { toast.error('Describe what you need'); return; }

    setStep('searching');
    try {
      const { data } = await searchApi.providers({ type: selectedType, query: `${selectedType} near ${zipCode}` });
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).providers as SearchResult[]) || [];
        setResults(list);
        setStep('results');
      } else {
        setResults([]);
        setStep('results');
      }
    } catch {
      setError('Failed to search for providers. Please try again.');
      setStep('error');
    }
  };

  const selectProvider = async (provider: SearchResult) => {
    setSelectedProvider(provider);

    // Fetch phone number if missing
    if (!provider.phone && provider.placeId) {
      try {
        const { data } = await searchApi.placeDetails(provider.placeId);
        if (data.success && data.data) {
          const detail = (data.data as unknown as Record<string, unknown>).provider || data.data;
          const phone = (detail as Record<string, unknown>).phone as string | undefined;
          if (phone) {
            setSelectedProvider({ ...provider, phone });
          }
        }
      } catch { /* use what we have */ }
    }

    setStep('confirm');
  };

  const handleBook = async () => {
    if (!selectedProvider) return;

    // Pre-check
    try {
      const { data: preCheck } = await bookingApi.preCheck();
      const preCheckData = preCheck as unknown as Record<string, unknown>;
      if (!preCheck.success || !preCheckData.canBook) {
        toast.error((preCheckData.message as string) || 'Unable to book right now');
        return;
      }
    } catch {
      toast.error('Failed to verify booking eligibility');
      return;
    }

    setStep('booking');

    // Generate preferred dates
    const preferredDates: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (timePreference === 'Morning') d.setHours(9, 0, 0, 0);
      else if (timePreference === 'Afternoon') d.setHours(14, 0, 0, 0);
      else d.setHours(10, 0, 0, 0);
      preferredDates.push(d.toISOString());
    }

    try {
      const { data } = await bookingApi.create({
        providerName: selectedProvider.name,
        providerPhone: selectedProvider.phone || '',
        requestDetails: details,
        serviceType: selectedType,
        preferredDates,
        contactMethod: 'call',
      });

      if (data.success && data.data) {
        const raw = data.data;
        const booking = (raw as unknown as Record<string, unknown>).bookingRequest || raw;
        setBookingId((booking as Record<string, unknown>)._id as string || (booking as Record<string, unknown>).id as string || '');
        setStep('complete');
      } else {
        setError(data.message || 'Booking failed');
        setStep('error');
      }
    } catch {
      setError('Failed to create booking. Please try again.');
      setStep('error');
    }
  };

  const reset = () => {
    setStep('input');
    setResults([]);
    setSelectedProvider(null);
    setError('');
    setBookingId('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => step === 'input' ? navigate(-1) : reset()} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">MOM ME!</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i < stepIndex ? 'bg-success text-white' : i === stepIndex ? 'bg-accent text-white' : 'bg-gray-200 text-muted'
            }`}>
              {i < stepIndex ? <Check size={14} /> : i + 1}
            </div>
            <span className="text-[10px] text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Step: Input */}
      {step === 'input' && (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-semibold text-text-primary mb-3">What type of provider?</h3>
            <div className="grid grid-cols-3 gap-2">
              {providerTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    selectedType === t.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-primary/15 bg-white/50 text-text-secondary hover:border-primary/30'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-xs font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold text-text-primary mb-3">Your ZIP Code</h3>
            <input
              type="text"
              placeholder="e.g. 80202"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold text-text-primary mb-3">What do you need?</h3>
            <textarea
              placeholder="Describe your appointment needs..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold text-text-primary mb-3">Time Preference</h3>
            <div className="flex gap-2">
              {timePreferences.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimePreference(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    timePreference === t
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-primary/15 text-text-secondary hover:border-primary/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </GlassCard>

          <PrimaryButton onClick={handleSearch} className="!from-accent !to-pink-500">
            <span className="flex items-center justify-center gap-2">
              <Wand2 size={18} /> MOM ME!
            </span>
          </PrimaryButton>
        </div>
      )}

      {/* Step: Searching */}
      {step === 'searching' && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-accent mb-4" />
          <h3 className="text-lg font-semibold text-text-primary">Searching for providers...</h3>
          <p className="text-sm text-text-secondary mt-1">
            Looking for {providerTypes.find((t) => t.id === selectedType)?.label || 'providers'} near {zipCode}
          </p>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-muted mb-3" />
              <h3 className="text-lg font-semibold text-text-primary">No providers found</h3>
              <p className="text-sm text-text-secondary mt-1 mb-4">Try a different type or zip code</p>
              <PrimaryButton onClick={reset} fullWidth={false} className="!py-3 !px-6">
                Search Again
              </PrimaryButton>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-secondary">{results.length} provider{results.length !== 1 ? 's' : ''} found</p>
              {results.map((r) => (
                <GlassCard key={r.placeId} className="!p-4" onClick={() => selectProvider(r)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary">{r.name}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                        <MapPin size={12} /> <span className="truncate">{r.address}</span>
                      </div>
                      {r.rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                          <Star size={12} fill="currentColor" /> {r.rating}
                          {r.userRatingsTotal && <span className="text-muted">({r.userRatingsTotal})</span>}
                        </div>
                      )}
                    </div>
                    {r.openNow !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.openNow ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {r.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </GlassCard>
              ))}
              <button onClick={reset} className="w-full text-center text-sm text-primary-deep font-medium py-2">
                Search Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && selectedProvider && (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-semibold text-text-primary mb-3">Selected Provider</h3>
            <div className="space-y-2">
              <div className="text-lg font-bold text-text-primary">{selectedProvider.name}</div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={14} /> {selectedProvider.address}
              </div>
              {selectedProvider.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone size={14} /> {selectedProvider.phone}
                </div>
              )}
              {selectedProvider.rating && (
                <div className="flex items-center gap-1 text-sm text-warning">
                  <Star size={14} fill="currentColor" /> {selectedProvider.rating}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="!bg-primary/5 !border-primary/20">
            <h3 className="font-semibold text-text-primary mb-2">Your Request</h3>
            <p className="text-sm text-text-secondary">{details}</p>
            <p className="text-xs text-muted mt-2">Preferred time: {timePreference}</p>
          </GlassCard>

          <PrimaryButton onClick={handleBook} className="!from-accent !to-pink-500">
            <span className="flex items-center justify-center gap-2">
              <Phone size={18} /> Book Now
            </span>
          </PrimaryButton>

          <button onClick={() => setStep('results')} className="w-full text-center text-sm text-primary-deep font-medium py-2">
            Choose Different Provider
          </button>
        </div>
      )}

      {/* Step: Booking */}
      {step === 'booking' && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
            <Phone size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">AI is booking your appointment...</h3>
          <p className="text-sm text-text-secondary mt-1 text-center max-w-xs">
            Calling {selectedProvider?.name}. This may take a moment.
          </p>
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <Check size={40} className="text-success" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Booking Started!</h3>
          <p className="text-sm text-text-secondary text-center mb-6 max-w-xs">
            Your AI agent is working on booking your appointment at {selectedProvider?.name}.
          </p>
          <div className="flex gap-3 w-full max-w-xs">
            <PrimaryButton onClick={() => navigate(`/booking/${bookingId}`)} fullWidth>
              View Booking
            </PrimaryButton>
          </div>
          <button onClick={() => navigate('/')} className="mt-3 text-sm text-primary-deep font-medium">
            Go Home
          </button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-error/15 flex items-center justify-center mb-4">
            <AlertCircle size={40} className="text-error" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-1">Something went wrong</h3>
          <p className="text-sm text-text-secondary text-center mb-6 max-w-xs">{error}</p>
          <div className="flex gap-3">
            <PrimaryButton onClick={reset} fullWidth={false} className="!py-3 !px-6">
              <span className="flex items-center gap-2"><RotateCcw size={16} /> Try Again</span>
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
