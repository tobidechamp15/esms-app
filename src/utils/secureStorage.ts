/**
 * Secure Storage Service
 *
 * Wraps expo-secure-store with additional safety features:
 * - Key prefixing to avoid collisions
 * - Token expiry validation at the storage level
 * - Bulk cleanup on logout
 * - TTL support
 */

import * as SecureStore from "expo-secure-store";

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "ventry_";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
  REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
  TOKEN_EXPIRY: `${STORAGE_PREFIX}token_expiry`,
  USER: `${STORAGE_PREFIX}user`,
  PIN_HASH: `${STORAGE_PREFIX}pin_hash`,
  OTP_TOKEN: `${STORAGE_PREFIX}otp_token`,
  ESTATE_PIN_VERIFIED: `${STORAGE_PREFIX}estate_pin_verified`,
  BIOMETRIC_ENABLED: `${STORAGE_PREFIX}biometric_enabled`,
} as const;

const ALL_KEYS = Object.values(STORAGE_KEYS);

// ─── Safe User Serialization ─────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  isAdmin: boolean;
  phone: string;
}

/**
 * Strip sensitive/irrelevant fields from user object before storing.
 * Only stores fields needed for offline display and role checks.
 */
export function sanitizeUserForStorage(user: any): SafeUser {
  return {
    id: user.id || user._id?.toString() || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: user.role || "resident",
    isAdmin: Boolean(user.isAdmin),
    phone: user.phone || "",
  };
}

// ─── Token Management with Expiry ────────────────────────────────────────────

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Save tokens to secure storage.
 */
export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    SecureStore.setItemAsync(
      STORAGE_KEYS.TOKEN_EXPIRY,
      String(tokens.expiresAt),
    ),
  ]);
}

/**
 * Retrieve tokens with staleness check.
 * Returns null if tokens are expired or missing.
 */
export async function getTokens(): Promise<StoredTokens | null> {
  try {
    const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);

    if (!accessToken || !refreshToken || !expiresAtStr) {
      return null;
    }

    const expiresAt = Number(expiresAtStr);

    // Check if token is expired at storage level
    if (Date.now() > expiresAt) {
      await clearAllSecureData();
      return null;
    }

    return { accessToken, refreshToken, expiresAt };
  } catch {
    return null;
  }
}

/**
 * Save user object to secure storage with sanitization.
 */
export async function saveUser(user: any): Promise<void> {
  const safe = sanitizeUserForStorage(user);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(safe));
}

/**
 * Retrieve sanitized user from secure storage.
 */
export async function getStoredUser(): Promise<SafeUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as SafeUser;
  } catch {
    return null;
  }
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

/**
 * Clear all Ventry-related data from secure storage.
 * Called on logout, token expiry, or security events.
 */
export async function clearAllSecureData(): Promise<void> {
  await Promise.all(
    ALL_KEYS.map((key) =>
      SecureStore.deleteItemAsync(key).catch(() => {
        /* best-effort */
      }),
    ),
  );
}

/**
 * Count how many items are currently stored (for debugging).
 */
export async function getStoredKeyCount(): Promise<number> {
  let count = 0;
  for (const key of ALL_KEYS) {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) count++;
    } catch {
      // Key might not exist
    }
  }
  return count;
}

// ─── PIN Management ──────────────────────────────────────────────────────────

/**
 * Save hashed PIN to secure storage.
 */
export async function savePinHash(hash: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hash);
}

/**
 * Get stored PIN hash.
 */
export async function getPinHash(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
}

/**
 * Delete stored PIN hash.
 */
export async function deletePinHash(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH);
}
