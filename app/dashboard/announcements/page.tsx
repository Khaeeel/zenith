import Link from "next/link";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";
import { getAnnouncements, relativeTime } from "@/lib/tracker/queries";

export const revalidate = 30;

export default async function DashboardAnnouncementsPage() {
  const announcements = await getAnnouncements(50);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Official notices from coalition command."
        actions={
          <Link href="/admin/announcements" className="hub-btn shrink-0">
            Manage in Admin →
          </Link>
        }
      />

      <div className="space-y-4">
        {announcements.map((a) => (
          <OrnateFrame key={a.id} className="overflow-hidden p-0" ornate={false}>
            {a.image ? (
              <div className="aspect-video w-full overflow-hidden border-b border-[#d4af37]/20 bg-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image.url}
                  alt={a.image.alt ?? a.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <article className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-display text-base tracking-wide text-[#f0d060] sm:text-lg">
                    <span className="mr-2 opacity-80">
                      {a.icon === "bell" ? "🔔" : "⚔️"}
                    </span>
                    {a.title}
                  </p>
                  <p className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase sm:hidden">
                    {relativeTime(a.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[rgba(242,239,230,0.55)]">
                  {a.body}
                </p>
              </div>
              <p className="hidden shrink-0 font-display text-[10px] tracking-widest text-[#8a7028] uppercase sm:block sm:pt-1">
                {relativeTime(a.createdAt)}
              </p>
            </article>
          </OrnateFrame>
        ))}
        {announcements.length === 0 ? (
          <OrnateFrame className="p-8" ornate={false}>
            <p className="text-sm text-[rgba(242,239,230,0.4)]">
              No announcements yet. Publish one from Admin → Announcements.
            </p>
          </OrnateFrame>
        ) : null}
      </div>
    </div>
  );
}
