import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

type ThemeStore = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  syncSystemMode: (isSystemDark: boolean) => void;
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "system",
      isDark: false,
      setMode: (mode) =>
        set((state) => {
          if (mode === "system") {
            return { mode, isDark: state.isDark };
          }
          return { mode, isDark: mode === "dark" };
        }),
      syncSystemMode: (isSystemDark) =>
        set((state) => {
          if (state.mode !== "system") return state;
          return { ...state, isDark: isSystemDark };
        }),
    }),
    {
      name: "theme-mode",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;
