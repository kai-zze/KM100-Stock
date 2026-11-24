import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Key,
  KeyRound,
  Lock,
  Mail,
  Package,
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { AppUser, UserRole } from "../types/inventory";
import {
  loginWithCredentials,
  registerAccount,
  sendPasswordResetEmail,
  completePasswordRecovery,
  getInstitutionalPasskeys,
} from "../utils/auth";
import { supabase } from "../utils/supabaseClient";

interface Props {
  onLoginSuccess: (user: AppUser) => void;
  initialMode?: AuthMode;
  onClearRecovery?: () => void;
}

type AuthMode = "signin" | "signup" | "forgot" | "reset";

const FEATURES = [
  {
    icon: Package,
    title: "Live Asset Register",
    detail: "Quantities, conditions, and remarks stay up to date continuously.",
  },
  {
    icon: Building,
    title: "Facility & Room Mapping",
    detail: "Browse equipment and tools categorized room by room.",
  },
  {
    icon: FileSpreadsheet,
    title: "Audit-Ready Exports",
    detail: "Multi-sheet Excel workbooks and physical sign-off audit sheets.",
  },
  {
    icon: Shield,
    title: "Role-Based Property Custody",
    detail:
      "Admin schema control for Custodians and quick operate modes for Staff.",
  },
];

