"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { ru } from "@/lib/i18n/ru";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Errors = Partial<Record<keyof RegisterInput | "form", string>>;

export function RegisterForm() {
  const t = ru.auth.register;
  const router = useRouter();
  const { signIn } = useAuth();

  const [values, setValues] = React.useState<RegisterInput>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  // Debounced field-level validation (300ms).
  const debouncer = React.useRef<number | null>(null);
  const scheduleValidate = React.useCallback((next: RegisterInput) => {
    if (debouncer.current) window.clearTimeout(debouncer.current);
    debouncer.current = window.setTimeout(() => {
      const result = registerSchema.safeParse(next);
      if (result.success) {
        setErrors({});
      } else {
        const next: Errors = {};
        for (const issue of result.error.issues) {
          const k = issue.path[0] as keyof RegisterInput;
          if (k && !next[k]) next[k] = issue.message;
        }
        setErrors(next);
      }
    }, 300);
  }, []);

  function setField<K extends keyof RegisterInput>(k: K, v: RegisterInput[K]) {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      scheduleValidate(next);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const map: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof RegisterInput;
        if (k && !map[k]) map[k] = issue.message;
      }
      setErrors(map);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      // Backend not yet implemented (tasks 2/3). Mock a successful sign-up.
      await new Promise((r) => setTimeout(r, 300));
      signIn({
        id: parsed.data.username,
        email: parsed.data.email,
        username: parsed.data.username,
        role: "user",
      });
      router.replace(`/profile/${parsed.data.username}`);
    } catch {
      setErrors({ form: ru.auth.errors.generic });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        id="email"
        label={t.email}
        error={errors.email}
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(v) => setField("email", v)}
      />
      <Field
        id="username"
        label={t.username}
        error={errors.username}
        autoComplete="username"
        value={values.username}
        onChange={(v) => setField("username", v)}
      />
      <Field
        id="password"
        label={t.password}
        error={errors.password}
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={(v) => setField("password", v)}
      />
      <Field
        id="confirmPassword"
        label={t.confirmPassword}
        error={errors.confirmPassword}
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(v) => setField("confirmPassword", v)}
      />

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

function Field(props: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={Boolean(props.error)}
        aria-describedby={props.error ? `${props.id}-error` : undefined}
      />
      {props.error ? (
        <p id={`${props.id}-error`} className="text-xs text-destructive">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}
