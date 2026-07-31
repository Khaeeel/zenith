import Link from "next/link";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";
import Countdown from "@/components/events/Countdown";
import { getPublishedEvents } from "@/lib/tracker/queries";

export const dynamic = "force-dynamic";

const FEATURED_ICONS = ["⚔", "🏛", "🛡"];
const WEEKLY_ICONS = ["🐉", "⛰", "⚡", "💎"];
const SPECIAL_ICONS = ["📣", "👑", "✦", "🕊"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
      <h2 className="shrink-0 font-display text-xs tracking-[0.32em] text-[#f0d060] uppercase sm:text-sm">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
    </div>
  );
}

export default async function DashboardEventsPage() {
  const events = await getPublishedEvents();
  const featured = events.filter((e) => e.category === "featured");
  const weekly = events.filter((e) => e.category === "weekly");
  const special = events.filter((e) => e.category === "special");
  const major = events.find((e) => e.isMajor && e.startsAt) ?? null;

  return (
    <div>
      <PageHeader
        title="Events & Operations"
        description="Featured wars, weekly activity windows, and special operations across the coalition."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-12">
          <section>
            <SectionLabel>Featured Upcoming Events</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((ev, i) => (
                <OrnateFrame
                  key={ev.id}
                  className="group relative overflow-hidden p-6 transition duration-300 hover:shadow-[0_0_32px_rgba(212,175,55,0.2)]"
                >
                  <div className="relative">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center border border-[#d4af37]/45 bg-[rgba(212,175,55,0.1)] text-2xl">
                      {FEATURED_ICONS[i % FEATURED_ICONS.length]}
                    </div>
                    <p className="font-display text-xl tracking-wide text-[#f0d060]">
                      {ev.title}
                    </p>
                    {ev.subtitle ? (
                      <p className="mt-2 text-sm text-[rgba(242,239,230,0.5)]">
                        {ev.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-4 text-sm text-[#c9a84a]">
                      {ev.recurrenceNote ||
                        (ev.startsAt
                          ? ev.startsAt.toLocaleString("en-PH", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Schedule TBA")}
                    </p>
                    {ev.badge ? (
                      <span className="mt-4 inline-block border border-[#d4af37]/4 bg-[rgba(212,175,55,0.1)] px-2.5 py-1 font-display text-[9px] tracking-[0.22em] text-[#f0d060] uppercase">
                        {ev.badge}
                      </span>
                    ) : null}
                  </div>
                </OrnateFrame>
              ))}
              {featured.length === 0 ? (
                <p className="text-sm text-[rgba(242,239,230,0.4)]">
                  No featured events yet.
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <SectionLabel>Weekly Activity Schedule</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {weekly.map((ev, i) => (
                <div
                  key={ev.id}
                  className="flex gap-4 border border-[#d4af37]/25 bg-[rgba(10,16,28,0.75)] p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#d4af37]/35 text-xl">
                    {WEEKLY_ICONS[i % WEEKLY_ICONS.length]}
                  </div>
                  <div>
                    <p className="font-display text-base text-[#f0d060]">{ev.title}</p>
                    <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                      {ev.recurrenceNote}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Special Events</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {special.map((ev, i) => (
                <OrnateFrame key={ev.id} className="flex gap-4 p-5" ornate={false}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#d4af37]/4 text-xl">
                    {SPECIAL_ICONS[i % SPECIAL_ICONS.length]}
                  </div>
                  <div>
                    <p className="font-display text-base text-[#f0d060]">{ev.title}</p>
                    {ev.subtitle ? (
                      <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                        {ev.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-[#c9a84a]">{ev.recurrenceNote}</p>
                  </div>
                </OrnateFrame>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <OrnateFrame className="overflow-hidden p-6">
            <div className="relative">
              <p className="font-display text-[10px] tracking-[0.28em] text-[#8a7028] uppercase">
                Next Major Event
              </p>
              {major?.startsAt ? (
                <>
                  <p className="mt-3 font-display text-2xl text-[#f0d060]">
                    {major.title}
                  </p>
                  <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                    {major.recurrenceNote}
                  </p>
                  <Countdown target={major.startsAt.toISOString()} />
                  <Link
                    href="/contact"
                    className="hub-btn-filled mt-5 flex w-full justify-center py-3"
                  >
                    Coordinate via Discord
                  </Link>
                </>
              ) : (
                <p className="mt-4 text-sm text-[rgba(242,239,230,0.45)]">
                  No major event scheduled.
                </p>
              )}
            </div>
          </OrnateFrame>
          <OrnateFrame className="p-5" ornate={false}>
            <p className="font-display text-[10px] tracking-[0.28em] text-[#8a7028] uppercase">
              Stay Informed
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[rgba(242,239,230,0.55)]">
              <li className="flex gap-2">
                <span className="text-[#d4af37]">▸</span>
                All times are PH Time (GMT+8) unless noted.
              </li>
              <li className="flex gap-2">
                <span className="text-[#d4af37]">▸</span>
                Coordinate through Discord for sign-ups.
              </li>
            </ul>
          </OrnateFrame>
        </aside>
      </div>
    </div>
  );
}
