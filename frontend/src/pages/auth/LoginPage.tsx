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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

/* ─── Role config ─────────────────────────────────────────────────── */
const ROLES: { role: Role; email: string; password: string; label: string; color: string; glow: string; description: string }[] = [
  {
    role: 'Admin',
    email: 'admin@gmail.com',
    password: 'Admin@123',
    label: 'Admin',
    color: 'from-[#007f87] to-[#003d40]',
    glow: 'shadow-[#007f87]/40',
    description: 'Full system access',
  },
  {
    role: 'Cashier',
    email: 'cashier@fojibook.com',
    password: 'Cashier@123',
    label: 'Cashier',
    color: 'from-[#0891b2] to-[#164e63]',
    glow: 'shadow-[#0891b2]/40',
    description: 'POS & Sales',
  },
  {
    role: 'Inventory Staff',
    email: 'inventory@fojibook.com',
    password: 'Inventory@123',
    label: 'Inventory',
    color: 'from-[#0e7490] to-[#083344]',
    glow: 'shadow-[#0e7490]/40',
    description: 'Stock management',
  },
];

/* ─── Feature pills shown on the left panel ──────────────────────── */
const FEATURES = [
  { icon: <BarChart3 className="w-4 h-4" />, text: 'Real-time Sales Dashboard' },
  { icon: <Package className="w-4 h-4" />, text: 'Smart Inventory Tracking' },
  { icon: <Layers className="w-4 h-4" />, text: 'Multi-role Access Control' },
  { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure Audit Trails' },
];

/* ─── Component ───────────────────────────────────────────────────── */
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (r: (typeof ROLES)[0]) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword(r.password);
    setLoginError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    const error = await login(email, password);
    setIsLoading(false);
    if (error) {
      setLoginError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020d0e] overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-10 xl:p-16 overflow-hidden">
        {/* Deep layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d40] via-[#02191c] to-[#020d0e]" />

        {/* Radial glow orbs */}
        <div className="absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full bg-[#007f87]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-[#005f6a]/20 blur-[100px] pointer-events-none" />

        {/* Animated floating dots grid */}
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

        {/* Top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007f87] to-[#003d40] flex items-center justify-center shadow-lg shadow-[#007f87]/30 border border-[#007f87]/40">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#007f87] uppercase">
                Foji Book Center
              </p>
              <p className="text-[10px] text-[#4d7a7e] tracking-wide">Peshawar · Est. 1998</p>
            </div>
          </div>
        </div>

        {/* Main headline */}
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

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 backdrop-blur-sm"
              >
                <span className="text-[#007f87] shrink-0">{f.icon}</span>
                <span className="text-xs text-[#a0c4c7] font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <p className="relative z-10 text-[10px] text-[#2a5558]">
          © 2025 Foji Book Center. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel — Sign-In Card ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#040f10] via-[#020d0e] to-[#040f10]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#007f87]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[420px] space-y-5">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007f87] to-[#003d40] flex items-center justify-center border border-[#007f87]/40">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">FOJI BOOK CENTER</span>
          </div>

          {/* Card */}
          <div className="bg-[#07181a]/80 border border-[#143d41]/80 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50 space-y-6">

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#f2fbfa] tracking-tight">Welcome back</h2>
              <p className="text-xs text-[#4d7a7e]">Sign in to access your dashboard</p>
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#4d7a7e] uppercase tracking-wider">Select Role</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const active = selectedRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`relative flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all duration-200 overflow-hidden ${
                        active
                          ? `bg-gradient-to-b ${r.color} border-[#007f87]/60 shadow-lg ${r.glow}`
                          : 'bg-[#040f10] border-[#143d41]/60 hover:border-[#007f87]/40 hover:bg-[#0a2224]'
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-0 bg-white/5 rounded-xl" />
                      )}
                      <span className={`text-[11px] font-semibold relative z-10 ${active ? 'text-white' : 'text-[#5a8c8f]'}`}>
                        {r.label}
                      </span>
                      <span className={`text-[9px] relative z-10 ${active ? 'text-white/70' : 'text-[#2a5558]'}`}>
                        {r.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#143d41]/60" />
              <span className="text-[10px] text-[#2a5558] font-medium uppercase tracking-widest">Credentials</span>
              <div className="flex-1 h-px bg-[#143d41]/60" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="login-username" className="block text-[11px] font-medium text-[#5a8c8f]">
                  Username / Staff ID
                </label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-[#007f87] ring-1 ring-[#007f87]/30 bg-[#040f10]'
                    : 'border-[#143d41]/80 bg-[#040f10] hover:border-[#1e5558]'
                }`}>
                  <span className="absolute left-3.5 text-[#4d7a7e] pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter username or staff ID"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-[#f2fbfa] placeholder-[#2a5558] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[11px] font-medium text-[#5a8c8f]">
                  Security Password
                </label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-[#007f87] ring-1 ring-[#007f87]/30 bg-[#040f10]'
                    : 'border-[#143d41]/80 bg-[#040f10] hover:border-[#1e5558]'
                }`}>
                  <span className="absolute left-3.5 text-[#4d7a7e] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
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

              {/* Error banner */}
              {loginError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5">
                  <span className="text-red-400 text-xs mt-0.5">⚠</span>
                  <p className="text-xs text-red-400 leading-relaxed">{loginError}</p>
                </div>
              )}

              {/* Submit */}
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
                    Sign in as {selectedRole}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer disclaimer */}
          <p className="text-center text-[10px] text-[#2a5558] leading-relaxed px-2">
            Backend connected — use your staff credentials to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};
