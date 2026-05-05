"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ItemData, type ItemDataT } from "@/lib/schemas/content";
import { ContentClient } from "@/lib/services/content-client";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RARITY_LABEL: Record<ItemDataT["rarity"], string> = {
  common: "Обычный",
  uncommon: "Необычный",
  rare: "Редкий",
  very_rare: "Очень редкий",
  legendary: "Легендарный",
  artifact: "Артефактный",
};

const DEFAULT: ItemDataT = {
  name: "",
  type: "weapon",
  rarity: "common",
  description: "",
  properties: [],
  weight: 1,
  cost: 0,
  magicalEffects: "",
  imageUrl: "",
};

export function ItemBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<ItemDataT>(DEFAULT);
  const [title, setTitle] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  function set<K extends keyof ItemDataT>(k: K, v: ItemDataT[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ItemData.safeParse(data);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path.join(".")] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setServerError(null);
    if (!user) {
      window.localStorage.setItem(
        "gmsh:item-draft",
        JSON.stringify({ title, data, isPublic })
      );
      setSavedId("draft");
      router.push("/login?redirect=/tools/items");
      return;
    }
    setSubmitting(true);
    try {
      const r = await ContentClient.create(
        {
          title: title || data.name || "Без названия",
          description: data.description,
          isPublic,
          tags: [data.type, data.rarity],
          type: "item",
          data: parsed.data,
        },
        user
      );
      setSavedId(r.id);
      window.localStorage.removeItem("gmsh:item-draft");
    } catch (err) {
      setServerError((err as Error).message || "unknown");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="title"
            label="Название записи"
            value={title}
            onChange={setTitle}
          />
          <Field
            id="name"
            label="Имя предмета"
            value={data.name}
            error={errors["name"]}
            onChange={(v) => set("name", v)}
          />
          <Field
            id="type"
            label="Тип"
            value={data.type}
            error={errors["type"]}
            onChange={(v) => set("type", v)}
            placeholder="оружие, доспех, зелье…"
          />
          <div className="space-y-1.5">
            <Label htmlFor="rarity">Редкость</Label>
            <select
              id="rarity"
              value={data.rarity}
              onChange={(e) =>
                set("rarity", e.target.value as ItemDataT["rarity"])
              }
              className="block h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {(Object.keys(RARITY_LABEL) as Array<ItemDataT["rarity"]>).map(
                (r) => (
                  <option key={r} value={r} className="bg-background">
                    {RARITY_LABEL[r]}
                  </option>
                )
              )}
            </select>
          </div>
          <Field
            id="weight"
            label="Вес (фунты)"
            type="number"
            value={String(data.weight)}
            onChange={(v) => set("weight", Number(v || 0))}
            error={errors["weight"]}
          />
          <Field
            id="cost"
            label="Стоимость (зм)"
            type="number"
            value={String(data.cost)}
            onChange={(v) => set("cost", Number(v || 0))}
            error={errors["cost"]}
          />
        </div>

        <Field
          id="description"
          label="Описание"
          value={data.description}
          onChange={(v) => set("description", v)}
          multiline
        />
        <Field
          id="magicalEffects"
          label="Магические эффекты"
          value={data.magicalEffects ?? ""}
          onChange={(v) => set("magicalEffects", v)}
          multiline
        />
        <Field
          id="imageUrl"
          label="URL изображения (опционально)"
          value={data.imageUrl ?? ""}
          onChange={(v) => set("imageUrl", v)}
          error={errors["imageUrl"]}
        />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {data.type || "—"} · {RARITY_LABEL[data.rarity]}
          </p>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
            {data.name || "Без названия"}
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Вес</dt>
            <dd>{data.weight}</dd>
            <dt className="text-muted-foreground">Стоимость</dt>
            <dd>{data.cost} зм</dd>
          </dl>
          {data.description ? (
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
              {data.description}
            </p>
          ) : null}
          {data.magicalEffects ? (
            <p className="mt-3 whitespace-pre-line text-sm text-primary/90">
              {data.magicalEffects}
            </p>
          ) : null}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="size-4 rounded border-border bg-input accent-primary"
          />
          Опубликовать в сообщество
        </label>
        <Button
          type="submit"
          size="lg"
          className="w-full glow-primary"
          disabled={submitting}
        >
          {submitting ? "Сохраняем…" : "Сохранить предмет"}
        </Button>
        {savedId ? (
          <p className="text-sm text-primary">
            {savedId === "draft"
              ? "Черновик сохранён. Войди, чтобы опубликовать."
              : "Сохранено! Запись в профиле."}
          </p>
        ) : null}
        {serverError ? (
          <p className="text-sm text-destructive">Ошибка: {serverError}</p>
        ) : null}
      </aside>
    </form>
  );
}

function Field(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      {props.multiline ? (
        <textarea
          id={props.id}
          value={props.value}
          rows={4}
          onChange={(e) => props.onChange(e.target.value)}
          className="block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <Input
          id={props.id}
          type={props.type}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          aria-invalid={Boolean(props.error)}
        />
      )}
      {props.error ? (
        <p className="text-xs text-destructive">{props.error}</p>
      ) : null}
    </div>
  );
}
