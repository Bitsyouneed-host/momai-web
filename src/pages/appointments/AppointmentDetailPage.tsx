import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Phone, Clock, Loader2, Repeat } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import { appointmentsApi } from '../../api/appointments';
import type { Appointment } from '../../types/appointment';

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apt, setApt] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    appointmentsApi.get(id).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const item = (raw as unknown as Record<string, unknown>).appointment || raw;
        setApt(item as Appointment);
      }
    }).catch(() => toast.error('Failed to load appointment'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this appointment?')) return;
    try {
      await appointmentsApi.cancel(id);
      toast.success('Appointment cancelled');
      navigate('/appointments');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this appointment permanently?')) return;
    try {
      await appointmentsApi.delete(id);
      toast.success('Appointment deleted');
      navigate('/appointments');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!apt) {
    return <div className="text-center py-20 text-text-secondary">Appointment not found</div>;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary flex-1 truncate">{apt.title}</h1>
        <StatusBadge status={apt.status} />
      </div>

      {/* Date & Time */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-3">
          <Clock size={18} className="text-primary-deep" />
          <div>
            <div className="font-medium text-text-primary">{formatDate(apt.startTime)}</div>
            <div className="text-sm text-text-secondary">
              {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
            </div>
          </div>
        </div>
        {apt.isRecurring && apt.recurrence && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <Repeat size={14} />
            <span className="capitalize">
              {apt.recurrence.frequency}{apt.recurrence.interval > 1 ? ` (every ${apt.recurrence.interval})` : ''}
            </span>
          </div>
        )}
      </GlassCard>

      {/* Provider */}
      {(apt.providerName || apt.providerPhone || apt.providerAddress) && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Provider</h3>
          {apt.providerName && (
            <div className="font-medium text-text-primary">{apt.providerName}</div>
          )}
          {apt.providerPhone && (
            <div className="flex items-center gap-2 mt-1">
              <Phone size={14} className="text-muted" />
              <a href={`tel:${apt.providerPhone}`} className="text-sm text-primary-deep hover:underline">
                {apt.providerPhone}
              </a>
            </div>
          )}
          {apt.providerAddress && (
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={14} className="text-muted" />
              <span className="text-sm text-text-secondary">{apt.providerAddress}</span>
            </div>
          )}
        </GlassCard>
      )}

      {/* Description */}
      {apt.description && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Description</h3>
          <p className="text-sm text-text-primary">{apt.description}</p>
        </GlassCard>
      )}

      {/* Notes */}
      {apt.notes && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Notes</h3>
          <p className="text-sm text-text-primary">{apt.notes}</p>
        </GlassCard>
      )}

      {/* Actions */}
      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
        <div className="space-y-3">
          <SecondaryButton onClick={handleCancel} className="!text-warning !border-warning/30">
            Cancel Appointment
          </SecondaryButton>
          <SecondaryButton onClick={handleDelete} className="!text-error !border-error/30">
            Delete
          </SecondaryButton>
        </div>
      )}
      {(apt.status === 'cancelled' || apt.status === 'completed') && (
        <PrimaryButton onClick={handleDelete}>
          Delete Appointment
        </PrimaryButton>
      )}
    </div>
  );
}
