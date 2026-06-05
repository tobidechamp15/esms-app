import { create } from 'zustand';

import {
  cancelVisit,
  createVisit,
  getAllVisits,
  getVisitById,
  getVisits,
  verifyQR,
  type GetVisitsParams,
} from '@/api/visits';
import type { CreateVisitPayload, VerifyQRPayload, Visit, VisitState } from '@/types';

interface VerifyQRResult {
  visit: Visit;
  message: string;
}

interface VisitActions {
  // CRUD
  fetchVisits: (params?: GetVisitsParams, replace?: boolean) => Promise<void>;
  fetchAllVisits: (params?: GetVisitsParams, replace?: boolean) => Promise<void>;
  fetchVisitById: (id: string) => Promise<void>;
  createNewVisit: (payload: CreateVisitPayload) => Promise<Visit>;
  cancelVisitById: (id: string) => Promise<void>;

  // QR
  verifyVisitQR: (payload: VerifyQRPayload) => Promise<VerifyQRResult>;

  // State helpers
  setCurrentVisit: (visit: Visit | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialPagination: VisitState['pagination'] = {
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false,
};

const initialState: VisitState = {
  visits: [],
  currentVisit: null,
  isLoading: false,
  isFetching: false,
  error: null,
  pagination: initialPagination,
};

export const useVisitStore = create<VisitState & VisitActions>((set, get) => ({
  ...initialState,

  // ─── Fetch resident's own visits ─────────────────────────────────────────────

  fetchVisits: async (params = {}, replace = true) => {
    const isFetchingMore = !replace;
    set(isFetchingMore ? { isFetching: true, error: null } : { isLoading: true, error: null });

    try {
      const result = await getVisits(params);
      const { data, meta } = result;

      set((state) => ({
        visits: replace ? data : [...state.visits, ...data],
        pagination: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          hasMore: meta.page < meta.totalPages,
        },
        isLoading: false,
        isFetching: false,
      }));
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Failed to fetch visits.';
      set({ isLoading: false, isFetching: false, error: message });
    }
  },

  // ─── Fetch all visits (security / admin) ────────────────────────────────────

  fetchAllVisits: async (params = {}, replace = true) => {
    const isFetchingMore = !replace;
    set(isFetchingMore ? { isFetching: true, error: null } : { isLoading: true, error: null });

    try {
      const result = await getAllVisits(params);
      const { data, meta } = result;

      set((state) => ({
        visits: replace ? data : [...state.visits, ...data],
        pagination: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          hasMore: meta.page < meta.totalPages,
        },
        isLoading: false,
        isFetching: false,
      }));
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Failed to fetch visits.';
      set({ isLoading: false, isFetching: false, error: message });
    }
  },

  // ─── Fetch single visit ──────────────────────────────────────────────────────

  fetchVisitById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const visit = await getVisitById(id);
      set({ currentVisit: visit, isLoading: false });

      // Keep list in sync
      set((state) => ({
        visits: state.visits.map((v) => (v.id === id ? visit : v)),
      }));
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Failed to load visit.';
      set({ isLoading: false, error: message });
    }
  },

  // ─── Create ──────────────────────────────────────────────────────────────────

  createNewVisit: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const visit = await createVisit(payload);
      set((state) => ({
        visits: [visit, ...state.visits],
        currentVisit: visit,
        isLoading: false,
      }));
      return visit;
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Failed to create visit.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  cancelVisitById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await cancelVisit(id);
      set((state) => ({
        visits: state.visits.map((v) => (v.id === id ? updated : v)),
        currentVisit: state.currentVisit?.id === id ? updated : state.currentVisit,
        isLoading: false,
      }));
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Failed to cancel visit.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Verify QR ───────────────────────────────────────────────────────────────

  verifyVisitQR: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await verifyQR(payload);
      // Refresh list entry in store
      set((state) => ({
        visits: state.visits.map((v) => (v.id === result.visit.id ? result.visit : v)),
        isLoading: false,
      }));
      return result;
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'QR verification failed.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  setCurrentVisit: (visit) => set({ currentVisit: visit }),
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

// Selectors
export const selectVisits = (s: VisitState & VisitActions) => s.visits;
export const selectCurrentVisit = (s: VisitState & VisitActions) => s.currentVisit;
export const selectVisitLoading = (s: VisitState & VisitActions) => s.isLoading;
export const selectHasMoreVisits = (s: VisitState & VisitActions) => s.pagination.hasMore;
