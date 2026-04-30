import type { Metadata } from "next";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: ru.auth.register.title };

export default function RegisterPage() {
  const t = ru.auth.register;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        {t.haveAccount}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t.signIn}
        </Link>
      </p>
    </div>
  );
}
