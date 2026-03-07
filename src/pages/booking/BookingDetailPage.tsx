import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, MessageSquare, User, Bot, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import { bookingApi } from '../../api/booking';
import type { BookingRequest } from '../../types/booking';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bookingApi.get(id).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const item = (raw as unknown as Record<string, unknown>).bookingRequest || raw;
        setRequest(item as BookingRequest);
      }
    }).catch(() => toast.error('Failed to load booking'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this booking request?')) return;
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      navigate('/booking');
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return <div className="text-center py-20 text-text-secondary">Booking not found</div>;
  }

  const isActive = ['pending', 'in-progress', 'calling'].includes(request.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/booking')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Booking Details</h1>
      </div>

      {/* Status */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={request.status} />
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            {request.contactMethod === 'call' ? <Phone size={12} /> : <MessageSquare size={12} />}
            {request.contactMethod === 'call' ? 'Phone Call' : 'Text Message'}
          </div>
        </div>
        <h2 className="font-semibold text-text-primary text-lg">{request.providerName}</h2>
        <p className="text-sm text-text-secondary">{request.providerPhone}</p>
      </GlassCard>

      {/* Details */}
      <GlassCard>
        <h3 className="font-semibold text-text-primary mb-2">Request Details</h3>
        {request.serviceType && (
          <div className="mb-2">
            <span className="text-xs text-text-secondary">Service: </span>
            <span className="text-sm text-text-primary">{request.serviceType}</span>
          </div>
        )}
        {request.requestDetails && (
          <p className="text-sm text-text-secondary">{request.requestDetails}</p>
        )}
        {request.preferredDates && request.preferredDates.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-text-secondary">Preferred: </span>
            <span className="text-sm text-text-primary">
              {request.preferredDates.map((d) => new Date(d).toLocaleDateString()).join(', ')}
            </span>
          </div>
        )}
      </GlassCard>

      {/* Transcript */}
      {request.transcript && request.transcript.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-text-primary mb-3">AI Transcript</h3>
          <div className="space-y-3">
            {request.transcript.map((entry, i) => (
              <div key={i} className={`flex gap-2 ${entry.role === 'ai' ? '' : 'justify-end'}`}>
                {entry.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot size={12} className="text-accent" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  entry.role === 'ai'
                    ? 'bg-gray-100 text-text-primary'
                    : 'bg-primary/10 text-text-primary'
                }`}>
                  {entry.text}
                </div>
                {entry.role === 'human' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={12} className="text-primary-deep" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Result */}
      {request.resultNotes && (
        <GlassCard>
          <h3 className="font-semibold text-text-primary mb-2">Result</h3>
          <p className="text-sm text-text-secondary">{request.resultNotes}</p>
        </GlassCard>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {request.bookedAppointment && (
          <PrimaryButton onClick={() => navigate(`/appointments/${request.bookedAppointment}`)}>
            View Appointment
          </PrimaryButton>
        )}
        {isActive && (
          <SecondaryButton onClick={handleCancel} className="!text-error !border-error/30">
            Cancel Booking
          </SecondaryButton>
        )}
        {request.status === 'failed' && (
          <PrimaryButton onClick={() => navigate('/booking/new')}>
            Try Again
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
