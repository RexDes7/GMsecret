"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { ru } from "@/lib/i18n/ru";
import { useAuth } from "@/components/providers/auth-provider";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Errors = Partial<Record<keyof LoginInput | "form", string>>;

export function LoginForm() {
  const t = ru.auth.login;
  const router = useRouter();
  const { signIn } = useAuth();
  const [values, setValues] = React.useState<LoginInput>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const map: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof LoginInput;
        if (k && !map[k]) map[k] = issue.message;
      }
      setErrors(map);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      // Real password check — server compares the bcrypt hash and only
      // returns the canonical profile on a match. On a 401 we surface the
      // generic invalid-credentials message; on 403 (banned) we tell the
      // user explicitly so they don't think it's a typo.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      if (res.status === 403) {
        setErrors({ form: "Аккаунт заблокирован" });
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setErrors({ form: ru.auth.errors.invalidCredentials });
        setSubmitting(false);
        return;
      }
      const profile = (await res.json()) as {
        id: string;
        username: string;
        email: string;
        role: "user" | "admin";
        displayName: string;
        bio: string;
        avatarUrl: string;
      };
      signIn({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        role: profile.role,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      });
      const raw = new URLSearchParams(window.location.search).get("redirect");
      router.replace(safeRedirect(raw, `/profile/${profile.username}`));
    } catch {
      setErrors({ form: ru.auth.errors.invalidCredentials });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={Boolean(values.remember)}
          onChange={(e) =>
            setValues((v) => ({ ...v, remember: e.target.checked }))
          }
          className="size-4 rounded border-border bg-input accent-primary"
        />
        {t.remember}
      </label>

      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full glow-primary"
      >
        {submitting ? ru.common.loading : t.submit}
      </Button>
    </form>
  );
}
