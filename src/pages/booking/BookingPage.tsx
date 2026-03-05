import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Plus, Phone, MessageSquare, Loader2, CheckCircle, XCircle, PhoneCall } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { bookingApi } from '../../api/booking';
import type { BookingRequest } from '../../types/booking';

export default function BookingPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bookingApi.list().then(({ data }) => {
      if (data.success && data.data) {
        setRequests(data.data);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const activeCount = requests.filter(
    (r) => ['pending', 'in-progress', 'calling'].includes(r.status)
  ).length;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'in-progress':
      case 'calling':
        return <Loader2 size={16} className="text-primary-deep animate-spin" />;
      case 'success':
      case 'completed':
        return <CheckCircle size={16} className="text-success" />;
      case 'failed':
      case 'no-answer':
      case 'cancelled':
        return <XCircle size={16} className="text-error" />;
      case 'callback':
        return <PhoneCall size={16} className="text-warning" />;
      default:
        return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">MOM AI</h1>
        <button
          onClick={() => navigate('/booking/new')}
          className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* MOM ME Hero */}
      <button
        onClick={() => navigate('/booking/new')}
        className="w-full p-5 rounded-2xl bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <Wand2 size={28} />
          <div className="text-left">
            <div className="font-bold text-lg">MOM ME!</div>
            <div className="text-sm opacity-90">Find a provider & book automatically</div>
          </div>
        </div>
      </button>

      {/* Active bookings banner */}
      {activeCount > 0 && (
        <GlassCard className="!p-3 !bg-primary/10 border-primary/30">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-primary-deep" />
            <span className="text-sm font-medium text-primary-deep">
              {activeCount} booking{activeCount !== 1 ? 's' : ''} in progress
            </span>
          </div>
        </GlassCard>
      )}

      {/* Booking requests list */}
      {requests.length === 0 ? (
        <EmptyState
          icon={<Wand2 size={48} />}
          title="No Booking Requests"
          message="Use MOM ME to have AI book appointments for you automatically"
        />
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <GlassCard
              key={req._id}
              className="!p-4"
              onClick={() => navigate(`/booking/${req._id}`)}
            >
              <div className="flex items-center gap-3">
                {statusIcon(req.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">{req.providerName}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {req.contactMethod === 'call' ? (
                      <Phone size={10} className="text-muted" />
                    ) : (
                      <MessageSquare size={10} className="text-muted" />
                    )}
                    <span className="text-xs text-text-secondary">{req.serviceType || 'Appointment'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={req.status} />
                  <div className="text-[10px] text-muted mt-1">{timeAgo(req.createdAt)}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
