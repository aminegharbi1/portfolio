"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.AUTH_SECRET) {
    return {
      error:
        process.env.NODE_ENV === "production"
          ? "Connexion indisponible."
          : "AUTH_SECRET, ADMIN_EMAIL ou ADMIN_PASSWORD_HASH manque dans .env (voir le README).",
    };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (err) {
    // On success signIn throws a redirect: let it through.
    if (!(err instanceof AuthError)) throw err;
    if (err instanceof CredentialsSignin && err.code === "rate_limited") {
      return { error: "Trop de tentatives. Réessaie dans 15 minutes." };
    }
    return { error: "Email ou mot de passe incorrect." };
  }
}
