import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await db.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw new Error("Profile row missing: run `npm run db:seed`.");

  return (
    <>
      <PageHeader
        title="Profil & CV"
        description="Ce qui s'affiche dans l'en-tête, le contact et le pied de page du site."
      />
      <ProfileForm profile={profile} />
    </>
  );
}
