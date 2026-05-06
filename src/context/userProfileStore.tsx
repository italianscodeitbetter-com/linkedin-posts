import { create } from 'zustand'

type UserProfile = {
    id: string
    company: string
    role: string
    role_description: string
    company_description: string
    updated_at: string
}

type UserStore = {
    user: UserProfile | null
    setUser: (user: UserProfile) => void
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