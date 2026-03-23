import { supabase } from "@/config/supabase";
import { User } from "@/processes/types/authTypes";
import { UserRole } from "@/processes/types/profileTypes";
import { create } from "zustand";

const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data } = await supabase
    .from("profile")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as UserRole) ?? null;
};

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  role: UserRole | null;
  checkAuth: () => Promise<void>;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  role: null,

  checkAuth: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let role: UserRole | null = null;
      if (session?.user) {
        role = await fetchUserRole(session.user.id);
      }

      set({
        isAuthenticated: !!session,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? "",
              name: (session.user.user_metadata?.name as string) ?? "",
            }
          : null,
        role,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ isAuthenticated: false, user: null, role: null, isLoading: false });
    }
  },

  signIn: async (user: User) => {
    const role = await fetchUserRole(user.id);
    set({ isAuthenticated: true, user, role });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, role: null });
  },

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },
}));
