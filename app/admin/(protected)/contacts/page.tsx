import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import AdminCollapsible from "@/components/admin/AdminCollapsible";
import {
  softDeleteContactAction,
  upsertContactAction,
} from "@/lib/actions/content";
import { updateApplicationStatusAction } from "@/lib/actions/join";

export default async function AdminContactsPage() {
  await requireAdmin();
  const [contacts, applicants] = await Promise.all([
    db.contact.findMany({
      where: { deletedAt: null },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    }),
    db.joinApplication.findMany({
      include: { clan: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const pendingCount = applicants.filter((a) => a.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Review join applicants first, then manage office cards and official channels below."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/contact" className="hub-btn">
          View public Contact page →
        </a>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-sm tracking-[0.22em] text-[#f0d060] uppercase">
              Applicants
            </h2>
            <p className="mt-1 text-sm text-[rgba(242,239,230,0.45)]">
              All join applications from the homepage form
              {pendingCount > 0 ? ` · ${pendingCount} pending` : ""}.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {applicants.length === 0 ? (
            <OrnateFrame className="p-6 text-sm text-[rgba(242,239,230,0.45)]">
              No applicants yet.
            </OrnateFrame>
          ) : null}
          {applicants.map((a) => (
            <OrnateFrame key={a.id} className="p-5" ornate={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-[#f0d060]">{a.ign}</p>
                  <p className="text-sm text-[rgba(242,239,230,0.55)]">
                    {a.clan.name} · {a.discord} · {a.classId} ·{" "}
                    {a.powerScore.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-[rgba(242,239,230,0.7)]">{a.reason}</p>
                  <p className="mt-1 font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                    {a.status} · {a.createdAt.toLocaleString("en-PH")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form
                    action={updateApplicationStatusAction.bind(null, a.id, "accepted")}
                  >
                    <button type="submit" className="hub-btn-filled">
                      Accept
                    </button>
                  </form>
                  <form
                    action={updateApplicationStatusAction.bind(null, a.id, "rejected")}
                  >
                    <button type="submit" className="hub-btn">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </OrnateFrame>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="mb-2">
          <h2 className="font-display text-sm tracking-[0.22em] text-[#f0d060] uppercase">
            Contact cards
          </h2>
          <p className="mt-1 text-sm text-[rgba(242,239,230,0.45)]">
            Expand a section to add or edit office and channel cards.
          </p>
        </div>

        <AdminCollapsible
          title="Add contact"
          subtitle="Create a new office or channel card"
          defaultOpen={false}
        >
          <form action={upsertContactAction} className="grid gap-3 sm:grid-cols-2">
            <select name="kind" className="hub-select" defaultValue="office">
              <option value="office">Office</option>
              <option value="channel">Channel</option>
            </select>
            <input name="title" placeholder="Title" className="hub-input" required />
            <input name="personName" placeholder="Person name" className="hub-input" />
            <input name="discordHandle" placeholder="Discord" className="hub-input" />
            <input name="email" type="email" placeholder="Email" className="hub-input" />
            <input name="href" placeholder="Link / href" className="hub-input" />
            <textarea
              name="description"
              placeholder="Description"
              className="hub-input sm:col-span-2"
              rows={2}
            />
            <input name="sortOrder" type="number" defaultValue={0} className="hub-input" />
            <button type="submit" className="hub-btn-filled sm:col-span-2">
              Create
            </button>
          </form>
        </AdminCollapsible>

        {contacts.map((c) => (
          <AdminCollapsible
            key={c.id}
            title={c.title}
            subtitle={`${c.kind}${c.personName ? ` · ${c.personName}` : ""}${
              c.isPublished ? "" : " · draft"
            }`}
            defaultOpen={false}
          >
            <form action={upsertContactAction} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="id" value={c.id} />
              <select name="kind" defaultValue={c.kind} className="hub-select">
                <option value="office">Office</option>
                <option value="channel">Channel</option>
              </select>
              <input name="title" defaultValue={c.title} className="hub-input" />
              <input
                name="personName"
                defaultValue={c.personName ?? ""}
                className="hub-input"
              />
              <input
                name="discordHandle"
                defaultValue={c.discordHandle ?? ""}
                className="hub-input"
              />
              <input name="email" defaultValue={c.email ?? ""} className="hub-input" />
              <input name="href" defaultValue={c.href ?? ""} className="hub-input" />
              <textarea
                name="description"
                defaultValue={c.description ?? ""}
                className="hub-input sm:col-span-2"
                rows={2}
              />
              <input
                name="iconMediaId"
                defaultValue={c.iconMediaId ?? ""}
                placeholder="Icon media id"
                className="hub-input"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={c.sortOrder}
                className="hub-input"
              />
              <label className="flex items-center gap-2 text-sm text-[#c9a84a] sm:col-span-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={c.isPublished}
                />{" "}
                Published
              </label>
              <button type="submit" className="hub-btn sm:col-span-2">
                Save card
              </button>
            </form>
            <form action={softDeleteContactAction.bind(null, c.id)} className="mt-2">
              <button type="submit" className="text-xs text-red-400/80">
                Soft delete
              </button>
            </form>
          </AdminCollapsible>
        ))}
      </section>
    </div>
  );
}
