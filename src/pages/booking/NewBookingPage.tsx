import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StyledInput from '../../components/ui/StyledInput';
import StyledTextarea from '../../components/ui/StyledTextarea';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { bookingApi } from '../../api/booking';
import type { ContactMethod } from '../../types/booking';

interface LocationState {
  providerName?: string;
  providerPhone?: string;
  requestDetails?: string;
  serviceType?: string;
}

export default function NewBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const [providerName, setProviderName] = useState(state.providerName || '');
  const [providerPhone, setProviderPhone] = useState(state.providerPhone || '');
  const [serviceType, setServiceType] = useState(state.serviceType || '');
  const [requestDetails, setRequestDetails] = useState(state.requestDetails || '');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('call');
  const [preferredDate, setPreferredDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!providerName.trim() || !providerPhone.trim()) {
      toast.error('Provider name and phone are required');
      return;
    }

    setIsLoading(true);
    try {
      // Pre-check if user can book
      const preCheck = await bookingApi.preCheck();
      const preCheckData = preCheck.data as unknown as Record<string, unknown>;
      if (!preCheckData.canBook) {
        if (preCheckData.code === 'NEEDS_APPROVAL' || preCheckData.needsApproval) {
          // Auto-approve escrow for email users with generated wallets
          toast('Approving escrow contract...');
          try {
            const approveRes = await bookingApi.approveEscrow();
            const approveData = approveRes.data as unknown as Record<string, unknown>;
            if (!approveData.success) {
              toast.error((approveData.message as string) || 'Failed to approve escrow contract');
              return;
            }
          } catch {
            toast.error('Failed to approve escrow contract');
            return;
          }
        } else {
          toast.error((preCheckData.message as string) || 'Cannot book at this time');
          return;
        }
      }

      const { data } = await bookingApi.create({
        providerName: providerName.trim(),
        providerPhone: providerPhone.trim(),
        serviceType: serviceType.trim() || undefined,
        requestDetails: requestDetails.trim() || undefined,
        contactMethod,
        preferredDates: preferredDate ? [preferredDate] : undefined,
      });

      if (data.success && data.data) {
        toast.success('Booking request created! AI is working on it.');
        const raw = data.data;
        const booking = (raw as unknown as Record<string, unknown>).bookingRequest || raw;
        const bookingId = (booking as Record<string, unknown>)._id || (booking as Record<string, unknown>).id || '';
        navigate(`/booking/${bookingId}`);
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create booking');
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
        <h1 className="text-2xl font-bold text-text-primary">New AI Booking</h1>
      </div>

      <GlassCard>
        <div className="space-y-4">
          <StyledInput
            label="Provider Name *"
            placeholder="e.g., Dr. Smith's Office"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />

          <StyledInput
            label="Phone Number *"
            placeholder="(555) 123-4567"
            type="tel"
            value={providerPhone}
            onChange={(e) => setProviderPhone(e.target.value)}
          />

          <StyledInput
            label="Service Type"
            placeholder="e.g., Dental Cleaning, Checkup"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          />

          <StyledTextarea
            label="Request Details"
            placeholder="Any specific details for the AI to mention..."
            value={requestDetails}
            onChange={(e) => setRequestDetails(e.target.value)}
          />

          <StyledInput
            label="Preferred Date"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />

          {/* Contact Method */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Contact Method
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setContactMethod('call')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                  contactMethod === 'call'
                    ? 'bg-primary/15 border-primary text-primary-deep font-medium'
                    : 'bg-white/80 border-gray-200 text-text-secondary'
                }`}
              >
                <Phone size={16} />
                Call
              </button>
              <button
                onClick={() => setContactMethod('sms')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                  contactMethod === 'sms'
                    ? 'bg-primary/15 border-primary text-primary-deep font-medium'
                    : 'bg-white/80 border-gray-200 text-text-secondary'
                }`}
              >
                <MessageSquare size={16} />
                Text
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <PrimaryButton onClick={handleSubmit} isLoading={isLoading} disabled={!providerName.trim() || !providerPhone.trim()}>
        Start AI Booking
      </PrimaryButton>
    </div>
  );
}
