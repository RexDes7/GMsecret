import type { Metadata } from "next";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export const metadata: Metadata = { title: "Редактировать профиль" };

export default function EditProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Редактировать профиль
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Изменения сразу отражаются на твоей странице профиля и в шапке.
        </p>
      </header>
      <ProfileEditForm />
    </div>
  );
}
