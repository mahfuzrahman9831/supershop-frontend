import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────
      user:  null,
      token: null,

      // ── Actions ──────────────────────────────────────
      setAuth: (user, token) => set({ user, token }),

      updateUser: (user) => set({ user }),

      logout: () => set({ user: null, token: null }),

      // ── Computed helpers ─────────────────────────────
      isAuthenticated: () => Boolean(get().token),

      hasRole: (role) => get().user?.roles?.includes(role) ?? false,

      hasPermission: (perm) =>
        get().user?.permissions?.includes(perm) ?? false,
    }),
    {
      name: 'supershop-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)

export default useAuthStore