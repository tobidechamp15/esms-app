/**
 * Deep Link Validation Utility
 *
 * Validates incoming deep links against a whitelist of allowed paths
 * to prevent open redirect and phishing attacks.
 */

// ─── Allowed Paths ───────────────────────────────────────────────────────────

/**
 * Whitelist of allowed deep link paths.
 * Only these paths can be navigated to via deep links.
 */
const ALLOWED_PATHS = new Set([
  "/home",
  "/verify",
  "/verify/result",
  "/verify/scan",
  "/visitors",
  "/generate",
  "/notifications",
  "/notifications/announce",
  "/notifications/report",
  "/settings",
  "/settings/account",
  "/settings/security",
  "/settings/notification-settings",
  "/settings/legal",
  "/settings/report-concern",
  "/panic",
  "/support",
  "/support/manage",
  "/support/generate-activation",
]);

/**
 * Allowed URL schemes for the app.
 */
const ALLOWED_SCHEMES = new Set(["ventry", "ventry+"]);

/**
 * Maximum URL length to prevent abuse.
 */
const MAX_URL_LENGTH = 2048;

// ─── Validation ──────────────────────────────────────────────────────────────

export interface DeepLinkValidationResult {
  valid: boolean;
  reason?: string;
  path?: string;
  params?: Record<string, string>;
}

/**
 * Validates an incoming deep link URL against the whitelist.
 *
 * @param url - The deep link URL to validate (e.g., "ventry://home" or "ventry://verify/result?ok=1")
 * @returns ValidationResult with validity status and extracted path/params
 */
export function validateDeepLink(url: string): DeepLinkValidationResult {
  try {
    // Length check to prevent buffer overflow attacks
    if (url.length > MAX_URL_LENGTH) {
      return { valid: false, reason: "URL exceeds maximum length" };
    }

    // Block URLs with dangerous characters
    if (/[<>"'\t\n\r]/.test(url)) {
      return { valid: false, reason: "URL contains invalid characters" };
    }

    const parsed = new URL(url);

    // Validate scheme
    if (!ALLOWED_SCHEMES.has(parsed.protocol.replace(":", ""))) {
      return {
        valid: false,
        reason: `Unsupported URL scheme: ${parsed.protocol}`,
      };
    }

    // Extract path — handle both ventry://path and ventry:///path formats
    let path = parsed.pathname;
    if ((parsed.hostname && !path) || path === "/") {
      path = `/${parsed.hostname}`;
    }

    // Normalize path (remove trailing slash)
    path = path.replace(/\/$/, "") || "/";

    // Validate path against whitelist
    if (!ALLOWED_PATHS.has(path)) {
      return { valid: false, reason: `Path not allowed: ${path}` };
    }

    // Validate query parameters — reject if they contain script injection
    const params: Record<string, string> = {};
    for (const [key, value] of parsed.searchParams.entries()) {
      // Block HTML/script injection in params
      if (/[<>"'&]/.test(value)) {
        return {
          valid: false,
          reason: `Invalid characters in parameter: ${key}`,
        };
      }
      params[key] = value;
    }

    return { valid: true, path, params };
  } catch {
    return { valid: false, reason: "Malformed URL" };
  }
}

/**
 * Validates and sanitizes a navigation path to prevent open redirects.
 *
 * @param path - The path to validate before passing to router.push()
 * @returns The sanitized path if valid, or a safe fallback
 */
export function validateNavigationPath(
  path: string,
  fallback = "/(app)/home",
): string {
  // Only allow known app paths
  if (!path.startsWith("/(app)/") && !path.startsWith("/(auth)/")) {
    return fallback;
  }

  // Extract the relative path for whitelist checking
  const relativePath = path.replace(/^\/(?:\(app\)|\(auth\))/, "");

  // Block path traversal
  if (relativePath.includes("..")) {
    return fallback;
  }

  return path;
}
