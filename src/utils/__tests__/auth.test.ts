import { describe, it, expect, beforeEach } from "vitest";
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
} from "../auth";

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

    it("blocks random user registration when passkey is missing or invalid", async () => {
      const randomUser = await registerAccount({
        fullName: "Random Stranger",
        email: "random@gmail.com",
        password: "Password123",
        role: "staff",
        passkey: "random-passkey-123",
      });

      expect(randomUser.success).toBe(false);
      expect(randomUser.error).toContain("Invalid Institutional Passkey");
      expect(getStoredUser()).toBeNull();
    });

    it("requires official Custodian Passkey for Admin registration", async () => {
      // Trying to register as Admin with only a staff passkey
      const staffKeyForAdmin = await registerAccount({
        fullName: "Fake Admin",
        email: "fakeadmin@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-STAFF-2026",
      });
      expect(staffKeyForAdmin.success).toBe(false);
      expect(staffKeyForAdmin.error).toContain("Custodian Passkey");

      // Registering with official Admin passkey
      const validAdmin = await registerAccount({
        fullName: "Authorized Custodian",
        email: "custodian@km100.edu.ph",
        password: "Password123",
        role: "admin",
        passkey: "KM100-ADMIN-2026",
      });
      expect(validAdmin.success).toBe(true);
      expect(validAdmin.user?.role).toBe("admin");
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
        "instructor@km100.edu.ph",
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
