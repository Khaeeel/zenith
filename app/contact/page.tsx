import Link from "next/link";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ContactInquiryForm from "@/components/contact/ContactInquiryForm";
import PublicChrome from "@/components/site/PublicChrome";
import { getClansForJoin, getPublishedContacts } from "@/lib/tracker/queries";

export const dynamic = "force-dynamic";

const OFFICE_ICONS = ["👥", "🤝", "⚔", "🎧"];

export default async function ContactPage() {
  const [contacts, clans] = await Promise.all([
    getPublishedContacts(),
    getClansForJoin(),
  ]);
  const offices = contacts.filter((c) => c.kind === "office");
  const channels = contacts.filter((c) => c.kind === "channel");
  const defaultClanId = clans[0]?.id;

  return (
    <PublicChrome active="contact">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <div className="mb-12 text-center">
          <p className="font-display text-[10px] tracking-[0.35em] text-[#c9a84a]/80 uppercase">
            Command desk
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[0.06em] text-[#f2efe6] sm:text-5xl">
            Contact
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-display text-sm italic leading-relaxed text-[#d4af37]/90 sm:text-base">
            Reach the command hub for recruitment, alliance coordination, event
            concerns, and general inquiries.
          </p>
          <div
            className="mx-auto mt-6 h-px max-w-md"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)",
            }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <OrnateFrame className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4af37]/45" />
              <h2 className="font-display text-[11px] tracking-[0.28em] text-[#f0d060] uppercase">
                Send us a message
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4af37]/45" />
            </div>
            <ContactInquiryForm clanId={defaultClanId} />
          </OrnateFrame>

          <div className="grid gap-4 sm:grid-cols-2">
            {offices.map((c, i) => (
              <OrnateFrame
                key={c.id}
                className="flex gap-3 p-4 transition hover:shadow-[0_0_24px_rgba(212,175,55,0.15)]"
              >
                <div className="relative flex h-14 w-12 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 40 48" className="absolute inset-0 h-full w-full">
                    <path
                      d="M20 2 L36 8 V22 C36 34 28 42 20 46 C12 42 4 34 4 22 V8 Z"
                      fill="rgba(212,175,55,0.1)"
                      stroke="#d4af37"
                      strokeWidth="1.4"
                    />
                  </svg>
                  <span className="relative text-lg">
                    {OFFICE_ICONS[i % OFFICE_ICONS.length]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[11px] tracking-[0.14em] text-[#f0d060] uppercase">
                    {c.title}
                  </p>
                  {c.personName ? (
                    <p className="mt-2 text-sm text-[#f2efe6]">{c.personName}</p>
                  ) : null}
                  {c.discordHandle ? (
                    <p className="text-sm text-[#7ec8ff]">@{c.discordHandle}</p>
                  ) : null}
                  {c.email ? (
                    <p className="truncate text-xs text-[rgba(242,239,230,0.45)]">
                      {c.email}
                    </p>
                  ) : null}
                  {c.description ? (
                    <p className="mt-2 text-xs leading-relaxed text-[rgba(242,239,230,0.5)]">
                      {c.description}
                    </p>
                  ) : null}
                </div>
              </OrnateFrame>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
            <h2 className="font-display text-xs tracking-[0.28em] text-[#f0d060] uppercase">
              Official Channels
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {channels.map((c) => {
              const inner = (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-[#d4af37]/4 bg-[rgba(212,175,55,0.08)] text-[#f0d060]">
                      ›
                    </span>
                    <div>
                      <p className="font-display text-sm text-[#f0d060]">{c.title}</p>
                      {c.description ? (
                        <p className="mt-0.5 text-sm text-[rgba(242,239,230,0.5)]">
                          {c.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-display text-[#c9a84a]">→</span>
                </>
              );
              return (
                <div
                  key={c.id}
                  className="border border-[#d4af37]/3 bg-[rgba(10,16,28,0.8)] px-4 py-4 transition hover:border-[#d4af37]/55 hover:bg-[rgba(16,24,40,0.9)]"
                >
                  {c.href ? (
                    <Link href={c.href} className="flex items-center justify-between gap-3">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-3">{inner}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicChrome>
  );
}
