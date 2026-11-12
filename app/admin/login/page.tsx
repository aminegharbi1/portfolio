import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm text-accent">~/admin</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-fg">Connexion</h1>
        <p className="mt-2 text-sm text-muted">Espace réservé à la gestion du portfolio.</p>
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <LoginForm />
        </div>
        <Link href="/" className="mt-6 inline-block font-mono text-sm text-subtle hover:text-fg">
          ← Retour au site
        </Link>
      </div>
    </main>
  );
}
