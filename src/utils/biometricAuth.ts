/**
 * Biometric Authentication Utility
 *
 * Provides biometric authentication (Face ID, Touch ID, fingerprint)
 * as a more secure alternative to 4-digit PIN.
 */

import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BiometricType = "face" | "fingerprint" | "iris" | "unknown";

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometryType: BiometricType | null;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

// ─── Status Checks ───────────────────────────────────────────────────────────

/**
 * Check if biometric authentication is available on this device.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = hasHardware
    ? await LocalAuthentication.isEnrolledAsync()
    : false;
  const supportedTypes = hasHardware
    ? await LocalAuthentication.supportedAuthenticationTypesAsync()
    : [];

  let biometryType: BiometricType | null = null;
  if (
    supportedTypes.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    )
  ) {
    biometryType = "face";
  } else if (
    supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
  ) {
    biometryType = "fingerprint";
  } else if (
    supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
  ) {
    biometryType = "iris";
  }

  return {
    isAvailable: hasHardware && isEnrolled,
    isEnrolled,
    biometryType,
  };
}

// ─── Authentication ──────────────────────────────────────────────────────────

const AUTH_CONFIG: LocalAuthentication.LocalAuthenticationOptions = {
  promptMessage: "Unlock Ventry",
  fallbackLabel: "Enter PIN",
  cancelLabel: "Cancel",
  disableDeviceFallback: false,
};

/**
 * Authenticate the user via biometrics.
 * Falls back to device PIN/password if biometrics fail or are unavailable.
 */
export async function authenticateWithBiometrics(
  options?: Partial<LocalAuthentication.LocalAuthenticationOptions>,
): Promise<BiometricAuthResult> {
  try {
    const status = await getBiometricStatus();

    if (!status.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available on this device",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      ...AUTH_CONFIG,
      ...options,
    });

    if (result.success) {
      return { success: true };
    }

    // Map error codes to human-readable messages
    const errMsg = (result.error ?? "").toLowerCase();
    if (errMsg.includes("user_cancel") || errMsg.includes("app_cancel")) {
      return { success: false, error: "Authentication cancelled" };
    }
    if (errMsg.includes("system_cancel")) {
      return {
        success: false,
        error: "System cancelled authentication",
      };
    }
    if (errMsg.includes("lockout_permanent")) {
      return {
        success: false,
        error:
          "Biometric authentication is disabled. Please use your device PIN.",
      };
    }
    if (errMsg.includes("lockout")) {
      return {
        success: false,
        error: "Too many attempts. Please use your device PIN.",
      };
    }
    return { success: false, error: result.error ?? "Authentication failed" };
  } catch (err) {
    return {
      success: false,
      error: `Authentication error: ${(err as Error).message}`,
    };
  }
}

// ─── Platform-Specific Messages ──────────────────────────────────────────────

/**
 * Get a user-friendly message describing the available biometric
 * authentication type on the current device.
 */
export function getBiometricPromptMessage(): string {
  if (Platform.OS === "ios") {
    return "Use Face ID or Touch ID to unlock Ventry";
  }
  if (Platform.OS === "android") {
    return "Use your fingerprint or face to unlock Ventry";
  }
  return "Use biometric authentication to unlock Ventry";
}

/**
 * Check if the user has biometrics enrolled on their device.
 * Useful for showing/hiding the "Use Biometrics" option.
 */
export async function hasBiometricsEnrolled(): Promise<boolean> {
  const status = await getBiometricStatus();
  return status.isAvailable;
}
