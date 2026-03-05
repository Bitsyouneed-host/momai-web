import { ArrowLeft, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import EmptyState from '../../components/ui/EmptyState';

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Notifications would be fetched from an API endpoint
  // For now, show empty state since web doesn't have push notifications
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
      </div>

      <GlassCard className="!bg-primary/5 !border-primary/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-primary-deep shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            Push notifications are available on the mobile app. Web notifications will be available in a future update.
          </p>
        </div>
      </GlassCard>

      <EmptyState
        icon={<Bell size={48} />}
        title="No Notifications"
        message="Your appointment reminders and booking updates will appear here"
      />
    </div>
  );
}
