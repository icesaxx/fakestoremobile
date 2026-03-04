import { create } from "zustand";

type User = {
    iat: number;
    sub: string;
    user: string;
    exp?: number;
}

type UserStore = {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    hydrateSession: (token: string | null, user: User | null) => void;
    clearSession: () => void;
}

const useUserStore = create<UserStore>((set) => ({
    user: null as User | null,
    token: null as string | null,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    hydrateSession: (token, user) => set({ token, user }),
    clearSession: () => set({ token: null, user: null }),
}))

export default useUserStore
