import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Trash2, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import EmptyState from '../../components/ui/EmptyState';
import client from '../../api/client';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: { providerName?: string; appointmentId?: string; bookingId?: string };
  createdAt: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await client.get('/users/me/notifications');
      if (data.success && data.data) {
        const raw = data.data;
        const list = Array.isArray(raw) ? raw : (raw as Record<string, unknown>).notifications as Notification[] || [];
        setNotifications(list);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await client.put('/users/me/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      await client.delete('/users/me/notifications');
      setNotifications([]);
    } catch { /* ignore */ }
  };

  const markRead = async (id: string) => {
    try {
      await client.put(`/users/me/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
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

  const typeIcon = (type: string) => {
    const colors: Record<string, string> = {
      booking: 'bg-accent/15 text-accent',
      appointment: 'bg-primary/15 text-primary-deep',
      subscription: 'bg-success/15 text-success',
      system: 'bg-warning/15 text-warning',
    };
    return colors[type] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">Notifications</h1>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="p-2 hover:bg-white/50 rounded-xl text-primary-deep"
              title="Mark all read"
            >
              <Check size={18} />
            </button>
            <button
              onClick={clearAll}
              className="p-2 hover:bg-red-50 rounded-xl text-error"
              title="Clear all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title="No Notifications"
          message="Your appointment reminders and booking updates will appear here"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <GlassCard
              key={n._id}
              className={`!p-4 ${!n.read ? '!border-primary/30 !bg-primary/5' : ''}`}
              onClick={() => {
                if (!n.read) markRead(n._id);
                if (n.data?.appointmentId) navigate(`/appointments/${n.data.appointmentId}`);
                else if (n.data?.bookingId) navigate(`/booking/${n.data.bookingId}`);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${typeIcon(n.type)}`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-text-primary truncate`}>
                      {n.title}
                    </span>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{n.message}</p>
                  {n.data?.providerName && (
                    <p className="text-xs text-muted mt-0.5">{n.data.providerName}</p>
                  )}
                  <p className="text-[10px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
