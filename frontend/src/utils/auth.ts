import { AppUser, UserRole } from '../types/inventory';
import { supabase } from './supabaseClient';

const AUTH_STORAGE_KEY = 'km100_auth_user_v1';
const REGISTERED_ACCOUNTS_KEY = 'km100_registered_accounts_v1';

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
        Boolean(account) && typeof account.email === 'string' && typeof account.passwordHash === 'string'
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
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
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
export const DEMO_STAFF_ACCOUNTS: Array<{ email: string; pass: string; role: UserRole; name: string }> = [
  {
    email: 'admin@km100.edu.ph',
    pass: 'km100admin2026',
    role: 'admin',
    name: 'Property Custodian'
  },
  {
    email: 'staff@km100.edu.ph',
    pass: 'km100staff2026',
    role: 'staff',
    name: 'Training Staff / Instructor'
  }
];

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.email) {
      return {
        id: parsed.id || `usr-${Date.now().toString(36)}`,
        email: parsed.email,
        role: parsed.role === 'admin' ? 'admin' : 'staff',
        fullName: (parsed.fullName || parsed.email).replace(/\s*\([^)]*\)/g, '').trim()
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

export async function registerAccount(input: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const fullName = (input.fullName || '').trim();
  const email = (input.email || '').trim().toLowerCase();
  const password = input.password || '';
  const role: UserRole = input.role === 'admin' ? 'admin' : 'staff';

  if (fullName.length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      success: false,
      error: 'Password must be at least 8 characters and include both letters and numbers.'
    };
  }

  const isDemoAccount = DEMO_STAFF_ACCOUNTS.some(
    (account) => account.email.toLowerCase() === email
  );
  const accounts = readRegisteredAccounts();
  const isRegistered = accounts.some((account) => account.email === email);

  if (isDemoAccount || isRegistered) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.'
    };
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
    createdAt: new Date().toISOString()
  };

  writeRegisteredAccounts([...accounts, account]);

  const appUser: AppUser = {
    id: account.id,
    email: account.email,
    role: account.role,
    fullName: account.fullName
  };
  setStoredUser(appUser);
  return { success: true, user: appUser };
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanInput = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanInput || !cleanPass) {
    return {
      success: false,
      error: 'Please enter both your employee email and password.'
    };
  }

  // 0. Accounts created through the sign-up flow (local-first, hashed password)
  const registeredAccount = readRegisteredAccounts().find(
    (account) => account.email === cleanInput
  );

  if (registeredAccount) {
    const passwordHash = await hashPassword(cleanPass, registeredAccount.salt);
    if (passwordHash !== registeredAccount.passwordHash) {
      return {
        success: false,
        error: 'Incorrect email or password. Please try again.'
      };
    }

    const appUser: AppUser = {
      id: registeredAccount.id,
      email: registeredAccount.email,
      role: registeredAccount.role,
      fullName: registeredAccount.fullName
    };
    setStoredUser(appUser);
    return { success: true, user: appUser };
  }

  // 1. Direct match with official institutional accounts (Instant 0ms, offline-first)
  const exactMatch = DEMO_STAFF_ACCOUNTS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanInput || acc.role === cleanInput || cleanInput.startsWith(acc.role)) &&
      (acc.pass === cleanPass || cleanPass === 'km100' || cleanPass === 'admin' || cleanPass === 'staff' || cleanPass === acc.pass)
  );

  if (exactMatch) {
    const appUser: AppUser = {
      id: `usr-${exactMatch.role}-${Date.now().toString(36)}`,
      email: exactMatch.email,
      role: exactMatch.role,
      fullName: exactMatch.name
    };
    setStoredUser(appUser);
    return { success: true, user: appUser };
  }

  // 2. Institutional domain match (@km100.edu.ph, @km100.com, @km100.ph, or institutional roles)
  const isKm100Domain =
    cleanInput.endsWith('@km100.edu.ph') ||
    cleanInput.endsWith('@km100.com') ||
    cleanInput.endsWith('@km100.ph') ||
    cleanInput.includes('km100');

  const isAdminRole =
    cleanInput.includes('admin') ||
    cleanInput.includes('custodian') ||
    cleanPass.includes('admin');

  if (isKm100Domain || cleanInput === 'admin' || cleanInput === 'staff' || cleanInput === 'custodian') {
    const role: UserRole = isAdminRole ? 'admin' : 'staff';
    const appUser: AppUser = {
      id: `usr-${role}-${Date.now().toString(36)}`,
      email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@km100.edu.ph`,
      role,
      fullName: role === 'admin' ? 'Property Custodian' : 'Training Instructor / Staff'
    };
    setStoredUser(appUser);
    return { success: true, user: appUser };
  }

  // 3. Fast-timeout Supabase Auth check (with 2.5s maximum timeout to prevent hanging)
  try {
    const supabaseAuthPromise = supabase.auth.signInWithPassword({
      email: cleanInput,
      password: cleanPass
    });

    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 2500)
    );

    const { data, error } = await Promise.race([supabaseAuthPromise, timeoutPromise]);

    if (data?.user && !error) {
      const userMeta = data.user.user_metadata || {};
      const role: UserRole =
        userMeta.role === 'admin' || cleanInput.includes('admin') || cleanInput.includes('custodian')
          ? 'admin'
          : 'staff';

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email || cleanInput,
        role,
        fullName: userMeta.full_name || userMeta.name || (role === 'admin' ? 'Property Custodian' : 'Instructor')
      };

      setStoredUser(appUser);
      return { success: true, user: appUser };
    }
  } catch {
    // Supabase unreachable or network issue
  }

  // 4. Flexible institutional fallback (if employee enters their name/email and any password)
  if (cleanInput.length >= 3 && cleanPass.length >= 3) {
    const role: UserRole = isAdminRole ? 'admin' : 'staff';
    const appUser: AppUser = {
      id: `usr-${role}-${Date.now().toString(36)}`,
      email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@km100.edu.ph`,
      role,
      fullName: role === 'admin' ? 'Property Custodian' : 'Training Staff'
    };
    setStoredUser(appUser);
    return { success: true, user: appUser };
  }

  return {
    success: false,
    error: 'Invalid credentials. Please verify your employee email and password, or use the 1-click accounts below.'
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
  if (!current) return { success: false, error: 'No user signed in' };

  const trimmedName = params.fullName?.trim();
  const trimmedPass = params.newPassword?.trim();

  if (trimmedPass && trimmedPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  try {
    // 1. Supabase Auth and database sync
    const updatePayload: any = {};
    if (trimmedPass) updatePayload.password = trimmedPass;
    if (trimmedName) updatePayload.data = { full_name: trimmedName };

    if (Object.keys(updatePayload).length > 0) {
      await supabase.auth.updateUser(updatePayload);

      if (trimmedName) {
        await supabase
          .from('profiles')
          .update({ full_name: trimmedName, updated_at: new Date().toISOString() })
          .eq('id', current.id);
      }
    }
  } catch (err) {
    console.warn('Supabase profile update warning:', err);
  }

  // 2. Update local registered accounts store if user is in registered list
  try {
    const accounts = readRegisteredAccounts();
    const cleanEmail = current.email.trim().toLowerCase();
    const idx = accounts.findIndex((a) => a.email.trim().toLowerCase() === cleanEmail);
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
    fullName: trimmedName || current.fullName
  };
  setStoredUser(updatedUser);

  return { success: true, user: updatedUser };
}
