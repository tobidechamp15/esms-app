/**
 * App Security Initialization
 *
 * Centralized security checks and initializations that run at app startup.
 * Handles device integrity checks, debugging detection, and more.
 */

import { Platform } from "react-native";
import * as ScreenCapture from "expo-screen-capture";

import { getSecurityStatus } from "./deviceSecurity";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppSecurityResult {
  deviceCompromised: boolean;
  debuggerAttached: boolean;
  screenCapturePrevented: boolean;
  warnings: string[];
}

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Initialize app security protections.
 * Should be called once at app startup in the root layout.
 *
 * @returns Security status after initialization
 */
export async function initializeAppSecurity(): Promise<AppSecurityResult> {
  const warnings: string[] = [];
  const result: AppSecurityResult = {
    deviceCompromised: false,
    debuggerAttached: false,
    screenCapturePrevented: false,
    warnings,
  };

  // 1. Enable screen recording protection globally
  try {
    await ScreenCapture.preventScreenCaptureAsync();
    result.screenCapturePrevented = true;
  } catch {
    warnings.push("Failed to enable screen recording protection");
  }

  // 2. Check device integrity (jailbreak/root detection)
  try {
    const securityStatus = await getSecurityStatus();
    result.deviceCompromised = securityStatus.isCompromised;
    result.debuggerAttached = securityStatus.isDebuggerAttached;

    if (securityStatus.isCompromised) {
      warnings.push(
        `Device appears to be compromised: ${securityStatus.reasons.join(", ")}`,
      );
    }

    if (securityStatus.isDebuggerAttached) {
      warnings.push("Debugger detected on production build");
    }
  } catch {
    warnings.push("Device integrity check failed");
  }

  // 3. Log security warnings in development
  if (__DEV__ && warnings.length > 0) {
    console.warn("[Security]", warnings.join(" | "));
  }

  return result;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Clean up security protections when the app goes to background.
 * Re-enable screen capture protection when app comes back to foreground.
 */
export async function onAppBackground(): Promise<void> {
  // Allow screen capture in background to prevent black screens in multi-tasking
  try {
    await ScreenCapture.allowScreenCaptureAsync();
  } catch {
    // Best-effort
  }
}

export async function onAppForeground(): Promise<void> {
  // Re-enable screen recording protection
  try {
    await ScreenCapture.preventScreenCaptureAsync();
  } catch {
    // Best-effort
  }
}
