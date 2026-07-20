/**
 * QR Code Validation Utility
 *
 * Validates scanned QR code data against allowed formats
 * to prevent injection attacks and malformed input.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Legacy QR token format: ESMS-<32hex>-<8hex>
 */
const QR_TOKEN_REGEX = /^ESMS-([A-F0-9]{32})-([A-F0-9]{8})$/;

/**
 * Access code format: exactly 5 digits
 */
const ACCESS_CODE_REGEX = /^\d{5}$/;

/**
 * Maximum length of any scanned QR data
 */
const MAX_QR_DATA_LENGTH = 128;

// ─── Types ───────────────────────────────────────────────────────────────────

export type QrCodeType = "access_code" | "qr_token" | "unknown";

export interface QrValidationResult {
  valid: boolean;
  type: QrCodeType;
  code: string;
  error?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate scanned QR code data.
 *
 * Accepts two formats:
 * 1. Legacy QR token: "ESMS-<uuid>-<random>" (from generateQRToken)
 * 2. Direct access code: "12345" (5-digit numeric)
 *
 * Rejects all other formats to prevent injection.
 */
export function validateQrData(data: string): QrValidationResult {
  // Check for empty or too long input
  if (!data || data.length > MAX_QR_DATA_LENGTH) {
    return {
      valid: false,
      type: "unknown",
      code: "",
      error: "Invalid QR code data",
    };
  }

  // Check for dangerous characters
  if (/[<>"'&;()]/.test(data)) {
    return {
      valid: false,
      type: "unknown",
      code: "",
      error: "QR code contains invalid characters",
    };
  }

  // Try matching legacy QR token format
  const tokenMatch = data.toUpperCase().match(QR_TOKEN_REGEX);
  if (tokenMatch) {
    return {
      valid: true,
      type: "qr_token",
      code: data.toUpperCase(),
    };
  }

  // Try matching direct 5-digit access code
  const trimmed = data.trim();
  if (ACCESS_CODE_REGEX.test(trimmed)) {
    return {
      valid: true,
      type: "access_code",
      code: trimmed,
    };
  }

  // Try extracting digits as fallback (for codes with extra formatting)
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length === 5) {
    return {
      valid: true,
      type: "access_code",
      code: digitsOnly,
    };
  }

  return {
    valid: false,
    type: "unknown",
    code: "",
    error:
      "Invalid QR code format. Expected a 5-digit access code or valid QR token.",
  };
}

/**
 * Rate limiting for QR code scans — ensures minimum interval between scans.
 */
export function createScanCooldown(minIntervalMs = 2000) {
  let lastScanTime = 0;

  return {
    /**
     * Check if enough time has passed since the last scan.
     */
    canScan(): boolean {
      return Date.now() - lastScanTime >= minIntervalMs;
    },

    /**
     * Record a scan attempt. Returns true if allowed.
     */
    recordScan(): boolean {
      const now = Date.now();
      if (now - lastScanTime < minIntervalMs) {
        return false;
      }
      lastScanTime = now;
      return true;
    },

    /**
     * Reset the cooldown (e.g., on screen change).
     */
    reset(): void {
      lastScanTime = 0;
    },
  };
}
