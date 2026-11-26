import React, { useState } from "react";
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Check,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { AppUser } from "../types/inventory";
import {
  updateUserProfile,
  getInstitutionalPasskeys,
  updateInstitutionalPasskeys,
  resetInstitutionalPasskeys,
} from "../utils/auth";

interface Props {
  isOpen: boolean;
  currentUser: AppUser;
  onClose: () => void;
  onUserUpdated: (updatedUser: AppUser) => void;
  onPasswordChanged?: () => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  currentUser,
  onClose,
  onUserUpdated,
  onPasswordChanged,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "passkeys">("profile");
  const [fullName, setFullName] = useState(currentUser.fullName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Institutional Passkey state (Admin only) - keep input empty by default
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyErrorMsg, setPasskeyErrorMsg] = useState("");
  const [passkeySuccessMsg, setPasskeySuccessMsg] = useState("");

  // Reset draft fields whenever opened or currentUser changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("profile");
      setFullName(currentUser.fullName || "");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMsg("");
      setSuccessMsg("");
      setPasskey("");
      setShowPasskey(false);
      setPasskeyErrorMsg("");
      setPasskeySuccessMsg("");
    }
  }, [isOpen, currentUser]);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const requirements = [
    { label: "A minimum of 8 characters", met: newPassword.length >= 8 },
    {
      label: "Lower and uppercase letters",
      met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    },
    { label: "At least 1 number", met: /\d/.test(newPassword) },
    { label: "At least 1 symbol", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const metRequirements = requirements.filter((item) => item.met).length;
  const isPasswordMet = metRequirements === requirements.length;
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Full name cannot be empty.");
      return;
    }

    if (newPassword) {
      if (!isPasswordMet) {
        setErrorMsg(
          "Password must satisfy all security requirements (minimum 8 characters with letters, numbers, and symbols).",
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please re-enter them.");
        return;
      }
    }

    const isChangingPassword = Boolean(newPassword && newPassword.trim());

    setIsLoading(true);
    try {
      const res = await updateUserProfile({
        fullName: fullName.trim(),
        newPassword: isChangingPassword ? newPassword.trim() : undefined,
      });

      if (res.success && res.user) {
        if (isChangingPassword) {
          setSuccessMsg(
            "Password updated successfully! Signing you out to verify your new password...",
          );
          setTimeout(() => {
            onClose();
            if (onPasswordChanged) {
              onPasswordChanged();
            }
          }, 1100);
        } else {
          setSuccessMsg("Account updated successfully!");
          onUserUpdated(res.user);
          setTimeout(() => {
            onClose();
          }, 900);
        }
      } else {
        setErrorMsg(res.error || "Failed to update account.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePasskeys = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyErrorMsg("");
    setPasskeySuccessMsg("");

    const current = getInstitutionalPasskeys();
    const newPasskey = passkey.trim() || current.passkey;

    if (!passkey.trim()) {
      setPasskeyErrorMsg("Please enter a new passkey to update.");
      return;
    }

    if (passkey.trim().length < 6) {
      setPasskeyErrorMsg(
        "Institutional passkey must be at least 6 characters.",
      );
      return;
    }

    const res = updateInstitutionalPasskeys({
      passkey: newPasskey,
    });

    if (res.success) {
      setPasskey("");
      setPasskeySuccessMsg(
        "Institutional passkey updated successfully! New registrations will require this passkey.",
      );
    } else {
      setPasskeyErrorMsg(res.error || "Failed to update passkey.");
    }
  };

  const handleResetPasskeys = () => {
    resetInstitutionalPasskeys();
    setPasskey("");
    setPasskeyErrorMsg("");
    setPasskeySuccessMsg(
      "Passkey restored to institutional default (KM100-2026).",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              {activeTab === "passkeys" ? (
                <KeyRound size={18} />
              ) : (
                <User size={18} />
              )}
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="text-base font-heading font-bold text-slate-900 dark:text-white leading-tight"
              >
                {activeTab === "passkeys"
                  ? "Security Passkey"
                  : "Account Settings"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTab === "passkeys"
                  ? "Manage the institutional authorization passkey for registration"
                  : "Update your display name and security credentials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile settings"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Identity Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Signed-in Email
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentUser.email}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              currentUser.role === "admin"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            {currentUser.role === "admin" ? (
              <Shield
                size={13}
                className="text-amber-700 dark:text-amber-400"
              />
            ) : (
              <User size={13} />
            )}
            {currentUser.role === "admin" ? "Admin / Custodian" : "Staff"}
          </span>
        </div>

        {/* Admin Tabs */}
        {currentUser.role === "admin" && (
          <div
            role="tablist"
            aria-label="Account settings sections"
            className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "profile"}
              onClick={() => {
                setActiveTab("profile");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User size={13} />
              <span>Profile &amp; Password</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "passkeys"}
              onClick={() => {
                setActiveTab("passkeys");
                setPasskeyErrorMsg("");
                setPasskeySuccessMsg("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "passkeys"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <KeyRound
                size={13}
                className={
                  activeTab === "passkeys"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-slate-400"
                }
              />
              <span>Institutional Passkey</span>
            </button>
          </div>
        )}

        {/* Tab 1: Profile & Personal Password */}
        {activeTab === "profile" && (
          <>
            {/* Alerts */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300"
              >
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div
                role="status"
                className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Property Custodian"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1.5">
                  <Lock size={14} className="text-amber-700" />
                  <span>Change Personal Password</span>
                  <span className="text-xs font-normal text-slate-400">
                    (optional)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Leave blank to keep your current password. For security,
                  changing your password will automatically sign you out so you
                  can sign in with your new password.
                </p>

                {/* New Password Field */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Meter Bar */}
                    {newPassword && (
                      <>
                        <div className="mt-2 flex gap-1" aria-hidden="true">
                          {requirements.map((item, index) => (
                            <span
                              key={item.label}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                index < metRequirements
                                  ? isPasswordMet
                                    ? "bg-emerald-600"
                                    : "bg-amber-500"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Requirements Checklist */}
                        <ul className="mt-2 space-y-1">
                          {requirements.map((item) => (
                            <li
                              key={item.label}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                item.met
                                  ? isPasswordMet
                                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                    : "text-amber-800 dark:text-amber-300 font-semibold"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {item.met ? (
                                <Check
                                  size={13}
                                  className={`shrink-0 ${
                                    isPasswordMet
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-amber-700 dark:text-amber-400"
                                  }`}
                                />
                              ) : (
                                <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                              )}
                              <span>{item.label}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>

                    {/* Match Indicator */}
                    {confirmPassword && (
                      <div className="mt-1.5">
                        {passwordsMatch ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                            <Check size={13} /> Passwords match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                            <X size={13} /> Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (newPassword ? !isPasswordMet || !passwordsMatch : false)
                  }
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Tab 2: Institutional Security Passkey (Admin Only) */}
        {activeTab === "passkeys" && currentUser.role === "admin" && (
          <form
            onSubmit={handleSavePasskeys}
            className="space-y-4 text-xs sm:text-sm"
          >
            {/* Security Explanation */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck
                size={16}
                className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              />
              <div className="leading-relaxed">
                <p className="font-semibold">Institutional Passkey Authority</p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  As Property Custodian, only you have authority to view and
                  change the single institutional authorization passkey required
                  for personnel to register accounts on this system.
                </p>
              </div>
            </div>

            {/* Alerts */}
            {passkeyErrorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300">
                {passkeyErrorMsg}
              </div>
            )}
            {passkeySuccessMsg && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{passkeySuccessMsg}</span>
              </div>
            )}

            {/* Institutional Passkey Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound
                    size={14}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  <span>Institutional Passkey</span>
                </label>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-semibold">
                  Custodian Controlled
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPasskey ? "text" : "password"}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter new Institutional passkey (leave blank to keep current)"
                  className="w-full pl-3 pr-10 py-2 font-sans font-medium tracking-wide text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPasskey ? "Hide passkey" : "Show passkey"}
                >
                  {showPasskey ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                This single passkey is provided to authorized staff and
                personnel to register. Only the Custodian can modify it.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetPasskeys}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Restore default factory passkey"
              >
                <RotateCcw size={13} />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!passkey.trim() || passkey.trim().length < 6}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>Update Passkey</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
