import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import TabBar from './TabBar';
import FloatingSubscriptionBadge from './FloatingSubscriptionBadge';
import WalletDropdown from './WalletDropdown';
import NotificationButton from './NotificationButton';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';

export default function AppShell() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const { fetchStatus, fetchTokenBalance } = useSubscriptionStore();

  useEffect(() => {
    fetchUser();
    fetchStatus();
    fetchTokenBalance();
  }, [fetchUser, fetchStatus, fetchTokenBalance]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-top to-gradient-bottom">
      <TabBar />

      {/* Floating elements */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <FloatingSubscriptionBadge />
        <WalletDropdown />
        <NotificationButton />
      </div>

      {/* Main content */}
      <main className="md:ml-56 pb-20 md:pb-6 pt-14 md:pt-4 px-4 md:px-8 max-w-4xl md:max-w-none">
        <Outlet />
      </main>
    </div>
  );
}
