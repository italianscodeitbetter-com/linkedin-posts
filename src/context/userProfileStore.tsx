import type { UserProfile } from '@/lib/user-profile'
import { create } from 'zustand'

type UserStore = {
    user: UserProfile | null
    setUser: (user: UserProfile | null) => void
    updateUser: (partial: Partial<UserProfile>) => void
    clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    updateUser: (partial) =>
        set((state) => ({
            user: state.user ? { ...state.user, ...partial } : null,
        })),

    clearUser: () => set({ user: null }),
}))
