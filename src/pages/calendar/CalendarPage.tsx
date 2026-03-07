import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Phone, Calendar } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { appointmentsApi } from '../../api/appointments';
import type { Appointment } from '../../types/appointment';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    appointmentsApi.list({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }).then(({ data }) => {
      if (data.success && data.data) {
        const raw = data.data;
        const list = (Array.isArray(raw) ? raw : (raw as unknown as Record<string, unknown>).appointments as Appointment[]) || [];
        setAppointments(list);
      }
    }).catch(() => {});
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const appointmentDates = useMemo(() => {
    const dates = new Set<string>();
    appointments.forEach((a) => {
      const d = new Date(a.startTime);
      dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return dates;
  }, [appointments]);

  const selectedDateAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const d = new Date(a.startTime);
        return d.getFullYear() === selectedDate.getFullYear()
          && d.getMonth() === selectedDate.getMonth()
          && d.getDate() === selectedDate.getDate();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [appointments, selectedDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const isToday = (day: number) => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
  };

  const isSelected = (day: number) => {
    return year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate();
  };

  const hasAppointment = (day: number) => appointmentDates.has(`${year}-${month}-${day}`);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
        <div className="flex gap-2">
          <button onClick={goToday} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary-deep text-xs font-medium">
            Today
          </button>
          <button
            onClick={() => navigate('/appointments/new')}
            className="p-2 bg-primary/15 hover:bg-primary/25 rounded-xl transition-colors"
          >
            <Plus size={20} className="text-primary-deep" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h2 className="font-semibold text-text-primary">{monthName}</h2>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`relative aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${
                  isSelected(day)
                    ? 'bg-accent text-white font-bold'
                    : isToday(day)
                    ? 'bg-primary/15 text-primary-deep font-semibold'
                    : 'hover:bg-gray-100 text-text-primary'
                }`}
              >
                {day}
                {hasAppointment(day) && (
                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    isSelected(day) ? 'bg-white' : 'bg-accent'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Date Appointments */}
      <div>
        <h3 className="font-semibold text-text-primary mb-2">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {selectedDateAppointments.length === 0 ? (
          <GlassCard>
            <div className="text-center py-4">
              <Calendar size={24} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-text-secondary">No appointments</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {selectedDateAppointments.map((apt) => (
              <GlassCard key={apt._id} className="!p-4" onClick={() => navigate(`/appointments/${apt._id}`)}>
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-sm font-semibold text-text-primary">{formatTime(apt.startTime)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">{apt.title}</div>
                    {apt.providerName && (
                      <div className="text-xs text-text-secondary truncate">{apt.providerName}</div>
                    )}
                  </div>
                  {apt.bookingMethod !== 'manual' && (
                    <Phone size={14} className="text-accent shrink-0" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
