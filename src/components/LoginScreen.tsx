import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Lock,
  Mail,
  Package,
  Shield,
  User,
  UserPlus
} from 'lucide-react';
import { AppUser, UserRole } from '../types/inventory';
import { loginWithCredentials, registerAccount, DEMO_STAFF_ACCOUNTS } from '../utils/auth';

interface Props {
  onLoginSuccess: (user: AppUser) => void;
}

type AuthMode = 'signin' | 'signup';

const inputBase =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60';
const inputWithIcon = `${inputBase} pl-10`;
const inputWithAction = `${inputBase} pl-10 pr-11`;
const labelBase = 'mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300';
const primaryButton =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-700/20 transition-all hover:bg-amber-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

const FEATURES = [
  {
    icon: Package,
    title: 'Live Asset Register',
    detail: 'Quantities, conditions, and remarks stay up to date continuously.'
  },
  {
    icon: Building,
    title: 'Facility & Room Mapping',
    detail: 'Browse equipment and tools categorized room by room.'
  },
  {
    icon: FileSpreadsheet,
    title: 'Audit-Ready Exports',
    detail: 'Multi-sheet Excel workbooks and physical sign-off audit sheets.'
  },
  {
    icon: Shield,
    title: 'Role-Based Property Custody',
    detail: 'Admin schema control for Custodians and quick operate modes for Staff.'
  }
];

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Lower & uppercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least 1 number', met: /\d/.test(password) },
    { label: 'At least 1 symbol', met: /[^A-Za-z0-9]/.test(password) }
  ];
  const metRequirements = requirements.filter((item) => item.met).length;

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const fillDemoCredentials = (accountRole: 'admin' | 'staff' = 'admin') => {
    const target = DEMO_STAFF_ACCOUNTS.find((a) => a.role === accountRole) || DEMO_STAFF_ACCOUNTS[0];
    setMode('signin');
    setEmail(target.email);
    setPassword(target.pass);
    setErrorMessage(null);
    setSuccessMessage(`Demo ${target.name} credentials filled. Click Sign in to enter.`);
  };

  const handleForgotPassword = () => {
    setErrorMessage(null);
    setSuccessMessage(
      'Password resets are handled by the property custodian. Contact admin@km100.edu.ph for assistance.'
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your employee email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginWithCredentials(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid employee email or password.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during sign-in.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (metRequirements < requirements.length) {
      setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter them.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Please confirm that you are authorized KM100 personnel.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await registerAccount({
        fullName,
        email,
        password,
        role
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Unable to create your account. Please try again.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during sign-up.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 text-slate-900 dark:text-slate-100 selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-200">
      {/* Background Subtle Grid Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-40 [background-size:20px_20px]"
      />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* Left Institutional Brand Panel (Visible on Desktop/Tablet Landscape) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-8 lg:p-10 text-slate-900 dark:text-slate-100 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] opacity-[0.14] [background-size:18px_18px]"
          />
          <div className="relative">
            {/* Institution Logos & Accreditation Header */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="KM100 Logo"
                className="h-12 w-12 object-contain select-none"
              />
              <img
                src="/tesda_logo.png"
                alt="TESDA Logo"
                className="h-11 w-11 object-contain select-none"
              />
              <div className="pl-1">
                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  <span className="text-[#f78525]">KM</span>100 Skills &amp; Training Center, Inc.
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 size={10} /> TESDA Accredited
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Property Custody</span>
                </div>
              </div>
            </div>

            {/* Institutional Hero Copy */}
            <div className="mt-12 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                Institutional Inventory System
              </div>
              <h1 className="mt-3 text-2xl lg:text-3xl font-heading font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                Every tool &amp; asset accounted for.
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Institutional asset registration, room-by-room custody verification, and physical audit reporting across all training facilities.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="mt-8 space-y-3.5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex items-start gap-3 group">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700 group-hover:scale-105 transition-transform">
                      <Icon size={15} />
                    </span>
                    <span>
                      <span className="block text-xs sm:text-sm font-heading font-semibold text-slate-900 dark:text-white">
                        {feature.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {feature.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer Security Notice */}
          <div className="relative mt-8 pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Authorized personnel only &bull; Audit logged</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              v1.0 Operational
            </span>
          </div>
        </aside>

        {/* Right Form Panel */}
        <section className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile-only Branding Header */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img
                src="/logo.png"
                alt="KM100 Logo"
                className="h-10 w-10 object-contain select-none shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-heading font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  <span className="text-[#f78525]">KM</span>100 Skills &amp; Training Center
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Inventory Management System</p>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                {mode === 'signin' ? 'Sign in to your workspace' : 'Create your staff account'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {mode === 'signin'
                  ? 'Enter your employee credentials to access the inventory register.'
                  : 'Register authorized staff credentials to manage training facility equipment.'}
              </p>
            </div>

            {/* Authentication Tabs */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                aria-controls="signin-panel"
                onClick={() => switchMode('signin')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                aria-controls="signup-panel"
                onClick={() => switchMode('signup')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-slide-down"
              >
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                role="status"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300 animate-slide-down"
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Sign In Mode Form */}
            {mode === 'signin' ? (
              <div id="signin-panel" role="tabpanel">
                <form onSubmit={handleSignIn} className="space-y-3.5" noValidate>
                  <div>
                    <label htmlFor="signin-email" className={labelBase}>
                      Employee Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signin-email"
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="e.g. admin@km100.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label htmlFor="signin-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:text-amber-800 dark:hover:text-amber-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your account password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className={primaryButton}>
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to Workspace
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Demo Role Chips */}
                <div className="mt-5 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Evaluation Demo Accounts</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Quick-fill preconfigured test accounts:
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('admin')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-all hover:bg-amber-100 dark:hover:bg-amber-900/60 active:scale-[0.98] cursor-pointer"
                        title="Fill Property Custodian (Admin) credentials"
                      >
                        <Shield size={13} className="text-amber-600 dark:text-amber-400" />
                        <span>Custodian</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('staff')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-[0.98] cursor-pointer"
                        title="Fill Training Instructor (Staff) credentials"
                      >
                        <User size={13} className="text-slate-500 dark:text-slate-400" />
                        <span>Instructor</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Create Account Mode Form */
              <div id="signup-panel" role="tabpanel">
                <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
                  <div>
                    <label htmlFor="signup-name" className={labelBase}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Juan Dela Cruz"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-email" className={labelBase}>
                      Employee Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="e.g. jdelacruz@km100.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-role" className={labelBase}>
                      Institutional Account Role
                    </label>
                    <div className="relative">
                      <Shield
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        id="signup-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className={`${inputWithIcon} cursor-pointer appearance-none pr-9 dark:bg-slate-800`}
                      >
                        <option value="staff">Training Instructor / Staff</option>
                        <option value="admin">Property Custodian (Admin)</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className={labelBase}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="mt-2 flex gap-1" aria-hidden="true">
                      {requirements.map((item, index) => (
                        <span
                          key={item.label}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            index < metRequirements
                              ? metRequirements === requirements.length
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <ul className="mt-2 grid grid-cols-2 gap-1" aria-live="polite">
                      {requirements.map((item) => (
                        <li
                          key={item.label}
                          className={`flex items-center gap-1.5 text-[11px] ${
                            item.met ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.met ? (
                            <Check size={12} className="shrink-0" />
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label htmlFor="signup-confirm" className={labelBase}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showConfirmPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                    />
                    <span>
                      I confirm that I am authorized KM100 personnel and agree to the institutional acceptable use policy.
                    </span>
                  </label>

                  <button type="submit" disabled={isLoading} className={primaryButton}>
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Register Staff Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Institutional Footer Tag */}
          <div className="mt-6 pt-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
            KM100 Skills and Training Center, Inc. &bull; Official Inventory System
          </div>
        </section>
      </div>
    </div>
  );
};
