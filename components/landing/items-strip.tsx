import {
  Sword,
  ShieldHalf,
  FlaskConical,
  Gem,
  Skull,
  Crown,
  Wand2,
  ScrollText,
  Hammer,
  KeyRound,
  Coins,
  Flame,
} from "lucide-react";

const ITEMS: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}> = [
  { icon: Sword, label: "Меч", href: "/community?type=item" },
  { icon: ShieldHalf, label: "Щит", href: "/community?type=item" },
  { icon: FlaskConical, label: "Зелье", href: "/community?type=item" },
  { icon: Gem, label: "Самоцвет", href: "/community?type=artifact" },
  { icon: Skull, label: "Реликвия", href: "/community?type=artifact" },
  { icon: Crown, label: "Регалии", href: "/community?type=artifact" },
  { icon: Wand2, label: "Жезл", href: "/community?type=spell" },
  { icon: ScrollText, label: "Свиток", href: "/community?type=spell" },
  { icon: Hammer, label: "Оружие", href: "/community?type=item" },
  { icon: KeyRound, label: "Ключ", href: "/community?type=item" },
  { icon: Coins, label: "Сокровище", href: "/community?type=item" },
  { icon: Flame, label: "Магия", href: "/community?type=spell" },
];

/**
 * Decorative strip of small item icons under the heroes carousel. Each
 * icon links to the matching community filter — they double as a
 * shortcut into the public catalogue.
 */
export function ItemsStrip() {
  return (
    <section
      aria-label="Иконки предметов"
      className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6"
    >
      <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {ITEMS.map(({ icon: Icon, label, href }) => (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              className="grid size-12 place-items-center rounded-md bg-[linear-gradient(180deg,rgba(120,18,32,0.55)_0%,rgba(60,8,16,0.85)_100%)] text-foreground/90 ring-1 ring-inset ring-white/5 transition-transform hover:-translate-y-0.5 hover:ring-primary/60 sm:size-14"
            >
              <Icon className="size-6 sm:size-7" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
