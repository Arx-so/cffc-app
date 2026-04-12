import { supabase } from "@/config/supabase";
import { User } from "@/processes/types/authTypes";
import { syncAthleteProfileRowForRole } from "@/processes/profile";
import { UserRole } from "@/processes/types/profileTypes";
import { create } from "zustand";

type AuthMetadata = Record<string, unknown>;
const VALID_ROLES: UserRole[] = ["athlete", "pro", "club", "admin"];

const normalizeMetaString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readMetadataValue = (
  metadata: AuthMetadata,
  keys: string[]
): string | null => {
  for (const key of keys) {
    const value = normalizeMetaString(metadata[key]);
    if (value) return value;
  }
  return null;
};

const readMetadataRole = (metadata: AuthMetadata): UserRole | null => {
  const role = readMetadataValue(metadata, ["profile_role", "role"]);
  if (!role) return null;
  return VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : null;
};

const syncProfileFromMetadata = async (
  userId: string,
  metadata: AuthMetadata
): Promise<void> => {
  const { data: profile } = await supabase
    .from("profile")
    .select("name, role, username, city, state, phone, birth_date, guardian_email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return;

  const nameFromMeta = readMetadataValue(metadata, ["name", "full_name"]);
  const roleFromMeta = readMetadataRole(metadata);
  const usernameFromMeta = readMetadataValue(metadata, ["username", "user_name"]);
  const cityFromMeta = readMetadataValue(metadata, ["city"]);
  const stateFromMeta = readMetadataValue(metadata, ["state", "state_prov"]);
  const phoneFromMeta = readMetadataValue(metadata, ["phone", "phone_number"]);
  const birthDateFromMeta = readMetadataValue(metadata, ["birth_date"]);
  const guardianEmailFromMeta = readMetadataValue(metadata, ["guardian_email"]);

  const updates: Record<string, unknown> = {};

  if (!profile.name && nameFromMeta) {
    updates.name = nameFromMeta;
  }
  if (roleFromMeta && profile.role !== roleFromMeta) {
    updates.role = roleFromMeta;
  }
  if (!profile.username && usernameFromMeta) {
    updates.username = usernameFromMeta.replace(/^@+/, "").toLowerCase();
  }
  if (!profile.city && cityFromMeta) {
    updates.city = cityFromMeta;
  }
  if (!profile.state && stateFromMeta) {
    updates.state = stateFromMeta.toUpperCase();
  }
  if (!profile.phone && phoneFromMeta) {
    updates.phone = phoneFromMeta;
  }
  if (!profile.birth_date && birthDateFromMeta) {
    updates.birth_date = birthDateFromMeta;
  }
  if (!profile.guardian_email && guardianEmailFromMeta) {
    updates.guardian_email = guardianEmailFromMeta;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("profile").update(updates).eq("id", userId);
  }

  // Align athlete_profile to the role actually stored in profile (avoids relying on metadata alone).
  const { data: roleRow } = await supabase
    .from("profile")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  await syncAthleteProfileRowForRole(
    userId,
    (roleRow?.role as UserRole | null) ?? null,
  );
};

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
        const metadata = (session.user.user_metadata as AuthMetadata) ?? {};
        await syncProfileFromMetadata(session.user.id, metadata);
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
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser?.id) {
      const metadata = (authUser.user_metadata as AuthMetadata) ?? {};
      await syncProfileFromMetadata(authUser.id, metadata);
    }

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
