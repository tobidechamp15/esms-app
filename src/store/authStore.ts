import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { getMe, getStoredUser, login, logout, register } from '@/api/auth';
import { getStoredTokens } from '@/api/client';
import { STORAGE_KEYS } from '@/constants/api';
import type { AuthState, LoginPayload, RegisterPayload, User } from '@/types';

// ─── PIN helpers ──────────────────────────────────────────────────────────────

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AuthActions {
  // Lifecycle
  hydrate: () => Promise<void>;

  // Auth flows
  registerUser: (payload: RegisterPayload) => Promise<void>;
  loginUser: (payload: LoginPayload) => Promise<void>;
  logoutUser: () => Promise<void>;

  // PIN
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  clearPinVerified: () => void;

  // Misc
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isPinSet: false,
  isPinVerified: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  // ─── Hydrate on app launch ──────────────────────────────────────────────────

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const [user, tokens, pinHash] = await Promise.all([
        getStoredUser(),
        getStoredTokens(),
        SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH),
      ]);

      set({
        user,
        tokens,
        isPinSet: Boolean(pinHash),
        isPinVerified: false,
        isLoading: false,
      });

      // Silently refresh profile if we have a valid token
      if (user && tokens) {
        get().refreshProfile().catch(() => {
          // Non-fatal; user will see stale data
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // ─── Register ───────────────────────────────────────────────────────────────

  registerUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await register(payload);
      set({ user, tokens, isLoading: false });
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Registration failed.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Login ───────────────────────────────────────────────────────────────────

  loginUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await login(payload);
      const pinHash = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      set({ user, tokens, isPinSet: Boolean(pinHash), isLoading: false });
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Login failed.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Logout ──────────────────────────────────────────────────────────────────

  logoutUser: async () => {
    set({ isLoading: true, error: null });
    try {
      await logout();
      // Keep PIN hash so user can set it up again next login
      set({ ...initialState });
    } catch {
      set({ ...initialState });
    }
  },

  // ─── PIN Setup ───────────────────────────────────────────────────────────────

  setupPin: async (pin) => {
    const hash = await hashPin(pin);
    await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hash);
    set({ isPinSet: true, isPinVerified: true });
  },

  // ─── PIN Verify ──────────────────────────────────────────────────────────────

  verifyPin: async (pin) => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
    if (!stored) return false;
    const hash = await hashPin(pin);
    const match = hash === stored;
    if (match) set({ isPinVerified: true });
    return match;
  },

  clearPinVerified: () => set({ isPinVerified: false }),

  // ─── Refresh profile ─────────────────────────────────────────────────────────

  refreshProfile: async () => {
    try {
      const user = await getMe();
      set({ user });
    } catch {
      // Swallow; caller can handle if needed
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
}));

// Convenience selectors
export const selectUser = (s: AuthState & AuthActions) => s.user;
export const selectIsAuthenticated = (s: AuthState & AuthActions) =>
  Boolean(s.user && s.tokens);
export const selectUserRole = (s: AuthState & AuthActions) => s.user?.role ?? null;
