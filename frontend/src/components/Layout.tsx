import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, TrendingUp, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import MarketBadge from './MarketBadge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/loads', icon: Truck, label: 'Loads' },
  { to: '/predictions', icon: TrendingUp, label: 'Predictions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-navy-900 text-white">
      <div className="p-6 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <Truck className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold">TruckBiz</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Freight Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-slate-400 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-navy-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-navy-900">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <button
            className="md:hidden text-navy-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <MarketBadge market={(user?.market as 'USA' | 'EUROPE') || 'USA'} />
            <div className="text-sm font-medium text-navy-900">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
