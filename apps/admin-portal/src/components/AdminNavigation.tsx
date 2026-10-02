import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  ListOrdered,
  CalendarDays,
  Settings2,
  BarChart3,
  Activity,
  Tv,
  Printer,
  LogOut,
  Search,
  ExternalLink,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { ThemeToggle, LanguageSelector } from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const {
    currentUser,
    isSidebarOpen,
    setSidebarOpen,
    setCurrentUser,
  } = useAdminStore();

  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/operations', label: 'Console', icon: Terminal },
    { to: '/queue', label: 'Queue', icon: ListOrdered },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/manage', label: 'Manage & Places', icon: Settings2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Staff Profile', icon: UserIcon },
    { to: '/health', label: 'Health', icon: Activity },
  ];

  const displayLinks = [
    { to: '/display', label: 'Display', icon: Tv },
    { to: '/kiosk', label: 'Kiosk', icon: Printer },
  ];

  const handleLogout = () => {
    localStorage.removeItem('queuesmart_admin_token');
    localStorage.removeItem('queuesmart_admin_user');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sliding Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#081412] text-[#1F2937] dark:text-[#E2E8F0] flex flex-col border-r border-[#E5E7EB] dark:border-white/10 shrink-0 select-none font-sans transition-all duration-300 ease-in-out lg:static ${
          isSidebarOpen
            ? 'translate-x-0 shadow-2xl lg:w-60 lg:opacity-100'
            : '-translate-x-full lg:w-0 lg:-translate-x-full lg:opacity-0 lg:border-none lg:overflow-hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
          <Link
            to="/"
            onClick={closeSidebarOnMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] border border-[#20697B] flex items-center justify-center text-white font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-[3px] rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111827] dark:text-white font-newsreader">
              QueueSmart
            </span>
          </Link>

          {/* Slide Inside Button (Desktop & Mobile) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
            aria-label="Slide navigation inside"
            title="Slide navigation inside"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeSidebarOnMobile}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold shadow-xs'
                        : 'text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#0F4C5C] dark:text-[#5EEAD4]' : 'text-[#6B7280] dark:text-stone-400'
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <span className="px-3 text-[10px] uppercase tracking-wider text-[#6B7280] dark:text-[#63847C] font-mono font-semibold block mb-2">
              Public Terminals
            </span>
            <nav className="space-y-1">
              {displayLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    target="_blank"
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold shadow-xs'
                        : 'text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#6B7280] dark:text-stone-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Footer with Profile Link */}
        <div className="p-3.5 border-t border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-black/20 flex items-center justify-between">
          <Link
            to="/profile"
            onClick={closeSidebarOnMobile}
            className="flex items-center gap-2.5 flex-1 min-w-0 group hover:opacity-85 transition"
            title="View Profile Settings"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F4C5C] text-white font-bold text-xs flex items-center justify-center border border-[#20697B] shadow-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'R'}
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-semibold text-[#111827] dark:text-white block truncate group-hover:text-[#0F4C5C] dark:group-hover:text-[#5EEAD4]">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Dr. Rajesh'}
              </span>
              <span className="text-[10px] font-mono text-[#6B7280] dark:text-stone-400 block uppercase">
                {currentUser?.role || 'Staff'} • Profile
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-rose-600 hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export const AdminHeader: React.FC = () => {
  const [timeStr, setTimeStr] = useState('10:42 AM');
  const [searchVal, setSearchVal] = useState('');
  const [showLiveBanner, setShowLiveBanner] = useState(true);
  const { currentUser, toggleSidebar, isSidebarOpen } = useAdminStore();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* UNIFIED ADMIN TELEMETRY NOTIFICATION BAR */}
      {showLiveBanner && (
        <div className="bg-[#081c18] border-b border-[#163b34] text-white px-4 sm:px-6 py-2.5 text-xs select-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#5EEAD4] font-mono text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                DISPATCH TELEMETRY
              </span>
              <span className="text-[#8EAAA2]">
                Counter 02 serving <strong className="text-white font-mono">A-102</strong> • Pacing SLA: <strong className="text-[#10B981]">94% On-Target</strong> • 24 in queue
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#7C9A92]">
              <Link
                to="/operations"
                className="font-semibold text-[#5EEAD4] hover:underline flex items-center gap-1"
              >
                Go to Counter Console →
              </Link>

              <button
                type="button"
                onClick={() => setShowLiveBanner(false)}
                className="text-[#63847C] hover:text-white transition p-0.5"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP ADMIN HEADER BAR */}
      <header className="h-16 border-b border-[#E5E7EB] dark:border-white/10 bg-[#F7F7F5]/95 dark:bg-[#081412]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none font-sans">
        <div className="flex items-center gap-3">
          {/* Slide Inside / Out Toggle Button (All screen sizes) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-[#374151] dark:text-stone-300 hover:bg-[#E5E7EB] dark:hover:bg-white/10 transition"
            aria-label="Toggle navigation bar"
            title={isSidebarOpen ? "Slide navigation bar inside" : "Slide navigation bar out"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#111827] dark:text-white font-newsreader">
              QueueSmart
            </span>
            <span className="hidden sm:inline text-[#D1D5DB] dark:text-stone-700">/</span>
            <span className="hidden sm:inline text-xs text-[#6B7280] dark:text-[#7C9A92] font-medium truncate max-w-[140px] md:max-w-none">
              Main Branch - Vile Parle
            </span>
          </div>

          {/* Search Input matching customer portal */}
          <div className="hidden md:flex items-center relative ml-3">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appointments, tokens..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 text-xs text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] w-48 shadow-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Real-time Clock */}
          <div className="hidden sm:block font-mono text-xs text-[#6B7280] dark:text-stone-400 font-medium">
            {timeStr}
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>

          {/* Switch to customer view link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D1D5DB] dark:border-white/10 bg-white dark:bg-white/5 text-[#374151] dark:text-stone-300 text-xs font-medium hover:border-[#0F4C5C] transition shadow-xs"
          >
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
          </a>

          <LanguageSelector />
          <ThemeToggle />

          {/* User avatar circle linking to profile */}
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-xs font-bold shadow-sm border border-[#20697B] hover:ring-2 hover:ring-[#0F4C5C]/40 transition"
            title="Operator Profile"
          >
            {currentUser?.name ? currentUser.name.charAt(0) : 'R'}
          </Link>
        </div>
      </header>
    </>
  );
};
