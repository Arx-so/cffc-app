import { supabase } from "@/config/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { applySignupRoleFromClient } from "@/processes/profile";
import { ClubHistoryEntry } from "./types/profileTypes";
import { LoginResponse, SignupResponse } from "./types/authTypes";

// Parse access_token / refresh_token from the OAuth redirect URL.
// Supabase returns them in the URL fragment (#access_token=...&refresh_token=...).
const parseOAuthTokens = (url: string) => {
  const hash = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
  const params = new URLSearchParams(hash);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token') ?? '',
  };
};

// Supabase spreads auth redirect data across the query string AND the fragment
// depending on the flow (implicit vs PKCE vs token_hash), so read both.
const parseAuthRedirectParams = (url: string): Record<string, string> => {
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.includes('?') ? beforeHash.split('?').slice(1).join('?') : '';
  const params: Record<string, string> = {};

  for (const chunk of [query, hash]) {
    if (!chunk) continue;
    new URLSearchParams(chunk).forEach((value, key) => {
      if (value) params[key] = value;
    });
  }

  return params;
};

// True when the URL carries anything the recovery flow can act on — lets the UI
// tell "opened from the email link" apart from "landed here with no link".
export const hasPasswordRecoveryParams = (url: string): boolean => {
  const params = parseAuthRedirectParams(url);
  return !!(
    params.access_token ||
    params.token_hash ||
    params.code ||
    params.error ||
    params.error_description
  );
};

export const login = async (body: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) throw error;
  if (!data.session || !data.user) throw new Error("Login failed");

  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: (data.user.user_metadata?.name as string) ?? "",
    },
  };
};

export const signup = async (body: {
  email: string;
  password: string;
  name: string;
  username: string;
  role: 'athlete' | 'pro' | 'club';
  birthDate: string; // YYYY-MM-DD
  guardianEmail?: string;
  city?: string;
  state?: string;
  phone?: string;
  athleteHeight?: number;
  athleteWeight?: number;
  athleteDominantFoot?: "right" | "left" | "both";
  athletePositions?: string[];
  athleteStrengths?: string[];
  athleteCurrentCategory?: string;
  athleteAvailability?: string;
  athleteClubHistory?: ClubHistoryEntry[];
  athleteIsSearchable?: boolean;
  athleteContactVisibility?: "clubs_agents" | "public";
}): Promise<SignupResponse> => {
  const normalizedPhone = (body.phone ?? "").replace(/\D/g, "");

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      // These fields are persisted to auth.users.raw_user_meta_data and will
      // be used by the `public.handle_new_user` trigger to create the profile row.
      data: {
        name: body.name,
        full_name: body.name,
        username: body.username,
        user_name: body.username,
        role: body.role,
        // Some Auth / trigger setups ignore or mishandle `role`; keep an explicit alias.
        profile_role: body.role,
        birth_date: body.birthDate,
        guardian_email: body.guardianEmail ?? '',
        city: body.city ?? "",
        state: body.state ?? "",
        state_prov: body.state ?? "",
        phone: normalizedPhone,
        phone_number: normalizedPhone,
        athlete_height: body.athleteHeight ?? null,
        athlete_weight: body.athleteWeight ?? null,
        athlete_dominant_foot: body.athleteDominantFoot ?? null,
        athlete_positions: body.athletePositions ?? [],
        athlete_strengths: body.athleteStrengths ?? [],
        athlete_current_category: body.athleteCurrentCategory ?? "",
        athlete_availability: body.athleteAvailability ?? "",
        athlete_club_history: body.athleteClubHistory ?? [],
        athlete_is_searchable: body.athleteIsSearchable ?? true,
        athlete_contact_visibility: body.athleteContactVisibility ?? "clubs_agents",
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Signup failed");

  // Correct profile + athlete_profile when we already have a session (e.g. email confirm disabled).
  if (data.session?.user?.id) {
    await applySignupRoleFromClient(data.user.id, body.role);
  }

  // Only return a token (and auto-sign-in) when the email is already confirmed.
  // If email confirmation is required, email_confirmed_at will be null and
  // session will be null — the user must verify their inbox first.
  const emailConfirmed = !!data.user.email_confirmed_at;
  const token = emailConfirmed && data.session?.access_token
    ? data.session.access_token
    : "";

  return {
    token,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: body.name,
    },
  };
};

export const deleteAccount = async (): Promise<void> => {
  const { error } = await supabase.rpc("cffc_delete_own_account");
  if (error) throw error;
};

export const signInWithGoogle = async (): Promise<LoginResponse | null> => {
  // The redirect URI must match one of the Allowed Redirect URLs in Supabase dashboard.
  // makeRedirectUri uses cffc:// in production and exp:// in Expo Go automatically.
  const redirectTo = makeRedirectUri({ scheme: 'cffc' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true, // We open the browser manually below
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned from Supabase');

  // Open the Google consent screen inside an in-app browser session.
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') return null; // User cancelled

  const { access_token, refresh_token } = parseOAuthTokens(result.url);
  if (!access_token) throw new Error('No access token in OAuth redirect');

  // Exchange tokens with Supabase to create a persisted session.
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) throw sessionError;
  if (!sessionData.user) throw new Error('Failed to create session from OAuth tokens');

  const user = sessionData.user;
  return {
    token: access_token,
    user: {
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
    },
  };
};

// --- Password recovery -------------------------------------------------------

// Deep link the recovery email sends the user back to. It must be listed under
// Authentication -> URL Configuration -> Redirect URLs in the Supabase dashboard.
// makeRedirectUri yields cffc://reset-password in a build and exp://.../--/reset-password in Expo Go.
export const getPasswordResetRedirectTo = (): string =>
  makeRedirectUri({ scheme: 'cffc', path: 'reset-password' });

// Sends the "reset your password" email. Supabase answers 200 even for unknown
// addresses (by design, so the endpoint cannot be used to enumerate accounts).
export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectTo(),
  });

  if (error) throw error;
};

export const hasActiveAuthSession = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Turns the recovery deep link into a real session, which is what authorizes the
// updateUser({ password }) call afterwards. Covers the three shapes Supabase can
// send depending on how the email template is configured.
export const startPasswordRecoverySession = async (url: string): Promise<void> => {
  const params = parseAuthRedirectParams(url);

  if (params.error || params.error_description) {
    throw new Error(params.error_description ?? params.error);
  }

  if (params.access_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token ?? '',
    });
    if (error) throw error;
    return;
  }

  if (params.token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.token_hash,
      type: 'recovery',
    });
    if (error) throw error;
    return;
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return;
  }

  throw new Error('MISSING_RECOVERY_TOKEN');
};

export const updatePassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};
