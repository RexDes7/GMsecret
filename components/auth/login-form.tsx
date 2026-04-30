"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { ru } from "@/lib/i18n/ru";
import { useAuth } from "@/components/providers/auth-provider";
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
      await new Promise((r) => setTimeout(r, 250));
      const username = parsed.data.email.split("@")[0] || "player";
      signIn({
        id: username,
        email: parsed.data.email,
        username,
        role: username === "admin" ? "admin" : "user",
      });
      router.replace(`/profile/${username}`);
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
