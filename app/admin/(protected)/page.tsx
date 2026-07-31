import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const [clans, members, events, applications, contacts] = await Promise.all([
    db.clan.count({ where: { deletedAt: null } }),
    db.member.count({ where: { deletedAt: null } }),
    db.event.count({ where: { deletedAt: null, isPublished: true } }),
    db.joinApplication.count({ where: { status: "pending" } }),
    db.contact.count({ where: { deletedAt: null } }),
  ]);

  const cards = [
    {
      label: "Clans",
      value: clans,
      href: "/admin/clans",
      hint: "Manage roster homes",
    },
    {
      label: "Members",
      value: members,
      href: "/admin/members",
      hint: "Hierarchy & power",
    },
    {
      label: "Events",
      value: events,
      href: "/admin/events",
      hint: "Published operations",
    },
    {
      label: "Contacts",
      value: contacts,
      href: "/admin/contacts",
      hint: "Offices & channels",
    },
    {
      label: "Pending Apps",
      value: applications,
      href: "/admin/applications",
      hint: "Join + inquiries",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Command Overview"
        description={`Welcome back, ${session.user.displayName}. Manage the coalition tracker from this hub.`}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, i) => (
          <Link key={card.href} href={card.href} className="block">
            <OrnateFrame className="h-full px-4 py-5 transition duration-300 hover:shadow-[0_0_28px_rgba(212,175,55,0.22)]">
              <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
                {i + 1}. {card.label}
              </p>
              <p className="mt-3 font-display text-3xl text-[#f0d060]">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-[rgba(242,239,230,0.4)]">
                {card.hint}
              </p>
            </OrnateFrame>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OrnateFrame className="p-6">
          <p className="font-display text-[10px] tracking-[0.25em] text-[#8a7028] uppercase">
            Quick actions
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/events" className="hub-btn-filled px-4 py-2.5">
              Edit events
            </Link>
            <Link href="/admin/members" className="hub-btn px-4 py-2.5">
              Edit members
            </Link>
            <Link href="/admin/contacts" className="hub-btn px-4 py-2.5">
              Edit contacts
            </Link>
            <Link href="/admin/applications" className="hub-btn px-4 py-2.5">
              Review apps
            </Link>
          </div>
        </OrnateFrame>
        <OrnateFrame className="p-6" ornate={false}>
          <p className="font-display text-[10px] tracking-[0.25em] text-[#8a7028] uppercase">
            Public surfaces
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[rgba(242,239,230,0.6)]">
            <li>
              <Link href="/dashboard" className="text-[#f0d060] hover:underline">
                Tracker dashboard
              </Link>{" "}
              — live clan stats
            </li>
            <li>
              <Link href="/dashboard/events" className="text-[#f0d060] hover:underline">
                Events page
              </Link>{" "}
              — operations calendar
            </li>
            <li>
              <Link href="/contact" className="text-[#f0d060] hover:underline">
                Contact page
              </Link>{" "}
              — offices & inquiry form
            </li>
          </ul>
        </OrnateFrame>
      </div>
    </div>
  );
}
