import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type UsuarioType = {
  id: string;
  email: string;
  nombre: string;
  avatar_url: string;
  updated_at: string;
};

export async function upsertUserFromAuth(
  user: User | null
): Promise<UsuarioType | null> {
  if (!user) return null;

  const supabase = createClient();
  const { id, email, user_metadata } = user;

  const { data, error } = await supabase
    .from("usuarios")
    .upsert([
      {
        id,
        email,
        nombre: user_metadata.full_name || user_metadata.name || "",
        avatar_url: user_metadata.avatar_url || "",
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error al registrar usuario:", error);
    return null;
  }

  return data as UsuarioType;
}
