import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Package,
  BarChart3,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: <BarChart3 className="w-4 h-4" />, text: 'Real-time Sales Dashboard' },
  { icon: <Package className="w-4 h-4" />, text: 'Smart Inventory Tracking' },
  { icon: <Layers className="w-4 h-4" />, text: 'Multi-role Access Control' },
  { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure Audit Trails' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      if (!response.ok) {
        let errText = 'Invalid credentials or login failed.';
        try {
          const errData = await response.json();
          if (errData && errData.message) errText = errData.message;
        } catch {
          // Response was not JSON
        }
        throw new Error(errText);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (data.token) {
        localStorage.setItem('foji_auth_token', data.token);
      }

      const authenticatedUser = data.user || {
        id: '1',
        name: trimmedEmail.charAt(0).toUpperCase() + trimmedEmail.slice(1),
        email: trimmedEmail,
        role: 'Admin',
      };

      const success = login(authenticatedUser);
      if (success) {
        navigate('/');
      } else {
        throw new Error('Could not establish session for user role.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setErrorMessage('Cannot connect to backend server on port 8000. Please ensure the Express server is running (npm start in backend).');
      } else {
        setErrorMessage(
          err.message || 'Login failed. Please check your credentials and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020d0e] overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-10 xl:p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d40] via-[#02191c] to-[#020d0e]" />
        <div className="absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full bg-[#007f87]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-[#005f6a]/20 blur-[100px] pointer-events-none" />

        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#007f87]/10 animate-pulse"
              style={{
                width: `${4 + (i % 5) * 2}px`,
                height: `${4 + (i % 5) * 2}px`,
                top: `${(i * 137.5) % 100}%`,
                left: `${(i * 89.3) % 100}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${2.5 + (i % 4) * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007f87] to-[#003d40] flex items-center justify-center shadow-lg shadow-[#007f87]/30 border border-[#007f87]/40">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#007f87] uppercase">Foji Book Center</p>
              <p className="text-[10px] text-[#4d7a7e] tracking-wide">Peshawar · Est. 1998</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#007f87]/10 border border-[#007f87]/25 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007f87] animate-pulse" />
              <span className="text-[11px] font-medium text-[#5ecbd1] tracking-wide">POS System v2.0</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Manage your store
              <br />
              <span className="bg-gradient-to-r from-[#007f87] to-[#5ecbd1] bg-clip-text text-transparent">
                smarter &amp; faster
              </span>
            </h1>
            <p className="text-sm text-[#5a8c8f] max-w-sm leading-relaxed">
              A complete retail management platform for books &amp; stationery — inventory, POS, reports, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 backdrop-blur-sm">
                <span className="text-[#007f87] shrink-0">{f.icon}</span>
                <span className="text-xs text-[#a0c4c7] font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-[#2a5558]">© 2025 Foji Book Center. All rights reserved.</p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#040f10] via-[#020d0e] to-[#040f10]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#007f87]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[420px] space-y-5">
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007f87] to-[#003d40] flex items-center justify-center border border-[#007f87]/40">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">FOJI BOOK CENTER</span>
          </div>

          <div className="bg-[#07181a]/80 border border-[#143d41]/80 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#f2fbfa] tracking-tight">Welcome back</h2>
              <p className="text-xs text-[#4d7a7e]">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="login-username" className="block text-[11px] font-medium text-[#5a8c8f]">Username / Staff ID</label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-[#007f87] ring-1 ring-[#007f87]/30 bg-[#040f10]'
                    : 'border-[#143d41]/80 bg-[#040f10] hover:border-[#1e5558]'
                }`}>
                  <span className="absolute left-3.5 text-[#4d7a7e] pointer-events-none"><User className="w-4 h-4" /></span>
                  <input
                    id="login-username"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email "
                    required
                    autoComplete="email"
                    className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-[#f2fbfa] placeholder-[#2a5558] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[11px] font-medium text-[#5a8c8f]">Security Password</label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-[#007f87] ring-1 ring-[#007f87]/30 bg-[#040f10]'
                    : 'border-[#143d41]/80 bg-[#040f10] hover:border-[#1e5558]'
                }`}>
                  <span className="absolute left-3.5 text-[#4d7a7e] pointer-events-none"><Lock className="w-4 h-4" /></span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent pl-10 pr-11 py-2.5 text-sm text-[#f2fbfa] placeholder-[#2a5558] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 text-[#4d7a7e] hover:text-[#007f87] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-900/30 border border-rose-700/50">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300">{errorMessage}</p>
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#007f87] to-[#005f6a] hover:from-[#009aa4] hover:to-[#007f87] text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-[#007f87]/25 border border-[#009aa4]/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] text-[#2a5558] leading-relaxed px-2">
            Connect your Express.js + MongoDB backend to enable authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
