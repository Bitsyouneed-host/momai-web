import { NavLink } from 'react-router-dom';
import { Home, Search, Wand2, Calendar, Settings, Users } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/providers', icon: Users, label: 'Providers' },
  { to: '/booking', icon: Wand2, label: 'MOM AI' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function TabBar() {
  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                  isActive ? 'text-primary-deep' : 'text-muted'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white/95 backdrop-blur-md border-r border-gray-200 flex-col z-40">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-text-primary">MOM AI</h1>
        </div>
        <div className="flex-1 py-4 space-y-1 px-3">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary-deep font-semibold'
                    : 'text-text-secondary hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
