import { create } from "zustand";

interface State {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<State>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
