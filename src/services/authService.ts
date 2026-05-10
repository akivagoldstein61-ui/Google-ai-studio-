/**
 * Phone & Google authentication service.
 *
 * Production: uses Firebase Phone Auth with invisible reCAPTCHA.
 * Demo mode: short-circuits to a synthetic local user so reviewers can
 * walk the flow without sending real SMS.
 *
 * The OnboardingFlow calls these methods in sequence:
 *   1. startPhoneAuth(phoneNumber)  →  returns confirmationResult
 *   2. confirmPhoneCode(code)       →  returns User
 */

import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as fbSignOut,
  type ConfirmationResult,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/firebase";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let pendingConfirmation: ConfirmationResult | null = null;

/**
 * Set up an invisible reCAPTCHA verifier on the page.
 * Idempotent — safe to call multiple times.
 */
function ensureRecaptcha(containerId = "recaptcha-container"): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;

  // Ensure the container exists in the DOM
  if (typeof document !== "undefined" && !document.getElementById(containerId)) {
    const div = document.createElement("div");
    div.id = containerId;
    div.style.display = "none";
    document.body.appendChild(div);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved — proceeds automatically
    },
  });
  return recaptchaVerifier;
}

export interface AuthResult {
  uid: string;
  phoneNumber: string | null;
  isNewUser: boolean;
}

export const authService = {
  /**
   * Send an SMS verification code to the given phone number.
   * Returns true on success; throws on failure.
   */
  async startPhoneAuth(phoneNumber: string): Promise<{ success: boolean; mode: "real" | "demo" }> {
    if (isPrototypeDemoMode()) {
      pendingConfirmation = null; // signal demo
      return { success: true, mode: "demo" };
    }

    // Normalize: ensure leading +
    const normalized = phoneNumber.trim().replace(/[^\d+]/g, "");
    const e164 = normalized.startsWith("+") ? normalized : `+972${normalized.replace(/^0/, "")}`;

    const verifier = ensureRecaptcha();
    try {
      pendingConfirmation = await signInWithPhoneNumber(auth, e164, verifier);
      return { success: true, mode: "real" };
    } catch (err: any) {
      // Reset the verifier on failure so the next attempt can re-create it
      try {
        verifier.clear();
      } catch {
        // swallow
      }
      recaptchaVerifier = null;
      throw err;
    }
  },

  /**
   * Confirm the SMS code. Returns the signed-in user.
   */
  async confirmPhoneCode(code: string): Promise<AuthResult> {
    if (isPrototypeDemoMode()) {
      // Demo mode — accept any 6-digit code
      if (!/^\d{6}$/.test(code)) {
        throw new Error("Invalid code format");
      }
      return {
        uid: "demo-user-" + Math.random().toString(36).slice(2),
        phoneNumber: null,
        isNewUser: true,
      };
    }
    if (!pendingConfirmation) {
      throw new Error("No pending phone confirmation — call startPhoneAuth first");
    }
    const result = await pendingConfirmation.confirm(code);
    const user = result.user;
    pendingConfirmation = null;
    return {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      // Heuristic: newly-created users have creationTime ≈ lastSignInTime
      isNewUser:
        !!user.metadata.creationTime &&
        Math.abs(
          Date.parse(user.metadata.creationTime) -
            Date.parse(user.metadata.lastSignInTime || user.metadata.creationTime),
        ) < 5000,
    };
  },

  /**
   * Sign in with Google (popup). Returns the signed-in user.
   */
  async signInWithGoogle(): Promise<AuthResult> {
    if (isPrototypeDemoMode()) {
      return {
        uid: "demo-google-" + Math.random().toString(36).slice(2),
        phoneNumber: null,
        isNewUser: true,
      };
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      isNewUser:
        !!user.metadata.creationTime &&
        Math.abs(
          Date.parse(user.metadata.creationTime) -
            Date.parse(user.metadata.lastSignInTime || user.metadata.creationTime),
        ) < 5000,
    };
  },

  async signOut(): Promise<void> {
    if (!isPrototypeDemoMode()) {
      await fbSignOut(auth);
    }
  },

  currentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
