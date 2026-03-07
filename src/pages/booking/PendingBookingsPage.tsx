import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, Loader2, Phone, X, RotateCcw, Calendar, AlertCircle, MessageSquare,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { bookingApi } from '../../api/booking';
import type { BookingRequest } from '../../types/booking';

const activeStatuses = ['pending', 'in-progress', 'calling', 'voicemail', 'callback', 'no-answer'];

export default function PendingBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00');
  const [isActing, setIsActing] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingApi.list();
      if (data.success && data.data) {
        const raw = data.data;
        const all = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).bookingRequests as BookingRequest[]) || [];
        const active = all.filter((b) => activeStatuses.includes(b.status));
        const recent = all
          .filter((b) => !activeStatuses.includes(b.status))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setBookings([...active, ...recent]);
      }
    } catch { /* ignore */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    setIsActing(true);
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      setSelectedBooking(null);
      fetchBookings();
    } catch { toast.error('Failed to cancel'); } finally { setIsActing(false); }
  };

  const rescheduleBooking = async (id: string) => {
    if (!rescheduleDate) { toast.error('Select a date'); return; }
    setIsActing(true);
    try {
      const dt = new Date(`${rescheduleDate}T${rescheduleTime}`);
      await bookingApi.reschedule(id, { preferredDates: [dt.toISOString()] });
      toast.success('Booking rescheduled');
      setSelectedBooking(null);
      setShowReschedule(false);
      fetchBookings();
    } catch { toast.error('Failed to reschedule'); } finally { setIsActing(false); }
  };

  const retryBooking = (booking: BookingRequest) => {
    navigate('/booking/new', {
      state: {
        providerName: booking.providerName,
        providerPhone: booking.providerPhone,
        requestDetails: booking.requestDetails,
        serviceType: booking.serviceType,
      },
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const canCancel = (status: string) => activeStatuses.includes(status) && status !== 'calling';
  const canReschedule = (status: string) => ['pending', 'no-answer', 'voicemail', 'callback'].includes(status);
  const canRetry = (status: string) => ['failed', 'no-answer', 'voicemail'].includes(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Pending Bookings</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} />}
          title="No Pending Bookings"
          message="Your active and recent AI booking requests will appear here"
          action={
            <PrimaryButton onClick={() => navigate('/mom-me')} fullWidth={false} className="!py-3 !px-6 !from-accent !to-pink-500">
              MOM ME!
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <GlassCard key={b._id} className="!p-4" onClick={() => setSelectedBooking(b)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary truncate">{b.providerName}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  {b.requestDetails && (
                    <p className="text-xs text-text-secondary line-clamp-1">{b.requestDetails}</p>
                  )}
                  <p className="text-[10px] text-muted mt-1">{timeAgo(b.updatedAt)}</p>
                </div>
                {activeStatuses.includes(b.status) && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0 mt-2" />
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && !showReschedule && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedBooking.status} className="!text-sm !px-3 !py-1.5" />
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Provider Info */}
            <div>
              <h3 className="font-bold text-lg text-text-primary">{selectedBooking.providerName}</h3>
              {selectedBooking.providerPhone && (
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                  <Phone size={14} /> {selectedBooking.providerPhone}
                </p>
              )}
            </div>

            {/* Request Details */}
            {selectedBooking.requestDetails && (
              <GlassCard className="!p-3 !bg-gray-50">
                <p className="text-sm font-medium text-text-primary mb-1">Request</p>
                <p className="text-sm text-text-secondary">{selectedBooking.requestDetails}</p>
                {selectedBooking.serviceType && (
                  <p className="text-xs text-muted mt-1">Type: {selectedBooking.serviceType}</p>
                )}
              </GlassCard>
            )}

            {/* Result Notes */}
            {selectedBooking.resultNotes && (
              <GlassCard className="!p-3 !bg-success/5 !border-success/20">
                <p className="text-sm font-medium text-text-primary mb-1">Result</p>
                <p className="text-sm text-text-secondary">{selectedBooking.resultNotes}</p>
              </GlassCard>
            )}

            {/* Transcript */}
            {selectedBooking.transcript && selectedBooking.transcript.length > 0 && (
              <div>
                <p className="text-sm font-medium text-text-primary mb-2 flex items-center gap-1">
                  <MessageSquare size={14} /> Call Transcript
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-3">
                  {selectedBooking.transcript.map((t, i) => (
                    <div key={i} className={`text-xs ${t.role === 'ai' ? 'text-accent' : 'text-text-primary'}`}>
                      <span className="font-semibold">{t.role === 'ai' ? 'AI Agent' : 'Provider'}:</span>{' '}
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {canReschedule(selectedBooking.status) && (
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setRescheduleDate(tomorrow.toISOString().split('T')[0]);
                    setShowReschedule(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-warning/10 text-warning font-medium text-sm"
                >
                  <Calendar size={16} /> Reschedule
                </button>
              )}
              {canRetry(selectedBooking.status) && (
                <button
                  onClick={() => retryBooking(selectedBooking)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/10 text-accent font-medium text-sm"
                >
                  <RotateCcw size={16} /> Retry Same Provider
                </button>
              )}
              {selectedBooking.bookedAppointment && (
                <PrimaryButton onClick={() => { setSelectedBooking(null); navigate(`/appointments/${selectedBooking.bookedAppointment}`); }}>
                  View Appointment
                </PrimaryButton>
              )}
              {canCancel(selectedBooking.status) && (
                <button
                  onClick={() => cancelBooking(selectedBooking._id)}
                  disabled={isActing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-error font-medium text-sm hover:bg-red-50"
                >
                  <AlertCircle size={16} /> Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowReschedule(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-text-primary">Reschedule Booking</h3>
            <p className="text-sm text-text-secondary">{selectedBooking.providerName}</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-primary/15 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <PrimaryButton onClick={() => rescheduleBooking(selectedBooking._id)} isLoading={isActing}>
              Confirm Reschedule
            </PrimaryButton>
            <button onClick={() => setShowReschedule(false)} className="w-full text-center text-sm text-muted py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
