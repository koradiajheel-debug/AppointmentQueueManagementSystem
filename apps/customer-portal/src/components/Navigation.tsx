import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ticket,
  User as UserIcon,
  LogOut,
  Bell,
  Home,
  Compass,
  Calendar,
  Layers,
  ExternalLink,
  Clock,
  Navigation as NavigationIcon,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Tv,
  Printer,
  Shield,
  Activity,
} from 'lucide-react';
import { ThemeToggle, LanguageSelector } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    user,
    activeTicket,
    setUser,
    notifications,
    isNavHidden,
    toggleNavHidden,
    isDrawerOpen,
    setIsDrawerOpen,
    toggleDrawer,
  } = useCustomerStore();
  const [showLiveBanner, setShowLiveBanner] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('queuesmart_token');
    localStorage.removeItem('queuesmart_user');
    setUser(null);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/book', label: 'Book', icon: Calendar },
    { path: '/join', label: 'Join', icon: Layers },
    { path: '/live-ticket', label: 'Live Ticket', icon: Ticket },
    { path: '/my-appointments', label: 'My Bookings', icon: Calendar },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Floating Trigger to Reveal Navigation Bar when tucked inside */}
      {isNavHidden && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <button
            type="button"
            onClick={toggleNavHidden}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#081c18]/95 text-[#5EEAD4] border border-[#163b34] backdrop-blur-md text-xs font-mono font-semibold shadow-2xl hover:scale-105 hover:bg-[#0c2a24] transition duration-200"
            title="Slide Navigation Bar Back Out"
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#10B981] animate-bounce" />
            <span>Show Navigation Bar</span>
          </button>
        </div>
      )}

      {/* Side Sliding Drawer Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Sliding Drawer (Goes inside & slides out on click) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#081412] text-[#1F2937] dark:text-[#E2E8F0] border-r border-[#E5E7EB] dark:border-white/10 shadow-2xl flex flex-col font-sans transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-[#20697B]">
              <div className="grid grid-cols-2 gap-[2px]">
                <div className="w-1.5 h-1.5 rounded-[1px] bg-[#10B981]" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-[#34D399]" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-[#34D399]" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-[#10B981]" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111827] dark:text-white font-newsreader">
              QueueSmart
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center gap-1 text-xs font-mono"
            title="Slide menu inside"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px]">Close</span>
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Active Token Callout inside drawer */}
          {activeTicket && (
            <Link
              to="/live-ticket"
              onClick={() => setIsDrawerOpen(false)}
              className="block p-3 rounded-2xl bg-[#081c18] border border-[#163b34] text-white space-y-1 hover:border-[#10B981] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#5EEAD4] font-bold">Live Ticket Active</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {activeTicket.tokenNo}
              </div>
              <div className="text-[11px] text-[#8EAAA2]">
                {activeTicket.serviceName} • ~{activeTicket.etaMinutes || 8} min wait
              </div>
            </Link>
          )}

          <div>
            <span className="px-3 text-[10px] uppercase tracking-wider text-[#6B7280] dark:text-[#63847C] font-mono font-semibold block mb-2">
              Citizen Navigation
            </span>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#EAF3F1] dark:bg-white/10 text-[#0F4C5C] dark:text-[#5EEAD4] font-semibold shadow-xs'
                        : 'text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F4C5C] dark:text-[#5EEAD4]' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <span className="px-3 text-[10px] uppercase tracking-wider text-[#6B7280] dark:text-[#63847C] font-mono font-semibold block mb-2">
              Account & Notifications
            </span>
            <nav className="space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
              >
                <UserIcon className="w-4 h-4 text-stone-400" />
                <span>My Profile & Transit Alerts</span>
              </Link>
              <Link
                to="/notifications"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-stone-400" />
                  <span>Notification Center</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981] text-[#081c18]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <span className="px-3 text-[10px] uppercase tracking-wider text-[#6B7280] dark:text-[#63847C] font-mono font-semibold block mb-2">
              Staff & Operations
            </span>
            <nav className="space-y-1">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#0F4C5C] dark:text-[#5EEAD4] bg-[#EAF3F1]/70 dark:bg-white/5 hover:bg-[#EAF3F1] transition"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4" />
                  <span>Admin & Staff Console</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#0F4C5C] dark:text-[#5EEAD4]" />
              </a>
              <a
                href="http://localhost:3001/display"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#4B5563] dark:text-stone-400 hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
              >
                <Tv className="w-4 h-4 text-stone-400" />
                <span>Lobby TV Display</span>
              </a>
              <a
                href="http://localhost:3001/kiosk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#4B5563] dark:text-stone-400 hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition"
              >
                <Printer className="w-4 h-4 text-stone-400" />
                <span>Self Check-in Kiosk</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Drawer User Footer */}
        <div className="p-3.5 border-t border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-black/20 flex items-center justify-between">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <Link
                to="/profile"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-[#111827] dark:text-white block truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280] dark:text-stone-400 block truncate">
                    {user.phone || user.email}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-[#0F4C5C] text-white text-xs font-semibold text-center shadow-xs"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      </aside>

      {/* TOP NAVIGATION BAR (Sliding inside & coming out) */}
      <div
        className={`sticky top-0 z-40 w-full transition-transform duration-300 ease-in-out ${
          isNavHidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
        }`}
      >
        {/* UNIFIED REAL-TIME TRANSIT NOTIFICATION BAR (If active ticket held) */}
        {activeTicket && showLiveBanner && (
          <div className="bg-[#081c18] border-b border-[#163b34] text-white px-4 py-2 text-xs select-none">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#5EEAD4] font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  TOKEN {activeTicket.tokenNo}
                </span>
                <span className="text-[#8EAAA2]">
                  {activeTicket.serviceName} • <strong className="text-white">1 person ahead</strong> (~{activeTicket.etaMinutes || 8} min wait)
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#7C9A92]">
                <Link
                  to="/live-ticket"
                  className="font-semibold text-[#5EEAD4] hover:underline flex items-center gap-1"
                >
                  Open Live Ticket →
                </Link>

                <button
                  type="button"
                  onClick={() => setShowLiveBanner(false)}
                  className="text-[#63847C] hover:text-white transition p-0.5"
                  title="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="w-full border-b border-[#E5E7EB] dark:border-white/10 bg-[#F7F7F5]/95 dark:bg-[#081412]/95 backdrop-blur-md select-none font-sans">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            
            {/* Left: Hamburger & Brand Identity */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Menu Drawer Toggle Button */}
              <button
                type="button"
                onClick={toggleDrawer}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/10 transition"
                aria-label="Open menu drawer"
                title="Slide out menu drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105 border border-[#20697B]">
                  <div className="grid grid-cols-2 gap-[2px]">
                    <div className="w-1.5 h-1.5 rounded-[1px] bg-[#10B981]" />
                    <div className="w-1.5 h-1.5 rounded-[1px] bg-[#34D399]" />
                    <div className="w-1.5 h-1.5 rounded-[1px] bg-[#34D399]" />
                    <div className="w-1.5 h-1.5 rounded-[1px] bg-[#10B981]" />
                  </div>
                </div>
                <span className="hidden sm:inline font-bold text-xl tracking-tight text-[#111827] dark:text-white font-newsreader">
                  QueueSmart
                </span>
              </Link>

              <span className="hidden sm:inline text-stone-300 dark:text-stone-700">/</span>
              <span className="hidden sm:inline text-xs font-medium text-[#6B7280] dark:text-[#7C9A92]">
                Main Branch - Vile Parle
              </span>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#EBECE8]/70 dark:bg-white/5 p-1 rounded-full border border-[#DCDED9] dark:border-white/10">
              {navLinks.slice(0, 4).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white dark:bg-stone-800 text-[#0F4C5C] dark:text-[#5EEAD4] shadow-xs font-semibold'
                        : 'text-[#4B5563] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Live Token Pill in Nav if active */}
              {activeTicket && (
                <Link
                  to="/live-ticket"
                  className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#081c18] text-[#5EEAD4] text-xs font-mono font-semibold border border-emerald-500/30 hover:bg-[#0c2823] transition"
                >
                  <Ticket className="w-3 h-3 text-[#10B981]" />
                  <span>{activeTicket.tokenNo}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                </Link>
              )}

              {/* Direct Switch to Admin Console */}
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D1D5DB] dark:border-white/10 bg-white dark:bg-white/5 text-[#374151] dark:text-stone-300 text-xs font-medium hover:border-[#0F4C5C] transition"
                title="Launch Staff & Admin Operations Console"
              >
                <span>Admin Console</span>
                <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
              </a>

              <LanguageSelector />
              <ThemeToggle />

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="p-2 rounded-full border border-[#E5E7EB] dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#4B5563] dark:text-stone-300 hover:bg-[#F3F4F6] transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                )}
              </Link>

              {/* Citizen Profile Avatar / Sign In */}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-stone-800 text-xs font-medium text-[#111827] dark:text-stone-200 hover:bg-[#F9FAFB] transition shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-[11px] font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline font-medium">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="p-1.5 rounded-full text-stone-400 hover:text-rose-500 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-medium transition shadow-xs"
                >
                  Sign In
                </Link>
              )}

              {/* Slide Inside / Hide Navigation Bar Button */}
              <button
                type="button"
                onClick={toggleNavHidden}
                className="p-2 rounded-full text-stone-400 hover:text-[#111827] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition"
                title="Slide navigation bar inside (Hide)"
                aria-label="Slide navigation inside"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/book', label: 'Book', icon: Calendar },
    { path: '/join', label: 'Join', icon: Layers },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
      <div className="flex items-center justify-around py-2 px-3 rounded-full bg-[#081c18]/95 text-white backdrop-blur-lg border border-[#163b34] shadow-2xl">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-full text-[10px] font-medium transition ${
                isActive ? 'text-[#5EEAD4] font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
