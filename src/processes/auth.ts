import { supabase } from "@/config/supabase";
import { LoginResponse, SignupResponse } from "./types/authTypes";

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
}): Promise<SignupResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: { name: body.name },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Signup failed");

  return {
    token: data.session?.access_token ?? "",
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: body.name,
    },
  };
};
