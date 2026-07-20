/**
 * Device Security Utility
 *
 * Provides jailbreak/root detection, debugging detection,
 * and device integrity checks for the Ventry mobile app.
 */

import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// ─── Jailbreak / Root Detection ──────────────────────────────────────────────

/**
 * iOS jailbreak indicator paths — these files exist only on jailbroken devices.
 */
const JAILBROKEN_PATHS = [
  "/Applications/Cydia.app",
  "/Applications/FakeCarrier.app",
  "/Applications/Icy.app",
  "/Applications/IntelliScreen.app",
  "/Applications/MxTube.app",
  "/Applications/RockApp.app",
  "/Applications/SBSettings.app",
  "/Applications/WinterBoard.app",
  "/Library/MobileSubstrate/MobileSubstrate.dylib",
  "/Library/MobileSubstrate/DynamicLibraries/.ae.plist",
  "/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
  "/bin/bash",
  "/bin/sh",
  "/etc/apt",
  "/etc/ssh/sshd_config",
  "/private/var/lib/apt",
  "/private/var/mobile/Library/SBSettings/Themes",
  "/private/var/stash",
  "/private/var/tmp/cydia.log",
  "/usr/bin/sshd",
  "/usr/libexec/ssh-keysign",
  "/usr/sbin/sshd",
  "/var/cache/apt",
  "/var/lib/cydia",
  "/var/log/syslog",
  "/var/tmp/cydia.log",
];

/**
 * Android root indicator paths / packages
 */
const ROOT_INDICATORS = ["su", "busybox", "supolicy"];

/**
 * Check if the device is jailbroken (iOS) or rooted (Android).
 * Uses file existence checks and system property inspection.
 */
export async function checkDeviceIntegrity(): Promise<{
  isCompromised: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  try {
    if (Platform.OS === "ios") {
      await checkIOSJailbreak(reasons);
    } else if (Platform.OS === "android") {
      await checkAndroidRoot(reasons);
    }
  } catch {
    // If checks fail, assume safe but log reason
    reasons.push("Integrity check failed to run");
  }

  return { isCompromised: reasons.length > 0, reasons };
}

async function checkIOSJailbreak(reasons: string[]): Promise<void> {
  // Check for suspicious files
  for (const path of JAILBROKEN_PATHS) {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        reasons.push(`Jailbreak indicator found: ${path}`);
        // One indicator is enough
        return;
      }
    } catch {
      // Path doesn't exist or can't be accessed — expected on non-jailbroken
    }
  }

  // Check if we can write outside of sandbox (symptom of jailbreak)
  try {
    await FileSystem.writeAsStringAsync("/private/test_write.txt", "test");
    reasons.push("Write access outside sandbox — possible jailbreak");
  } catch {
    // Expected — sandbox is intact
  }
}

async function checkAndroidRoot(reasons: string[]): Promise<void> {
  // Check for common root binary paths
  const rootPaths = [
    "/system/app/Superuser.apk",
    "/system/app/SuperSU.apk",
    "/system/app/Magisk.apk",
    "/system/xbin/su",
    "/system/bin/su",
    "/sbin/su",
    "/data/local/xbin/su",
    "/data/local/bin/su",
    "/data/local/su",
    "/system/sd/xbin/su",
    "/system/bin/failsafe/su",
    "/data/local/tmp/su",
  ];

  for (const path of rootPaths) {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        reasons.push(`Root indicator found: ${path}`);
        return;
      }
    } catch {
      // Expected
    }
  }

  // Check for Magisk
  try {
    const info = await FileSystem.getInfoAsync("/data/adb/magisk.db");
    if (info.exists) {
      reasons.push("Magisk detected");
    }
  } catch {
    // Expected
  }
}

// ─── Debugger Detection ──────────────────────────────────────────────────────

/**
 * Check if a debugger is likely attached to the app.
 * Returns true if debug mode is detected in production builds.
 */
export function isDebuggerAttached(): boolean {
  // In dev mode, debugger is expected — don't flag
  if (__DEV__) return false;

  // Check React Native debugger indicators
  if ((global as any).__REACTOTRON__) return true;
  if ((global as any).__FLIPPER__) return true;

  // Check for remote debugging
  if ((global as any).__REMOTE_DEBUG__) return true;

  return false;
}

/**
 * Check if the app is running in an emulator or simulator.
 */
export async function isEmulator(): Promise<boolean> {
  if (Platform.OS === "ios") {
    // iOS simulators have specific files
    try {
      const info = await FileSystem.getInfoAsync("/Applications/Simulator.app");
      if (info.exists) return true;
    } catch {
      // Expected on real device
    }
  }

  if (Platform.OS === "android") {
    // Check common emulator properties
    try {
      const build = Platform.constants as any;
      if (
        build?.Brand?.toLowerCase().includes("generic") ||
        build?.Manufacturer?.toLowerCase().includes("genymotion") ||
        build?.Device?.toLowerCase().includes("vbox86p") ||
        build?.Product?.toLowerCase().includes("sdk") ||
        build?.Product?.toLowerCase().includes("emu64") ||
        build?.Hardware?.toLowerCase().includes("ranchu")
      ) {
        return true;
      }
    } catch {
      // Expected
    }
  }

  return false;
}

// ─── Combined Security Check ─────────────────────────────────────────────────

export interface SecurityStatus {
  isCompromised: boolean;
  isDebuggerAttached: boolean;
  isEmulator: boolean;
  reasons: string[];
}

/**
 * Run ALL device security checks and return a comprehensive status.
 * Used at app startup and before sensitive operations.
 */
export async function getSecurityStatus(): Promise<SecurityStatus> {
  const { isCompromised, reasons } = await checkDeviceIntegrity();

  return {
    isCompromised,
    isDebuggerAttached: isDebuggerAttached(),
    isEmulator: await isEmulator(),
    reasons,
  };
}
