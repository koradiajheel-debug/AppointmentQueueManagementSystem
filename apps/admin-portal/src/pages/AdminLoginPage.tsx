import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, useToast } from '@queuesmart/shared';
import { useAdminStore } from '../store/useAdminStore';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@queuesmart.dev');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'ADMIN' | 'STAFF' | 'DOCTOR'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);

  const { setCurrentUser } = useAdminStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.adminLogin({ email, password, role });
      if (res.success && res.data) {
        if (res.data.user.role === 'CITIZEN') {
          showToast('error', 'Unauthorized. Citizen tokens cannot access Admin Operations.', 'Access Denied');
          return;
        }

        setCurrentUser(res.data.user);
        showToast('success', `Welcome back, ${res.data.user.name} (${res.data.user.role})`, 'Authenticated');
        navigate('/');
      } else {
        showToast('error', res.error?.message || 'Invalid credentials', 'Login Failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: 'ADMIN' | 'STAFF' | 'DOCTOR') => {
    const targetEmail = demoRole === 'ADMIN' ? 'admin@queuesmart.dev' : demoRole === 'DOCTOR' ? 'doctor@queuesmart.dev' : 'staff@queuesmart.dev';
    setEmail(targetEmail);
    setRole(demoRole);
    api.adminLogin({ email: targetEmail, password: 'password123', role: demoRole }).then((res) => {
      if (res.data) {
        setCurrentUser(res.data.user);
        showToast('success', `Signed in as Demo ${demoRole}: ${res.data.user.name}`, 'Demo Access');
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F7F5] dark:bg-[#081412] text-[#1F2937] dark:text-[#E8ECE9] font-sans relative overflow-hidden select-none">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-[#0F4C5C]/5 dark:bg-[#0F4C5C]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#0F4C5C] border border-[#20697B] flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-105">
            <div className="w-4 h-4 border-2 border-white rounded-[3px] rotate-45" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white font-newsreader">
            QueueSmart Operations
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7C9A92]">
            Staff Station & Facility Command Center
          </p>
        </div>

        <div className="bg-white dark:bg-[#091D19]/90 border border-[#E5E7EB] dark:border-[#173D35] rounded-3xl p-8 shadow-xs space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#4B5563] dark:text-[#7C9A92] mb-1 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] dark:border-[#173D35] bg-[#F9FAFB] dark:bg-[#061210] text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4B5563] dark:text-[#7C9A92] mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] dark:border-[#173D35] bg-[#F9FAFB] dark:bg-[#061210] text-xs font-mono text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4B5563] dark:text-[#7C9A92] mb-1 uppercase tracking-wider">
                Operator Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'STAFF')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] dark:border-[#173D35] bg-[#F9FAFB] dark:bg-[#061210] text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              >
                <option value="ADMIN">Administrator (Full Telemetry & Settings)</option>
                <option value="STAFF">Counter Staff (Queue Calling Terminal)</option>
                <option value="DOCTOR">Doctor (View Medical Reports)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-medium text-xs shadow-xs transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Console'}
            </button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#132E27] space-y-2">
            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#63847C] uppercase tracking-wider block text-center">
              Quick 1-Click Sandbox Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STAFF')}
                className="py-2.5 px-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] dark:bg-[#0C221D] dark:hover:bg-[#112E27] border border-[#E5E7EB] dark:border-[#173D35] text-[11px] font-mono text-[#0F4C5C] dark:text-[#5EEAD4] font-medium transition"
              >
                Staff (Counter)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('DOCTOR')}
                className="py-2.5 px-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] dark:bg-[#0C221D] dark:hover:bg-[#112E27] border border-[#E5E7EB] dark:border-[#173D35] text-[11px] font-mono text-[#0F4C5C] dark:text-[#5EEAD4] font-medium transition"
              >
                Doctor (Reports)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="py-2.5 px-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] dark:bg-[#0C221D] dark:hover:bg-[#112E27] border border-[#E5E7EB] dark:border-[#173D35] text-[11px] font-mono text-[#0F4C5C] dark:text-[#5EEAD4] font-medium transition"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
