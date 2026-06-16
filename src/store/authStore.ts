import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { clearTokens, getStoredTokens } from '@/api/client';
import {
  getMe,
  getStoredUser,
  loginWithPhone,
  logout,
  registerWithPhone,
} from '@/api/auth';
import { STORAGE_KEYS } from '@/constants/api';
import type { AuthState, RegisterPhonePayload, User } from '@/types';

// ─── PIN helpers ──────────────────────────────────────────────────────────────

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AuthActions {
  hydrate: () => Promise<void>;
  registerUser: (payload: RegisterPhonePayload, otpToken: string) => Promise<void>;
  loginUser: (otpToken: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  clearPinVerified: () => void;
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
      if (user && tokens) {
        get()
          .refreshProfile()
          .catch(() => {});
      }
    } catch {
      set({ isLoading: false });
    }
  },

  registerUser: async (payload, otpToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await registerWithPhone(payload, otpToken);
      set({ user, tokens, isLoading: false });
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Registration failed.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  loginUser: async (otpToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await loginWithPhone(otpToken);
      const pinHash = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      set({ user, tokens, isPinSet: Boolean(pinHash), isLoading: false });
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Login failed.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logoutUser: async () => {
    set({ isLoading: true });
    try {
      await logout();
    } catch {}
    await clearTokens();
    set({ ...initialState });
  },

  setupPin: async (pin) => {
    const hash = await hashPin(pin);
    await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hash);
    set({ isPinSet: true, isPinVerified: true });
  },

  verifyPin: async (pin) => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
    if (!stored) return false;
    const hash = await hashPin(pin);
    const match = hash === stored;
    if (match) set({ isPinVerified: true });
    return match;
  },

  clearPinVerified: () => set({ isPinVerified: false }),

  refreshProfile: async () => {
    try {
      const user = await getMe();
      set({ user });
    } catch {}
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
}));

export const selectUser = (s: AuthState & AuthActions) => s.user;
export const selectIsAuthenticated = (s: AuthState & AuthActions) =>
  Boolean(s.user && s.tokens);