export const LoginScreen: React.FC<Props> = ({
  onLoginSuccess,
  initialMode,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode || "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
    };
    if (isRoleDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRoleDropdownOpen]);
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }

    // Listen for Supabase password recovery event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setErrorMessage(null);
        setSuccessMessage(
          "Recovery session verified. Please choose a new password for your account.",
        );
      }
    });

    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setMode("reset");
      setErrorMessage(null);
      setSuccessMessage(
        "Recovery session verified. Please choose a new password for your account.",
      );
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [initialMode]);

  // Ensure password fields are completely empty on initial page mount or reload
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");

    // Counteract aggressive browser autofill cycles
    const clearTimer = setTimeout(() => {
      setPassword("");
      const passInput = document.getElementById(
        "signin-password",
      ) as HTMLInputElement | null;
      if (passInput) {
        passInput.value = "";
      }
    }, 100);

    return () => clearTimeout(clearTimer);
  }, []);

  const requirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
      required: true,
    },
    {
      label: "Lower & uppercase letters",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      required: true,
    },
    { label: "At least 1 number", met: /\d/.test(password), required: true },
    {
      label: "At least 1 symbol",
      met: /[^A-Za-z0-9]/.test(password),
      required: false,
    },
  ];
  const metRequirements = requirements.filter((item) => item.met).length;
  const mandatoryMet = requirements.filter(
    (item) => item.required && item.met,
  ).length;
  const totalMandatory = requirements.filter((item) => item.required).length;
  const allRequirementsMet = metRequirements === requirements.length;

  const getStrengthMeta = () => {
    if (!password)
      return {
        label: "",
        color: "bg-slate-200 dark:bg-slate-700",
        text: "text-slate-400",
      };
    if (metRequirements <= 1)
      return {
        label: "Weak",
        color: "bg-rose-500",
        text: "text-rose-600 dark:text-rose-400",
      };
    if (metRequirements === 2)
      return {
        label: "Fair",
        color: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
      };
    if (metRequirements === 3)
      return {
        label: "Good",
        color: "bg-amber-600",
        text: "text-amber-700 dark:text-amber-400",
      };
    return {
      label: "Strong",
      color: "bg-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setConfirmPassword("");
    setPasskey("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleForgotPassword = () => {
    switchMode("forgot");
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your employee email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await sendPasswordResetEmail(cleanEmail);
      if (res.success) {
        setSuccessMessage(
          `A password recovery link has been dispatched to ${cleanEmail}. Please check your inbox (and spam folder) and click the link to reset your password.`,
        );
      } else {
        setErrorMessage(
          res.error ||
            "Failed to dispatch recovery link. Please verify the email address.",
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An error occurred while requesting password reset.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (metRequirements < requirements.length) {
      setErrorMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter them.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await completePasswordRecovery(password);
      if (res.success && res.user) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(
          res.error ||
            "Could not reset password. Your recovery session may have expired.",
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update your password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your employee email and password.");
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
        setErrorMessage(res.error || "Invalid employee email or password.");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-in.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (mandatoryMet < totalMandatory) {
      setErrorMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, and numbers.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter them.");
      return;
    }
    if (!passkey.trim()) {
      setErrorMessage(
        role === "admin"
          ? "Please enter the official Custodian Authorization Passkey (e.g. KM100-ADMIN-2026)."
          : "Please enter the official KM100 Institutional Passkey (e.g. KM100-STAFF-2026).",
      );
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage(
        "Please confirm that you are authorized KM100 personnel.",
      );
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
        role,
        passkey: passkey.trim(),
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(
          res.error || "Unable to create your account. Please try again.",
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-up.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-slate-950 p-3 sm:p-6 text-slate-900 dark:text-slate-100 selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-200">
      {/* Architectural Background Dot-Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-30 [background-size:24px_24px]"
      />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 ring-1 ring-slate-900/5 dark:ring-white/5 lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* Left Institutional Brand Panel (Visible on Desktop/Tablet Landscape) */}
        <aside className="relative hidden flex-col justify-center overflow-hidden border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-8 lg:p-10 text-slate-900 dark:text-slate-100 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] opacity-[0.14] [background-size:18px_18px]"
          />
          <div className="relative">
            {/* Institution Header */}
            <div className="flex items-center gap-3">
              <picture className="shrink-0 flex items-center">
                <source srcSet="/logo-sm.webp" type="image/webp" />
                <img
                  src="/logo-sm.png"
                  alt="KM100 Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 object-contain select-none"
                />
              </picture>
              <div className="min-w-0">
                <h2 className="text-sm font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  <span className="text-amber-700 dark:text-amber-500">KM</span>
                  100 Skills &amp; Training Center, Inc.
                </h2>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Staff &amp; Custodian Portal
                </p>
              </div>
            </div>

            {/* Institutional Hero Copy */}
            <div className="mt-7 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 mb-3">
                Property Custody Platform
              </div>
              <h1 className="text-2xl sm:text-[28px] font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] text-balance">
                Every tool &amp; asset accounted for
              </h1>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Institutional asset registration, room-by-room custody
                verification, and physical audit reporting across all training
                facilities.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="mt-6 space-y-3.5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.title}
                    className="flex items-start gap-3 group"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs sm:text-sm font-heading font-bold tracking-tight text-slate-900 dark:text-white">
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
        </aside>

        {/* Right Form Panel */}
        <section className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          {/* Mobile-only Branding Header */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <picture className="shrink-0 flex items-center">
              <source srcSet="/logo-sm.webp" type="image/webp" />
              <img
                src="/logo-sm.png"
                alt="KM100 Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain select-none shrink-0"
              />
            </picture>
            <div className="min-w-0">
              <p className="text-sm font-heading font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                <span className="text-amber-700 dark:text-amber-500">KM</span>
                100 Skills &amp; Training Center
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Staff &amp; Custodian Portal
              </p>
            </div>
          </div>

          {/* Centered Form Wrapper - Optically balanced with left hero panel on desktop */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto lg:my-0 lg:pt-1">
            {/* Title & Subtitle */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === "signin" && "Sign in to your workspace"}
                {mode === "signup" && "Create your staff account"}
                {mode === "forgot" && "Reset your password"}
                {mode === "reset" && "Set a new password"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {mode === "signin" &&
                  "Enter your employee credentials to access the inventory register."}
                {mode === "signup" &&
                  "Register authorized staff credentials to manage training facility equipment."}
                {mode === "forgot" &&
                  "Enter your registered employee email to receive a secure Supabase recovery link."}
                {mode === "reset" &&
                  "Create a strong, secure password to restore access to your account."}
              </p>
            </div>

            {/* Authentication Tabs / Mode Navigation */}
            {mode === "signin" || mode === "signup" ? (
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  aria-controls="signin-panel"
                  onClick={() => switchMode("signin")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    mode === "signin"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <KeyRound
                    size={13}
                    className={
                      mode === "signin"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-slate-400"
                    }
                  />
                  <span>Sign in</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  aria-controls="signup-panel"
                  onClick={() => switchMode("signup")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    mode === "signup"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <UserPlus
                    size={13}
                    className={
                      mode === "signup"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-slate-400"
                    }
                  />
                  <span>Create account</span>
                </button>
              </div>
            ) : (
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                  {mode === "forgot" ? "Account Recovery" : "New Credentials"}
                </span>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-slide-down"
              >
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400"
                />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                role="status"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 p-3 text-xs text-slate-800 dark:text-slate-200 shadow-2xs animate-slide-down"
              >
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
                />
                <span className="leading-relaxed font-medium">
                  {successMessage}
                </span>
              </div>
            )}

            {/* Sign In Mode Form */}
            {mode === "signin" && (
              <div id="signin-panel" role="tabpanel">
                <form
                  onSubmit={handleSignIn}
                  className="space-y-3.5"
                  noValidate
                  autoComplete="off"
                >
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
                        name="signin_email"
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label
                        htmlFor="signin-password"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
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
                        name="signin_password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        data-lpignore="true"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={primaryButton}
                    >
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
                  </div>
                </form>
              </div>
            )}

            {/* Create Account Mode Form */}
            {mode === "signup" && (
              <div id="signup-panel" role="tabpanel">
                <form
                  onSubmit={handleSignUp}
                  className="space-y-3.5"
                  noValidate
                >
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
                        placeholder="Enter your full name"
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
                        placeholder="Enter your employee email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                  </div>

                  <div>
                    <label id="signup-role-label" className={labelBase}>
                      Institutional Account Role
                    </label>
                    <div className="relative" ref={roleDropdownRef}>
                      <button
                        type="button"
                        id="signup-role"
                        aria-haspopup="listbox"
                        aria-expanded={isRoleDropdownOpen}
                        aria-labelledby="signup-role-label"
                        onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsRoleDropdownOpen(false);
                          } else if (
                            e.key === "ArrowDown" ||
                            e.key === "ArrowUp"
                          ) {
                            e.preventDefault();
                            if (!isRoleDropdownOpen) {
                              setIsRoleDropdownOpen(true);
                            } else {
                              setRole((prev) =>
                                prev === "staff" ? "admin" : "staff",
                              );
                            }
                          }
                        }}
                        className={`${inputWithIcon} flex items-center justify-between cursor-pointer pr-3 text-left`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Shield
                            size={16}
                            className="text-slate-400 dark:text-slate-500 shrink-0"
                          />
                          <span className="text-slate-900 dark:text-white font-medium">
                            {role === "admin"
                              ? "Property Custodian (Admin)"
                              : "Training Instructor / Staff"}
                          </span>
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-150 shrink-0 ${isRoleDropdownOpen ? "rotate-180 text-amber-600" : ""}`}
                        />
                      </button>

                      {isRoleDropdownOpen && (
                        <div
                          role="listbox"
                          aria-labelledby="signup-role-label"
                          className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl ring-1 ring-black/5"
                        >
                          <button
                            type="button"
                            role="option"
                            aria-selected={role === "staff"}
                            onClick={() => {
                              setRole("staff");
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                              role === "staff"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Shield
                                size={15}
                                className={
                                  role === "staff"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-slate-400"
                                }
                              />
                              <div className="text-left">
                                <p className="font-semibold leading-tight">
                                  Training Instructor / Staff
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                                  Standard operational access &amp; quick count
                                  updates
                                </p>
                              </div>
                            </div>
                            {role === "staff" && (
                              <Check
                                size={14}
                                className="text-amber-600 dark:text-amber-400 shrink-0"
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            role="option"
                            aria-selected={role === "admin"}
                            onClick={() => {
                              setRole("admin");
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors cursor-pointer mt-1 ${
                              role === "admin"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldCheck
                                size={15}
                                className={
                                  role === "admin"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-slate-400"
                                }
                              />
                              <div className="text-left">
                                <p className="font-semibold leading-tight">
                                  Property Custodian (Admin)
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                                  Full governance, schema control, and room
                                  management
                                </p>
                              </div>
                            </div>
                            {role === "admin" && (
                              <Check
                                size={14}
                                className="text-amber-600 dark:text-amber-400 shrink-0"
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Institutional Security Passkey */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="signup-passkey"
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <KeyRound
                          size={13}
                          className="text-amber-700 dark:text-amber-400"
                        />
                        {role === "admin"
                          ? "Custodian Authorization Passkey"
                          : "Staff Authorization Passkey"}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const keys = getInstitutionalPasskeys();
                          setPasskey(
                            role === "admin"
                              ? keys.adminPasskey
                              : keys.staffPasskey,
                          );
                        }}
                        className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                        title="Click to insert official authorization passkey"
                      >
                        Autofill Demo Passkey
                      </button>
                    </div>
                    <div className="relative">
                      <Key
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-passkey"
                        type={showPasskey ? "text" : "password"}
                        required
                        autoComplete="off"
                        placeholder={
                          role === "admin"
                            ? "Enter KM100 Custodian Passkey"
                            : "Enter KM100 Staff Passkey"
                        }
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className={`${inputWithAction} font-mono tracking-wider`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasskey((prev) => !prev)}
                        aria-label={
                          showPasskey ? "Hide passkey" : "Show passkey"
                        }
                        aria-pressed={showPasskey}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Required by KM100 property custody governance to activate
                      staff accounts.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="signup-password"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Password
                      </label>
                      {password.length > 0 && (
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${getStrengthMeta().text}`}
                        >
                          {getStrengthMeta().label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Meter (Option B) */}
                    <div className="mt-2 flex gap-1" aria-hidden="true">
                      {requirements.map((item, index) => (
                        <span
                          key={item.label}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            index < metRequirements
                              ? getStrengthMeta().color
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <ul
                      className="mt-2 grid grid-cols-2 gap-1"
                      aria-live="polite"
                    >
                      {requirements.map((item) => (
                        <li
                          key={item.label}
                          className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                            item.met
                              ? allRequirementsMet
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "text-amber-800 dark:text-amber-300 font-semibold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {item.met ? (
                            <Check
                              size={12}
                              className={`shrink-0 stroke-[3] ${
                                allRequirementsMet
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-700 dark:text-amber-400"
                              }`}
                            />
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                          )}
                          <span className="truncate">
                            {item.label}
                            {!item.required && (
                              <span className="ml-1 text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                (optional)
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="signup-confirm"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Confirm Password
                      </label>
                      {confirmPassword.length > 0 &&
                        (password === confirmPassword ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 animate-slide-down">
                            <Check size={12} className="stroke-[3]" /> Passwords
                            match
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400 animate-slide-down">
                            Passwords do not match
                          </span>
                        ))}
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="signup-confirm"
                        type={showConfirmPassword ? "text" : "password"}
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
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={showConfirmPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Institutional Personnel Declaration Card */}
                  <div
                    onClick={() => setAcceptedTerms((prev) => !prev)}
                    className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none ${
                      acceptedTerms
                        ? "border-amber-500/80 bg-amber-50/60 dark:border-amber-600/70 dark:bg-amber-950/25 shadow-xs ring-1 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-400 dark:hover:border-amber-600/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Custom Checkbox Toggle */}
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                          acceptedTerms
                            ? "border-amber-700 bg-amber-700 dark:border-amber-600 dark:bg-amber-600 text-white shadow-xs"
                            : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 group-hover:border-amber-600 dark:group-hover:border-amber-400 shadow-2xs"
                        }`}
                      >
                        {acceptedTerms && (
                          <Check
                            size={13}
                            strokeWidth={3}
                            className="text-white animate-in zoom-in-75 duration-100"
                          />
                        )}
                      </div>

                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="sr-only"
                        aria-label="Confirm KM100 authorized personnel declaration"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Personnel Declaration
                          </span>
                          {acceptedTerms ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              <Check size={10} strokeWidth={2.5} /> Acknowledged
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              Required
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          I confirm that I am authorized KM100 personnel and
                          agree to the{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPolicyModal(true);
                            }}
                            className="inline-flex items-center gap-0.5 font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            <span>institutional acceptable use policy</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </button>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={primaryButton}
                  >
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

            {/* Forgot Password Mode Form */}
            {mode === "forgot" && (
              <div
                id="forgot-panel"
                role="region"
                aria-label="Password recovery"
              >
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div>
                    <label htmlFor="forgot-email" className={labelBase}>
                      Registered Employee Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputWithIcon} pr-3`}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      An official recovery link will be dispatched through
                      Supabase Auth to this email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={primaryButton}
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending recovery link...
                      </>
                    ) : (
                      <>
                        Send Recovery Link
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Remember your password?{" "}
                      <span className="text-amber-700 dark:text-amber-400 underline">
                        Sign in
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Set New Password Mode Form (Triggered via Supabase Recovery Link) */}
            {mode === "reset" && (
              <div id="reset-panel" role="region" aria-label="Set new password">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <ShieldCheck
                    size={16}
                    className="text-amber-700 dark:text-amber-400 shrink-0"
                  />
                  <p className="leading-snug">
                    <strong className="font-semibold">
                      Authorized Recovery Session
                    </strong>
                    : Choose a strong permanent password to restore access to
                    your account.
                  </p>
                </div>

                <form
                  onSubmit={handleResetPasswordSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div>
                    <label htmlFor="reset-password" className={labelBase}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="reset-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Create a strong new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="mt-2 flex gap-1" aria-hidden="true">
                      {requirements.map((item, index) => (
                        <span
                          key={item.label}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            index < metRequirements
                              ? getStrengthMeta().color
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <ul
                      className="mt-2 grid grid-cols-2 gap-1"
                      aria-live="polite"
                    >
                      {requirements.map((item) => (
                        <li
                          key={item.label}
                          className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                            item.met
                              ? allRequirementsMet
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "text-amber-800 dark:text-amber-300 font-semibold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {item.met ? (
                            <Check
                              size={12}
                              className={`shrink-0 stroke-[3] ${
                                allRequirementsMet
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-700 dark:text-amber-400"
                              }`}
                            />
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="reset-confirm" className={labelBase}>
                        Confirm New Password
                      </label>
                      {confirmPassword.length > 0 &&
                        (password === confirmPassword ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 animate-slide-down">
                            <Check size={12} className="stroke-[3]" /> Passwords
                            match
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-slide-down">
                            Passwords do not match
                          </span>
                        ))}
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="reset-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputWithAction}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={showConfirmPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={primaryButton}
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Updating password...
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} />
                        Update Password &amp; Sign In
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel and return to{" "}
                      <span className="text-amber-700 dark:text-amber-400 underline">
                        Sign In
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Acceptable Use Policy Institutional Modal */}
      {showPolicyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowPolicyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Institutional Acceptable Use Policy
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    KM100 Skills &amp; Training Center, Inc. &bull; Property
                    Custody Division
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-[11px] text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Notice to All Staff:</span>{" "}
                Access to this system is restricted to certified property
                custodians, authorized vocational instructors, and
                administration personnel.
              </div>

              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Physical Asset &amp; Equipment Stewardship
                    </h4>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      All tools, machinery, and training equipment entered,
                      updated, or checked out must accurately reflect physical
                      room counts. Equipment must only be used for approved
                      training curricula and official facility programs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Tamper-Evident Audit Logging
                    </h4>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Every stock count change, room transfer, remark update, or
                      item disposition is recorded with an immutable timestamp
                      and associated user identity for official institutional
                      property audits.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Credential &amp; Passkey Confidentiality
                    </h4>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Property custodian passkeys and user accounts are strictly
                      non-transferable. Staff members must never share passkeys
                      or leave active sessions unattended on communal training
                      facility terminals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 bg-slate-50/70 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowPolicyModal(false);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 transition-colors shadow-xs cursor-pointer"
              >
                <Check size={14} />I Understand &amp; Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Organized Auth Styles (Placed Below Component for Easy Debugging)
const inputBase =
  "w-full rounded-xl border border-slate-300/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-amber-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/15 shadow-2xs disabled:cursor-not-allowed disabled:opacity-60";

const inputWithIcon = `${inputBase} pl-10`;

const inputWithAction = `${inputBase} pl-10 pr-11`;

const labelBase =
  "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";

const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";
