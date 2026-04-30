import type { Metadata } from "next";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: ru.auth.login.title };

export default function LoginPage() {
  const t = ru.auth.login;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>
      <LoginForm />
      <p className="text-sm text-muted-foreground">
        {t.noAccount}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t.signUp}
        </Link>
      </p>
    </div>
  );
}
