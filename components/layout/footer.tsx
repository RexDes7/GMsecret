import Link from "next/link";
import { Send, MessageCircle, Globe, Headphones } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants/site";
import { GmLogo } from "@/components/brand/logo";

const SOCIALS = [
  { icon: Send, label: "Telegram", href: "https://t.me/" },
  { icon: MessageCircle, label: "Discord", href: "https://discord.com/" },
  { icon: Headphones, label: "Подкаст", href: "#" },
  { icon: Globe, label: "Сайт", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[linear-gradient(180deg,rgba(180,28,48,0.95)_0%,rgba(120,16,30,1)_100%)] text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <GmLogo />
            <p className="max-w-xs text-sm leading-relaxed text-foreground/85">
              Отправь героя в приключение, которого он ждал.
              <br />
              Всё о D&D в одном месте: от официальных книг до инструментов и
              хоумбрю. Создай своего героя, опубликуй его в базе и позволь
              другим игрокам сделать его частью своих легенд.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/70">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.items.map((it) => (
                  <li key={`${col.title}-${it.label}`}>
                    <Link
                      className="text-sm text-foreground/90 transition-colors hover:text-foreground"
                      href={it.href}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-6 border-t border-white/15 pt-8 text-center">
          <ul className="flex items-center gap-4">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-foreground transition-colors hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
          <div className="space-y-1 text-xs text-foreground/80">
            <p>{new Date().getFullYear()} • The GM secret house</p>
            <p>info@gm.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
