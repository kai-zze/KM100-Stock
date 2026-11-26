import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  registerAccount,
  loginWithCredentials,
  logoutCurrentSession,
  getStoredUser,
  DEMO_STAFF_ACCOUNTS,
  VALID_STAFF_PASSKEYS,
  VALID_ADMIN_PASSKEYS,
  getInstitutionalPasskeys,
  updateInstitutionalPasskeys,
  resetInstitutionalPasskeys,
  hasLocalAdminAccount,
  checkAdminAccountExists,
  clearLocalAdminAccounts,
} from "../auth";

// Mock Supabase so unit tests never hit the live database or create dummy accounts in cloud Auth
vi.mock("../supabaseClient", () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "mock-user-id" } },
          error: null,
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("Mock auth error"),
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({
          data: { user: { id: "mock-user-id" } },
          error: null,
        }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
    },
    SUPABASE_CONFIG: {
      url: "https://mock.supabase.co",
      anonKey: "mock-key",
    },
  };
});

describe("KM100 Authentication System with Institutional Passkeys", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Sign Up (registerAccount with Institutional Passkey)", () => {
    it("successfully registers staff with authorized KM100 Staff Passkey", async () => {
      const res = await registerAccount({
        fullName: "Maria Santos",
        email: "msantos@km100.edu.ph",
        password: "Password123",
        role: "staff",
        passkey: "KM100-STAFF-2026",
      });

      expect(res.success).toBe(true);
      expect(res.user?.role).toBe("staff");
      expect(res.user?.fullName).toBe("Maria Santos");
      expect(getStoredUser()?.email).toBe("msantos@km100.edu.ph");
    });

    it("allows open registration without a passkey", async () => {
      const randomUser = await registerAccount({
        fullName: "Random Stranger",
        email: "random@gmail.com",
        password: "Password123",
        role: "staff",
      });

      expect(randomUser.success).toBe(true);
      expect(randomUser.user?.role).toBe("staff");
      expect(randomUser.user?.fullName).toBe("Random Stranger");
      expect(getStoredUser()?.email).toBe("random@gmail.com");
    });

    it("allows admin registration without a passkey", async () => {
      // Non-members can register as Custodian/Admin without an authorization passkey
      const adminReg = await registerAccount({
        fullName: "New Custodian",
        email: "custodian@km100.edu.ph",
        password: "Password123",
        role: "admin",
      });
      expect(adminReg.success).toBe(true);
      expect(adminReg.user?.role).toBe("admin");
      expect(adminReg.user?.fullName).toBe("New Custodian");
    });

    it("prevents duplicate registration of institutional demo accounts", async () => {
      const demoDup = await registerAccount({
        fullName: "Demo Admin Attempt",
        email: "admin@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-ADMIN-2026",
      });
      expect(demoDup.success).toBe(false);
      expect(demoDup.error).toContain("already exists");
    });

    it("blocks second admin registration once a Custodian already exists and directs to Staff", async () => {
      // 1. Initial state: no admin created yet
      expect(hasLocalAdminAccount()).toBe(false);

      // 2. First admin creates account successfully
      const firstAdmin = await registerAccount({
        fullName: "First Custodian",
        email: "custodian1@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-ADMIN-2026",
      });
      expect(firstAdmin.success).toBe(true);
      expect(firstAdmin.user?.role).toBe("admin");
      expect(hasLocalAdminAccount()).toBe(true);

      // 3. Second user tries to create an account as admin: STRICTLY BLOCKED
      const secondAdminAttempt = await registerAccount({
        fullName: "Second Admin Attempt",
        email: "custodian2@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-ADMIN-2026",
      });
      expect(secondAdminAttempt.success).toBe(false);
      expect(secondAdminAttempt.error).toContain("already been registered");
      expect(secondAdminAttempt.error).toContain("Staff");

      // 4. Second user creates account as Staff: SUCCEEDS
      const staffRegistration = await registerAccount({
        fullName: "Second User Staff",
        email: "staff2@km100.edu.ph",
        password: "Password123",
        role: "staff",
        passkey: "KM100-STAFF-2026",
      });
      expect(staffRegistration.success).toBe(true);
      expect(staffRegistration.user?.role).toBe("staff");

      // 5. When the admin account is deleted, admin slot re-opens
      clearLocalAdminAccounts();
      expect(hasLocalAdminAccount()).toBe(false);

      const replacementAdmin = await registerAccount({
        fullName: "New Replacement Custodian",
        email: "newcustodian@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-ADMIN-2026",
      });
      expect(replacementAdmin.success).toBe(true);
      expect(replacementAdmin.user?.role).toBe("admin");
      expect(hasLocalAdminAccount()).toBe(true);
    });
  });

  describe("Sign In (loginWithCredentials & Strict Rejection)", () => {
    it("strictly BLOCKS random unregistered users from logging in", async () => {
      const randomAttempt = await loginWithCredentials(
        "randomstranger@gmail.com",
        "randompassword123",
      );
      expect(randomAttempt.success).toBe(false);
      expect(randomAttempt.error).toContain("Access denied");
      expect(getStoredUser()).toBeNull();
    });

    it("authenticates registered user with their password", async () => {
      await registerAccount({
        fullName: "Juan Dela Cruz",
        email: "jdelacruz@km100.edu.ph",
        password: "MySecretPassword123",
        role: "staff",
        passkey: "KM100-STAFF-2026",
      });

      localStorage.removeItem("km100_auth_user_v1"); // reset session
      expect(getStoredUser()).toBeNull();

      const loginRes = await loginWithCredentials(
        "jdelacruz@km100.edu.ph",
        "MySecretPassword123",
      );
      expect(loginRes.success).toBe(true);
      expect(loginRes.user?.fullName).toBe("Juan Dela Cruz");
    });

    it("allows instant direct login using authorized institutional passkey", async () => {
      const passkeyLogin = await loginWithCredentials(
        "staff@km100.edu.ph",
        "KM100-STAFF-2026",
      );
      expect(passkeyLogin.success).toBe(true);
      expect(passkeyLogin.user?.role).toBe("staff");
    });

    it("authenticates 1-click evaluation demo accounts", async () => {
      const adminDemo = DEMO_STAFF_ACCOUNTS[0];
      const res = await loginWithCredentials(adminDemo.email, adminDemo.pass);
      expect(res.success).toBe(true);
      expect(res.user?.role).toBe("admin");
    });

    it("handles sign out correctly", async () => {
      await registerAccount({
        fullName: "Active User",
        email: "active@km100.edu.ph",
        password: "Password123",
        role: "staff",
        passkey: "KM100-STAFF-2026",
      });
      expect(getStoredUser()).not.toBeNull();

      await logoutCurrentSession();
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("Custom Institutional Passkey Management", () => {
    it("returns default passkeys when none are configured", () => {
      const keys = getInstitutionalPasskeys();
      expect(keys.adminPasskey).toBe("KM100-ADMIN-2026");
      expect(keys.staffPasskey).toBe("KM100-STAFF-2026");
    });

    it("allows the admin to update institutional passkeys and authorizes registration with the new passkeys", async () => {
      const updateRes = updateInstitutionalPasskeys({
        adminPasskey: "CUSTOM-CUSTODIAN-9999",
        staffPasskey: "CUSTOM-STAFF-8888",
      });
      expect(updateRes.success).toBe(true);
      expect(updateRes.passkeys.adminPasskey).toBe("CUSTOM-CUSTODIAN-9999");
      expect(updateRes.passkeys.staffPasskey).toBe("CUSTOM-STAFF-8888");

      // Register staff with new custom passkey
      const staffReg = await registerAccount({
        fullName: "New Staff",
        email: "newstaff@km100.edu.ph",
        password: "Password123",
        role: "staff",
        passkey: "CUSTOM-STAFF-8888",
      });
      expect(staffReg.success).toBe(true);

      // Register admin with new custom passkey
      const adminReg = await registerAccount({
        fullName: "New Admin",
        email: "newadmin@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "CUSTOM-CUSTODIAN-9999",
      });
      expect(adminReg.success).toBe(true);
    });

    it("rejects passkeys that are too short (<6 characters)", () => {
      const shortRes = updateInstitutionalPasskeys({
        adminPasskey: "123",
      });
      expect(shortRes.success).toBe(false);
      expect(shortRes.error).toContain("at least 6 characters");
    });

    it("restores default passkeys when resetInstitutionalPasskeys is called", () => {
      updateInstitutionalPasskeys({
        adminPasskey: "CUSTOM-ADMIN-XYZ",
        staffPasskey: "CUSTOM-STAFF-XYZ",
      });
      expect(getInstitutionalPasskeys().adminPasskey).toBe("CUSTOM-ADMIN-XYZ");

      const defaults = resetInstitutionalPasskeys();
      expect(defaults.adminPasskey).toBe("KM100-ADMIN-2026");
      expect(getInstitutionalPasskeys().adminPasskey).toBe("KM100-ADMIN-2026");
    });
  });
});
