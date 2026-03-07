import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Phone, MessageSquare, User, Bot, Loader2, Clock, Calendar,
  Tag, RotateCcw, XCircle, Eye, PhoneCall, Copy, Check, Coins,
} from 'lucide-react';
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const fetchBooking = () => {
    if (!id) return;
    bookingApi.get(id).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const item = (raw as unknown as Record<string, unknown>).bookingRequest || raw;
        setRequest(item as BookingRequest);
      }
    }).catch(() => toast.error('Failed to load booking'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this booking request?')) return;
    setIsCancelling(true);
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      navigate('/booking');
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = () => {
    if (!request) return;
    navigate('/booking/new', {
      state: {
        providerName: request.providerName,
        providerPhone: request.providerPhone,
        requestDetails: request.requestDetails,
        serviceType: request.serviceType,
      },
    });
  };

  const copyTranscript = async () => {
    if (!request) return;
    const text = request.transcript
      ? request.transcript.map((t) => `${t.role === 'ai' ? 'AI Agent' : 'Provider'}: ${t.text}`).join('\n')
      : request.aiTranscript || '';
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    toast.success('Transcript copied');
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

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

  const isActive = ['pending', 'in-progress', 'calling', 'voicemail', 'callback'].includes(request.status);
  const canRetry = ['failed', 'no-answer', 'voicemail'].includes(request.status);
  const canReschedule = ['pending', 'no-answer', 'voicemail', 'callback'].includes(request.status);
  const hasTranscript = (request.transcript && request.transcript.length > 0) || !!request.aiTranscript;
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/booking')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary flex-1">Booking Details</h1>
        {request.isMomMe && (
          <span className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">MOM ME</span>
        )}
      </div>

      {/* Status Card */}
      <GlassCard className={
        request.status === 'success' || request.status === 'completed' ? '!border-success/30 !bg-success/5' :
        request.status === 'failed' || request.status === 'cancelled' ? '!border-error/20 !bg-error/5' :
        isActive ? '!border-primary/30 !bg-primary/5' : ''
      }>
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={request.status} className="!text-sm !px-3 !py-1.5" />
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            {request.contactMethod === 'call' ? <Phone size={12} /> : <MessageSquare size={12} />}
            {request.contactMethod === 'call' ? 'Phone Call' : 'Text Message'}
          </div>
        </div>

        {/* Callback explanation */}
        {request.status === 'callback' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-warning/10 mb-3">
            <PhoneCall size={14} className="text-warning shrink-0" />
            <p className="text-xs text-warning font-medium">
              The business said they would call you back.
            </p>
          </div>
        )}

        {/* Voicemail explanation */}
        {request.status === 'voicemail' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-100 mb-3">
            <Phone size={14} className="text-purple-600 shrink-0" />
            <p className="text-xs text-purple-600 font-medium">
              AI left a voicemail. The provider may call back.
            </p>
          </div>
        )}

        <h2 className="font-semibold text-text-primary text-lg">{request.providerName}</h2>
        {request.providerPhone && (
          <a href={`tel:${request.providerPhone}`} className="text-sm text-primary-deep hover:underline flex items-center gap-1 mt-0.5">
            <Phone size={12} /> {request.providerPhone}
          </a>
        )}
      </GlassCard>

      {/* Request Details */}
      <GlassCard>
        <h3 className="font-semibold text-text-primary mb-3">Request Details</h3>
        <div className="space-y-2.5">
          {request.serviceType && (
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-accent shrink-0" />
              <span className="text-sm text-text-primary">{request.serviceType}</span>
            </div>
          )}
          {request.requestDetails && (
            <p className="text-sm text-text-secondary">{request.requestDetails}</p>
          )}
          {request.estimatedDuration && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted shrink-0" />
              <span className="text-sm text-text-secondary">{request.estimatedDuration} minutes</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Scheduled Time */}
      {request.scheduledFor && (
        <GlassCard className="!bg-primary/5 !border-primary/20">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary-deep shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Scheduled Call</p>
              <p className="text-xs text-text-secondary">{formatDateTime(request.scheduledFor)}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Preferred Dates */}
      {request.preferredDates && request.preferredDates.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-text-primary mb-2">Preferred Dates</h3>
          <div className="space-y-1.5">
            {request.preferredDates.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar size={12} className="text-muted shrink-0" />
                {formatDateTime(d)}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Token Status */}
      {(request.tokenEscrowed || request.tokenRefunded) && (
        <GlassCard className="!p-3">
          <div className="flex items-center gap-2">
            <Coins size={14} className={request.tokenRefunded ? 'text-success' : 'text-accent'} />
            <span className="text-xs font-medium text-text-secondary">
              {request.tokenRefunded
                ? '1 MOMAI token refunded'
                : request.tokenEscrowed
                ? '1 MOMAI token escrowed'
                : ''}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Result Notes */}
      {request.resultNotes && (
        <GlassCard className="!border-success/20 !bg-success/5">
          <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Check size={16} className="text-success" /> Call Summary
          </h3>
          <p className="text-sm text-text-secondary">{request.resultNotes}</p>
        </GlassCard>
      )}

      {/* Transcript */}
      {hasTranscript && (
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <MessageSquare size={16} className="text-accent" /> Call Transcript
            </h3>
            <button onClick={copyTranscript} className="p-1.5 hover:bg-gray-100 rounded-lg">
              {copiedTranscript ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
            </button>
          </div>

          {request.transcript && request.transcript.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {request.transcript.map((entry, i) => (
                <div key={i} className={`flex gap-2 ${entry.role === 'ai' ? '' : 'justify-end'}`}>
                  {entry.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-accent" />
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
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-primary-deep" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : request.aiTranscript ? (
            <div className="bg-gray-50 rounded-xl p-3 max-h-80 overflow-y-auto">
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{request.aiTranscript}</p>
            </div>
          ) : null}
        </GlassCard>
      )}

      {/* Attempts */}
      {request.attempts && request.attempts.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <RotateCcw size={16} className="text-muted" />
            Attempts ({request.attempts.length}{request.maxAttempts ? `/${request.maxAttempts}` : ''})
          </h3>
          <div className="space-y-2">
            {request.attempts.map((attempt, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm text-text-primary flex items-center gap-1.5">
                    {attempt.method === 'call' ? <Phone size={12} /> : <MessageSquare size={12} />}
                    <span className="capitalize">{attempt.method}</span>
                    <span className="text-muted">via {attempt.service}</span>
                  </div>
                  {attempt.notes && (
                    <p className="text-xs text-text-secondary mt-0.5">{attempt.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={attempt.status} />
                  <div className="text-[10px] text-muted mt-0.5">{timeAgo(attempt.attemptedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Timestamps */}
      <GlassCard className="!p-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Created {timeAgo(request.createdAt)}</span>
          {request.completedAt && (
            <span>Completed {timeAgo(request.completedAt)}</span>
          )}
          {!request.completedAt && request.updatedAt !== request.createdAt && (
            <span>Updated {timeAgo(request.updatedAt)}</span>
          )}
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="space-y-3">
        {request.bookedAppointment && (
          <PrimaryButton onClick={() => navigate(`/appointments/${request.bookedAppointment}`)}>
            <span className="flex items-center justify-center gap-2">
              <Eye size={16} /> View Appointment
            </span>
          </PrimaryButton>
        )}

        {canReschedule && (
          <SecondaryButton
            onClick={() => navigate('/booking/new', {
              state: {
                providerName: request.providerName,
                providerPhone: request.providerPhone,
                requestDetails: request.requestDetails,
                serviceType: request.serviceType,
              },
            })}
          >
            <span className="flex items-center justify-center gap-2">
              <Calendar size={16} /> Reschedule
            </span>
          </SecondaryButton>
        )}

        {canRetry && (
          <SecondaryButton onClick={handleRetry} className="!text-accent !border-accent/30">
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Retry Same Provider
            </span>
          </SecondaryButton>
        )}

        {isActive && (
          <SecondaryButton onClick={handleCancel} disabled={isCancelling} className="!text-error !border-error/30">
            <span className="flex items-center justify-center gap-2">
              <XCircle size={16} /> {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </span>
          </SecondaryButton>
        )}

        {(request.status === 'failed' || request.status === 'cancelled') && !canRetry && (
          <PrimaryButton onClick={() => navigate('/booking/new')}>
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={16} /> New Booking
            </span>
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
