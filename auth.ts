import { create } from "zustand";

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to login");
      }

      const data = await res.json();
      set({ user: data.user, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to login" });
      throw error;
    }
  },

  register: async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to register");
      }

      const data = await res.json();
      set({ user: data.user, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to register" });
      throw error;
    }
  },

  logout: async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to logout");
      }

      set({ user: null, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to logout" });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/user", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false, error: null });
      } else {
        set({ user: null, isLoading: false, error: null });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to check auth"
      });
    }
  },
}));