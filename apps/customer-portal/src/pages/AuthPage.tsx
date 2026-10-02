import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Phone, User, CheckCircle2 } from 'lucide-react';
import { api, useToast } from '@queuesmart/shared';
import { useCustomerStore } from '../store/useCustomerStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('citizen@queuesmart.dev');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useCustomerStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ emailOrPhone, password });
        if (res.success && res.data) {
          setUser(res.data.user);
          showToast('success', `Welcome back, ${res.data.user.name}!`, 'Signed In');
          navigate(from, { replace: true });
        } else {
          showToast('error', res.error?.message || 'Invalid credentials', 'Login Failed');
        }
      } else {
        const res = await api.register({ name, email, phone, password });
        if (res.success && res.data) {
          setUser(res.data.user);
          showToast('success', 'Account created! You can now join queues.', 'Welcome');
          navigate(from, { replace: true });
        } else {
          showToast('error', res.error?.message || 'Registration failed', 'Error');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login({ emailOrPhone: 'citizen@queuesmart.dev', password: 'password123' });
      if (res.success && res.data) {
        setUser(res.data.user);
        showToast('success', 'Logged in as Demo Citizen (Priya Sharma)', 'Demo Access');
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10 pb-20 px-4 font-sans">
      <div className="text-center mb-6">
        <div className="w-10 h-10 mx-auto rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-sm shadow-sm mb-3">
          <div className="w-4 h-4 border-2 border-white rounded-[3px] rotate-45" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] dark:text-white font-newsreader">
          {isLogin ? 'Citizen Sign In' : 'Create Citizen Account'}
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Access your live queue tokens, medical slots, and SMS reminders.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E5E7EB] dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
              isLogin
                ? 'text-[#0F4C5C] dark:text-teal-400 border-b-2 border-[#0F4C5C] dark:border-teal-400'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
              !isLogin
                ? 'text-[#0F4C5C] dark:text-teal-400 border-b-2 border-[#0F4C5C] dark:border-teal-400'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
              Email or Mobile
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={isLogin ? emailOrPhone : email}
                onChange={(e) => (isLogin ? setEmailOrPhone(e.target.value) : setEmail(e.target.value))}
                placeholder="citizen@queuesmart.dev"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : isLogin ? 'Sign In to Portal' : 'Create Account'}
          </button>
        </form>

        <div className="p-4 bg-[#F7F7F5] dark:bg-slate-800/40 border-t border-[#E5E7EB] dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-xs font-medium text-[#0F4C5C] dark:text-teal-400 hover:underline"
          >
            Quick 1-Click Demo Login (Priya Sharma) →
          </button>
        </div>
      </div>
    </div>
  );
};
