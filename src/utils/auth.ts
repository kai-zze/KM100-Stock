import { AppUser, UserRole } from "../types/inventory";
import { supabase } from "./supabaseClient";

const AUTH_STORAGE_KEY = "km100_auth_user_v1";
const REGISTERED_ACCOUNTS_KEY = "km100_registered_accounts_v1";

export function clearLocalAdminAccounts(): void {
  try {
    const accounts = readRegisteredAccounts();
    const withoutAdmin = accounts.filter((a) => a.role !== "admin");
    writeRegisteredAccounts(withoutAdmin);
  } catch {}
}

interface RegisteredAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

function readRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (account): account is RegisteredAccount =>
        Boolean(account) &&
        typeof account.email === "string" &&
        typeof account.passwordHash === "string",
    );
  } catch {
    return [];
  }
}

function writeRegisteredAccounts(accounts: RegisteredAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage disabled or quota exceeded
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createSalt(): string {
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const value = `${salt}:${password}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(value),
      );
      return bytesToHex(new Uint8Array(digest));
    }
  } catch {
    // Fall through to the deterministic fallback below
  }
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

// Official pre-configured institutional staff accounts for the training center
export const DEMO_STAFF_ACCOUNTS: Array<{
  email: string;
  pass: string;
  role: UserRole;
  name: string;
}> = [
  {
    email: "admin@km100.edu.ph",
    pass: "km100admin2026",
    role: "admin",
    name: "Property Custodian",
  },
  {
    email: "staff@km100.edu.ph",
    pass: "km100staff2026",
    role: "staff",
    name: "Staff",
  },
];

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.email) {
      return {
        id: parsed.id || `usr-${Date.now().toString(36)}`,
        email: parsed.email,
        role: parsed.role === "admin" ? "admin" : "staff",
        fullName: (parsed.fullName || parsed.email)
          .replace(/\s*\([^)]*\)/g, "")
          .trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AppUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // LocalStorage quota or disabled
  }
}

// Authorized KM100 Institutional Security Passkeys (Blocks unauthorized random public access)
export const DEFAULT_STAFF_PASSKEY = "KM100-STAFF-2026";
export const DEFAULT_ADMIN_PASSKEY = "KM100-ADMIN-2026";
export const PASSKEYS_STORAGE_KEY = "km100_institutional_passkeys_v1";

export const VALID_STAFF_PASSKEYS = [
  DEFAULT_STAFF_PASSKEY,
  "KM100-STAFF-2025",
  "km100staff2026",
  "km100staff2025",
  "km100staff",
];

export const VALID_ADMIN_PASSKEYS = [
  DEFAULT_ADMIN_PASSKEY,
  "KM100-ADMIN-2025",
  "km100admin2026",
  "km100admin2025",
  "km100admin",
  "KM100ADMIN",
];

export interface InstitutionalPasskeys {
  adminPasskey: string;
  staffPasskey: string;
}

export function getInstitutionalPasskeys(): InstitutionalPasskeys {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      adminPasskey: DEFAULT_ADMIN_PASSKEY,
      staffPasskey: DEFAULT_STAFF_PASSKEY,
    };
  }
  try {
    const raw = localStorage.getItem(PASSKEYS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        adminPasskey: parsed.adminPasskey || DEFAULT_ADMIN_PASSKEY,
        staffPasskey: parsed.staffPasskey || DEFAULT_STAFF_PASSKEY,
      };
    }
  } catch (e) {
    console.warn("Failed to read passkeys from localStorage", e);
  }
  return {
    adminPasskey: DEFAULT_ADMIN_PASSKEY,
    staffPasskey: DEFAULT_STAFF_PASSKEY,
  };
}

export function updateInstitutionalPasskeys(
  newPasskeys: Partial<InstitutionalPasskeys>,
): { success: boolean; passkeys: InstitutionalPasskeys; error?: string } {
  const current = getInstitutionalPasskeys();
  const nextAdmin = (newPasskeys.adminPasskey ?? current.adminPasskey).trim();
  const nextStaff = (newPasskeys.staffPasskey ?? current.staffPasskey).trim();

  if (nextAdmin.length < 6) {
    return {
      success: false,
      passkeys: current,
      error: "Custodian passkey must be at least 6 characters long.",
    };
  }

  if (nextStaff.length < 6) {
    return {
      success: false,
      passkeys: current,
      error: "Staff passkey must be at least 6 characters long.",
    };
  }

  const updated: InstitutionalPasskeys = {
    adminPasskey: nextAdmin,
    staffPasskey: nextStaff,
  };

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to write passkeys to localStorage", e);
    return {
      success: false,
      passkeys: current,
      error: "Failed to persist new passkeys to storage.",
    };
  }

  return { success: true, passkeys: updated };
}

export function resetInstitutionalPasskeys(): InstitutionalPasskeys {
  const defaults: InstitutionalPasskeys = {
    adminPasskey: DEFAULT_ADMIN_PASSKEY,
    staffPasskey: DEFAULT_STAFF_PASSKEY,
  };
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(PASSKEYS_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to reset passkeys", e);
  }
  return defaults;
}

function hasCustomPasskeys(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      Boolean(window.localStorage?.getItem(PASSKEYS_STORAGE_KEY))
    );
  } catch {
    return false;
  }
}

export function isAuthorizedStaffPasskey(key: string): boolean {
  const clean = (key || "").trim().replace(/[-\s]/g, "").toLowerCase();
  if (!clean) return false;
  const current = getInstitutionalPasskeys();
  const activeStaffClean = current.staffPasskey
    .replace(/[-\s]/g, "")
    .toLowerCase();

  if (clean === activeStaffClean) return true;
  if (hasCustomPasskeys()) return false;

  return VALID_STAFF_PASSKEYS.some(
    (k) => k.replace(/[-\s]/g, "").toLowerCase() === clean,
  );
}

export function isAuthorizedAdminPasskey(key: string): boolean {
  const clean = (key || "").trim().replace(/[-\s]/g, "").toLowerCase();
  if (!clean) return false;
  const current = getInstitutionalPasskeys();
  const activeAdminClean = current.adminPasskey
    .replace(/[-\s]/g, "")
    .toLowerCase();

  if (clean === activeAdminClean) return true;
  if (hasCustomPasskeys()) return false;

  return VALID_ADMIN_PASSKEYS.some(
    (k) => k.replace(/[-\s]/g, "").toLowerCase() === clean,
  );
}

export function hasLocalAdminAccount(): boolean {
  const accounts = readRegisteredAccounts();
  return accounts.some((a) => a.role === "admin");
}

export async function checkAdminAccountExists(): Promise<boolean> {
  // 1. Cloud check: call the SECURITY DEFINER RPC (if deployed)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "check_admin_registered",
    );
    if (!rpcError && typeof rpcData === "boolean") {
      if (rpcData === false) {
        clearLocalAdminAccounts();
        return false;
      }
      return true;
    }
  } catch {
    // RPC fallback
  }

  // 2. Cloud check: direct profiles query (when public read policy is applied)
  try {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "admin");

    if (!profileError && Array.isArray(profiles)) {
      if (profiles.length > 0) {
        return true;
      } else {
        // Cloud profiles query succeeded and found 0 admin profiles:
        // That means the admin was deleted in Supabase.
        // Synchronize local cache by clearing stale admin accounts.
        clearLocalAdminAccounts();
        return false;
      }
    }
  } catch {
    // Supabase offline / network error fallback
  }

  // 3. Fallback: inspect local registered accounts
  return hasLocalAdminAccount();
}

export async function registerAccount(input: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  passkey?: string;
  adminKey?: string; // backwards compatibility alias
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const fullName = (input.fullName || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const password = input.password || "";
  const role: UserRole = input.role === "admin" ? "admin" : "staff";
  const passkey = input.passkey || input.adminKey || "";

  if (fullName.length < 2) {
    return { success: false, error: "Please enter your full name." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return {
      success: false,
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, and numbers.",
    };
  }

  const isDemoAccount = DEMO_STAFF_ACCOUNTS.some(
    (account) => account.email.toLowerCase() === email,
  );
  if (isDemoAccount) {
    return {
      success: false,
      error:
        "An account with this email already exists. Please sign in instead.",
    };
  }

  let accounts = readRegisteredAccounts();
  let isRegistered = accounts.some(
    (account) => account.email.toLowerCase() === email,
  );

  // If flagged as registered in local cache, verify against Supabase cloud:
  // If the account was deleted in Supabase, reconcile and prune the stale local cache.
  if (isRegistered) {
    try {
      const { data: profileCheck, error: profileErr } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();

      if (!profileErr && !profileCheck) {
        accounts = accounts.filter(
          (account) => account.email.toLowerCase() !== email,
        );
        writeRegisteredAccounts(accounts);
        isRegistered = false;
      }
    } catch {
      // Offline fallback: keep protecting local registration if network is unavailable
    }
  }

  if (isRegistered) {
    return {
      success: false,
      error:
        "An account with this email already exists. Please sign in instead.",
    };
  }

  // Institutional Single-Admin Governance: Only 1 Property Custodian account can be registered
  if (role === "admin") {
    const localAdminExists = accounts.some(
      (account) =>
        account.role === "admin" && account.email.toLowerCase() !== email,
    );
    const cloudAdminExists = localAdminExists
      ? true
      : await checkAdminAccountExists();
    if (localAdminExists || cloudAdminExists) {
      return {
        success: false,
        error:
          "A Property Custodian account has already been registered. Additional accounts must be registered as Staff.",
      };
    }
    if (passkey && !isAuthorizedAdminPasskey(passkey)) {
      return {
        success: false,
        error:
          "Invalid Custodian Passkey. Administrator registration requires the official KM100 Admin passkey (e.g. KM100-ADMIN-2026).",
      };
    }
  } else {
    if (passkey && !isAuthorizedStaffPasskey(passkey)) {
      return {
        success: false,
        error:
          "Invalid Staff Passkey. Staff registration requires the official KM100 Staff passkey (e.g. KM100-STAFF-2026).",
      };
    }
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);
  const account: RegisteredAccount = {
    id: `usr-${role}-${Date.now().toString(36)}`,
    email,
    fullName,
    role,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  // Sync to Supabase Auth
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      console.warn(
        "[KM100 Auth] Supabase cloud registration notice:",
        authError.message,
      );
    } else if (authData?.user) {
      console.info(
        "[KM100 Auth] Registered successfully with Supabase cloud auth:",
        authData.user.id,
      );
      try {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn(
          "[KM100 Auth] Supabase profiles table sync note:",
          profileErr,
        );
      }
    }
  } catch (err) {
    console.warn("[KM100 Auth] Supabase registration offline fallback:", err);
  }

  // Save to local storage after registration
  writeRegisteredAccounts([...accounts, account]);

  const appUser: AppUser = {
    id: account.id,
    email: account.email,
    role: account.role,
    fullName: account.fullName,
  };
  setStoredUser(appUser);
  return { success: true, user: appUser };
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanInput = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  if (!cleanInput || !cleanPass) {
    return {
      success: false,
      error: "Please enter both your employee email and password.",
    };
  }

  // 0. Accounts created through the sign-up flow (local-first, hashed password or passkey)
  const registeredAccount = readRegisteredAccounts().find(
    (account) => account.email === cleanInput,
  );

  if (registeredAccount) {
    const passwordHash = await hashPassword(cleanPass, registeredAccount.salt);
    const passMatches = passwordHash === registeredAccount.passwordHash;
    const passkeyMatches =
      registeredAccount.role === "admin"
        ? isAuthorizedAdminPasskey(cleanPass)
        : isAuthorizedStaffPasskey(cleanPass);

    if (!passMatches && !passkeyMatches) {
      return {
        success: false,
        error: "Incorrect email or password. Please try again.",
      };
    }

    const appUser: AppUser = {
      id: registeredAccount.id,
      email: registeredAccount.email,
      role: registeredAccount.role,
      fullName: registeredAccount.fullName,
    };
    setStoredUser(appUser);

    // Keep Supabase cloud session synchronized if online
    supabase.auth
      .signInWithPassword({ email: cleanInput, password: cleanPass })
      .catch(() => {});

    return { success: true, user: appUser };
  }

  // 1. Direct match with official institutional demo accounts (Instant 0ms, offline-first)
  const exactMatch = DEMO_STAFF_ACCOUNTS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanInput || acc.role === cleanInput) &&
      acc.pass === cleanPass,
  );

  if (exactMatch) {
    const appUser: AppUser = {
      id: `usr-${exactMatch.role}-${Date.now().toString(36)}`,
      email: exactMatch.email,
      role: exactMatch.role,
      fullName: exactMatch.name,
    };
    setStoredUser(appUser);
    return { success: true, user: appUser };
  }

  // 2. Direct Institutional Passkey Authentication (Instant authorized employee entry)
  if (
    cleanInput.includes("@") &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput)
  ) {
    if (isAuthorizedAdminPasskey(cleanPass)) {
      const appUser: AppUser = {
        id: `usr-admin-${Date.now().toString(36)}`,
        email: cleanInput,
        role: "admin",
        fullName:
          cleanInput
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || "Property Custodian",
      };
      setStoredUser(appUser);
      return { success: true, user: appUser };
    }

    if (isAuthorizedStaffPasskey(cleanPass)) {
      const appUser: AppUser = {
        id: `usr-staff-${Date.now().toString(36)}`,
        email: cleanInput,
        role: "staff",
        fullName:
          cleanInput
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || "Training Staff",
      };
      setStoredUser(appUser);
      return { success: true, user: appUser };
    }
  }

  // 3. Fast-timeout Supabase Auth check (with 2.5s maximum timeout to prevent hanging)
  try {
    const supabaseAuthPromise = supabase.auth.signInWithPassword({
      email: cleanInput,
      password: cleanPass,
    });

    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>(
      (resolve) =>
        setTimeout(
          () =>
            resolve({ data: { user: null }, error: new Error("Auth timeout") }),
          2500,
        ),
    );

    const { data, error } = await Promise.race([
      supabaseAuthPromise,
      timeoutPromise,
    ]);

    if (data?.user && !error) {
      const userMeta = data.user.user_metadata || {};
      const role: UserRole =
        userMeta.role === "admin" ||
        cleanInput.includes("admin") ||
        cleanInput.includes("custodian")
          ? "admin"
          : "staff";

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email || cleanInput,
        role,
        fullName:
          userMeta.full_name ||
          userMeta.name ||
          (role === "admin" ? "Property Custodian" : "Staff"),
      };

      setStoredUser(appUser);
      return { success: true, user: appUser };
    }
  } catch {
    // Supabase unreachable or network issue
  }

  // Strict Security Rejection: Random, unauthorized, or invalid credentials are blocked
  return {
    success: false,
    error:
      "Access denied: Unrecognized employee credentials. Please register with an authorized KM100 passkey or sign in with your registered account.",
  };
}

export async function logoutCurrentSession(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Best effort
  }
  setStoredUser(null);
}

export async function updateUserProfile(params: {
  fullName?: string;
  newPassword?: string;
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const current = getStoredUser();
  if (!current) return { success: false, error: "No user signed in" };

  const trimmedName = params.fullName?.trim();
  const trimmedPass = params.newPassword?.trim();

  if (trimmedPass && trimmedPass.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long",
    };
  }

  try {
    // 1. Supabase Auth and database sync
    const updatePayload: any = {};
    if (trimmedPass) updatePayload.password = trimmedPass;
    if (trimmedName) updatePayload.data = { full_name: trimmedName };

    if (Object.keys(updatePayload).length > 0) {
      const { error: authUpdateError } =
        await supabase.auth.updateUser(updatePayload);
      if (authUpdateError) {
        console.warn(
          "Supabase auth.updateUser warning:",
          authUpdateError.message,
        );
      }

      if (trimmedName) {
        await supabase
          .from("profiles")
          .update({
            full_name: trimmedName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", current.id);
      }
    }
  } catch (err) {
    console.warn("Supabase profile update warning:", err);
  }

  // 2. Update local registered accounts store if user is in registered list
  try {
    const accounts = readRegisteredAccounts();
    const cleanEmail = current.email.trim().toLowerCase();
    const idx = accounts.findIndex(
      (a) => a.email.trim().toLowerCase() === cleanEmail,
    );
    if (idx !== -1) {
      const salt = accounts[idx].salt || createSalt();
      const updatedAccount = { ...accounts[idx], salt };
      if (trimmedName) updatedAccount.fullName = trimmedName;
      if (trimmedPass) {
        updatedAccount.passwordHash = await hashPassword(trimmedPass, salt);
      }
      accounts[idx] = updatedAccount;
      writeRegisteredAccounts(accounts);
    }
  } catch {
    // Storage write warning ignored
  }

  // 3. Update current session
  const updatedUser: AppUser = {
    ...current,
    fullName: trimmedName || current.fullName,
  };
  setStoredUser(updatedUser);

  return { success: true, user: updatedUser };
}

export async function sendPasswordResetEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return {
      success: false,
      error: "Please enter your registered employee email.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to connect to Supabase auth service.",
    };
  }
}

export async function completePasswordRecovery(
  newPassword: string,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanPass = (newPassword || "").trim();
  if (cleanPass.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: cleanPass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    const userMeta = user?.user_metadata || {};
    const email = user?.email || "staff@km100.edu.ph";
    const role: UserRole =
      userMeta.role === "admin" ||
      email.includes("admin") ||
      email.includes("custodian")
        ? "admin"
        : "staff";

    const appUser: AppUser = {
      id: user?.id || `usr-${role}-${Date.now().toString(36)}`,
      email,
      role,
      fullName:
        userMeta.full_name ||
        userMeta.name ||
        (role === "admin" ? "Property Custodian" : "Staff"),
    };

    // Synchronize local registered accounts if found
    try {
      const accounts = readRegisteredAccounts();
      const cleanEmail = appUser.email.trim().toLowerCase();
      const idx = accounts.findIndex(
        (a) => a.email.trim().toLowerCase() === cleanEmail,
      );
      if (idx !== -1) {
        const salt = accounts[idx].salt || createSalt();
        accounts[idx] = {
          ...accounts[idx],
          salt,
          passwordHash: await hashPassword(cleanPass, salt),
        };
        writeRegisteredAccounts(accounts);
      }
    } catch {
      // Storage warning ignored
    }

    setStoredUser(appUser);
    return { success: true, user: appUser };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update password.",
    };
  }
}
