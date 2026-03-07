import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Phone, Loader2, Trash2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { appointmentsApi } from '../../api/appointments';
import type { Appointment } from '../../types/appointment';

type Filter = 'upcoming' | 'past' | 'all';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    appointmentsApi.list().then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).appointments as Appointment[]) || [];
        setAppointments(list);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const now = new Date();
  const filtered = appointments.filter((a) => {
    if (filter === 'upcoming') return new Date(a.startTime) >= now && a.status !== 'cancelled';
    if (filter === 'past') return new Date(a.startTime) < now || a.status === 'cancelled';
    return true;
  }).sort((a, b) => {
    if (filter === 'past') return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const d = new Date(apt.startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === tomorrow.toDateString()) label = 'Tomorrow';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (!acc[label]) acc[label] = [];
    acc[label].push(apt);
    return acc;
  }, {});

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this appointment?')) return;
    try {
      await appointmentsApi.delete(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      // ignore
    }
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
        <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
        <button
          onClick={() => navigate('/appointments/new')}
          className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'past', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-white/80 text-text-secondary border border-primary/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title={`No ${filter} appointments`}
          message={filter === 'upcoming' ? 'Book an appointment to get started' : 'Your past appointments will appear here'}
        />
      ) : (
        Object.entries(grouped).map(([date, apts]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-text-secondary mb-2 px-1">{date}</h3>
            <div className="space-y-2">
              {apts.map((apt) => (
                <GlassCard
                  key={apt._id}
                  className="!p-4"
                  onClick={() => navigate(`/appointments/${apt._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-[50px] text-center">
                      <div className="text-sm font-semibold text-text-primary">{formatTime(apt.startTime)}</div>
                    </div>
                    <div className={`w-1 h-10 rounded-full ${
                      apt.status === 'cancelled' ? 'bg-error' :
                      apt.status === 'completed' ? 'bg-gray-300' : 'bg-success'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary truncate">{apt.title}</div>
                      {apt.providerName && (
                        <div className="text-xs text-text-secondary truncate">{apt.providerName}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {apt.bookingMethod !== 'manual' && (
                        <Phone size={12} className="text-accent" />
                      )}
                      <StatusBadge status={apt.status} />
                      <button
                        onClick={(e) => handleDelete(apt._id, e)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} className="text-muted hover:text-error" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
