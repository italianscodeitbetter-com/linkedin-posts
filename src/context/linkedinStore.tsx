import { create } from 'zustand'

type LinkedinStore = {
    isLinkedinConnected: boolean
    setIsLinkedinConnected: (isLinkedinConnected: boolean) => void
}

export const useLinkedinStore = create<LinkedinStore>((set) => ({
    isLinkedinConnected: false,
    setIsLinkedinConnected: (isLinkedinConnected) => set({ isLinkedinConnected }),
}))