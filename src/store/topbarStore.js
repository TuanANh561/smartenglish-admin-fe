import { create } from 'zustand'

export const useTopbarStore = create((set) => ({
  customHeader: null,
  setCustomHeader: (header) => set({ customHeader: header }),
  clearCustomHeader: () => set({ customHeader: null }),
}))
