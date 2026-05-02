"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { UserClient } from "@/lib/services/user-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ProfileEditForm() {
  const { user, status, signIn } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !user) {
      router.replace("/login?redirect=/profile/me/edit");
      return;
    }
    let cancelled = false;
    UserClient.me(user)
      .then((p) => {
        if (cancelled) return;
        setDisplayName(p.displayName ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatarUrl ?? "");
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить профиль.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await UserClient.patchMe(user, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      // Reflect the new values in the session so the header avatar/name
      // update without a round-trip.
      signIn({
        ...user,
        displayName: updated.displayName,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Не удалось сохранить.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Загружаем профиль…</p>
    );
  }
  if (!user) return null;

  const avatarPreview = avatarUrl.trim();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt=""
              width={72}
              height={72}
              className="size-[72px] rounded-full object-cover ring-1 ring-primary/40"
              unoptimized
            />
          ) : (
            <div className="grid size-[72px] place-items-center rounded-full bg-primary/15 text-2xl font-bold text-primary ring-1 ring-primary/40">
              {user.username[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="avatarUrl">URL аватара</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Пока поддерживаем ссылку. Загрузка файла появится позже.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Отображаемое имя</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={user.username}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            Это имя видят другие пользователи. Логин (@{user.username}) не
            меняется.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">О себе</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Расскажи в паре предложений о своих играх и любимых персонажах."
            className="block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-primary">
          Изменения сохранены.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/profile/${user.username}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← На страницу профиля
        </Link>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
