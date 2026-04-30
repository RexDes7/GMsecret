"use client";

import * as React from "react";
import { CharacterData, type CharacterDataT } from "@/lib/schemas/content";
import {
  ABILITY_KEYS,
  ABILITY_LABEL_RU,
  abilityModifier,
} from "@/lib/services/abilities";
import { ContentService } from "@/lib/services/content.service";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DEFAULT_DATA: CharacterDataT = {
  name: "",
  race: "",
  class: "",
  level: 1,
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  background: "",
  skills: [],
  equipment: [],
  spells: [],
  portraitUrl: "",
};

export function CharacterBuilder() {
  const { user } = useAuth();
  const [data, setData] = React.useState<CharacterDataT>(DEFAULT_DATA);
  const [title, setTitle] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [savedId, setSavedId] = React.useState<string | null>(null);

  function setAbility(k: keyof CharacterDataT["abilityScores"], v: number) {
    setData((d) => ({ ...d, abilityScores: { ...d.abilityScores, [k]: v } }));
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const parsed = CharacterData.safeParse(data);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path.join(".")] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    if (!user) {
      // Without auth backend, just log a draft locally.
      window.localStorage.setItem(
        "gmsh:char-draft",
        JSON.stringify({ title, data, isPublic })
      );
      setSavedId("draft");
      return;
    }
    const record = ContentService.create(
      {
        title: title || data.name || "Безымянный герой",
        description: data.background || "",
        isPublic,
        tags: [data.race, data.class].filter(Boolean) as string[],
        type: "character",
        data: parsed.data,
      },
      user.id,
      user.username
    );
    setSavedId(record.id);
  }

  return (
    <form onSubmit={onSave} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <Section title="Основное">
          <Field
            id="title"
            label="Название записи"
            value={title}
            onChange={setTitle}
            placeholder="Например: «Лютор, паладин Серебряного Пика»"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="name"
              label="Имя персонажа"
              value={data.name}
              onChange={(v) => setData((d) => ({ ...d, name: v }))}
              error={errors["name"]}
            />
            <Field
              id="race"
              label="Раса"
              value={data.race}
              onChange={(v) => setData((d) => ({ ...d, race: v }))}
              error={errors["race"]}
            />
            <Field
              id="class"
              label="Класс"
              value={data.class}
              onChange={(v) => setData((d) => ({ ...d, class: v }))}
              error={errors["class"]}
            />
            <Field
              id="level"
              label="Уровень (1-20)"
              type="number"
              value={String(data.level)}
              onChange={(v) => setData((d) => ({ ...d, level: Number(v) }))}
              error={errors["level"]}
            />
          </div>
        </Section>

        <Section title="Характеристики">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {ABILITY_KEYS.map((k) => {
              const v = data.abilityScores[k];
              const mod = abilityModifier(v);
              return (
                <div key={k} className="space-y-1">
                  <Label htmlFor={`ab-${k}`} className="text-xs uppercase">
                    {ABILITY_LABEL_RU[k]}
                  </Label>
                  <Input
                    id={`ab-${k}`}
                    type="number"
                    min={1}
                    max={30}
                    value={v}
                    onChange={(e) => setAbility(k, Number(e.target.value || 0))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Мод:{" "}
                    <span className="text-primary">
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Дополнительно">
          <Field
            id="background"
            label="Биография"
            value={data.background ?? ""}
            onChange={(v) => setData((d) => ({ ...d, background: v }))}
            multiline
          />
          <ListField
            id="skills"
            label="Навыки"
            values={data.skills}
            onChange={(vs) => setData((d) => ({ ...d, skills: vs }))}
          />
          <ListField
            id="equipment"
            label="Снаряжение"
            values={data.equipment}
            onChange={(vs) => setData((d) => ({ ...d, equipment: vs }))}
          />
          <ListField
            id="spells"
            label="Заклинания"
            values={data.spells}
            onChange={(vs) => setData((d) => ({ ...d, spells: vs }))}
          />
          <Field
            id="portraitUrl"
            label="URL портрета (опционально)"
            value={data.portraitUrl ?? ""}
            onChange={(v) => setData((d) => ({ ...d, portraitUrl: v }))}
            error={errors["portraitUrl"]}
          />
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
            {data.name || "Без имени"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {[data.race, data.class].filter(Boolean).join(" · ") || "—"} ·
            Уровень {data.level}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {ABILITY_KEYS.map((k) => (
              <div
                key={k}
                className="rounded-lg border border-border/60 bg-background/40 p-2 text-center"
              >
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {ABILITY_LABEL_RU[k]}
                </p>
                <p className="text-lg font-semibold">{data.abilityScores[k]}</p>
                <p className="text-xs text-primary">
                  {(() => {
                    const m = abilityModifier(data.abilityScores[k]);
                    return m >= 0 ? `+${m}` : m;
                  })()}
                </p>
              </div>
            ))}
          </div>
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

        <Button type="submit" size="lg" className="w-full glow-primary">
          Сохранить персонажа
        </Button>
        {savedId ? (
          <p className="text-sm text-primary">
            {savedId === "draft"
              ? "Черновик сохранён локально."
              : "Сохранено! ID записи: " + savedId}
          </p>
        ) : null}
      </aside>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/40 p-5">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xl font-semibold">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
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
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={4}
          className="block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

function ListField(props: {
  id: string;
  label: string;
  values: string[];
  onChange: (vs: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <div className="flex gap-2">
        <Input
          id={props.id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) {
                props.onChange([...props.values, draft.trim()]);
                setDraft("");
              }
            }
          }}
          placeholder="Введите и нажмите Enter"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (draft.trim()) {
              props.onChange([...props.values, draft.trim()]);
              setDraft("");
            }
          }}
        >
          Добавить
        </Button>
      </div>
      {props.values.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {props.values.map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {v}
              <button
                type="button"
                aria-label={`Удалить ${v}`}
                onClick={() =>
                  props.onChange(props.values.filter((_, j) => j !== i))
                }
                className="text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
