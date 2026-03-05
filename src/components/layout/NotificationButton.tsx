import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

export default function NotificationButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow"
    >
      <Bell size={16} className="text-primary-deep" />
    </button>
  );
}
