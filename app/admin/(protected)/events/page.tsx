import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import {
  softDeleteEventAction,
  upsertEventAction,
  uploadMediaAction,
} from "@/lib/actions/content";

export default async function AdminEventsPage() {
  await requireAdmin();
  const [events, clans] = await Promise.all([
    db.event.findMany({
      where: { deletedAt: null },
      include: { icon: true, clan: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    db.clan.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Events"
        description="Add and edit event cards. All times and dates are editable — changes appear on the public Events page."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/dashboard/events" className="hub-btn">
          View public page →
        </a>
      </div>

      <OrnateFrame className="mb-8 p-5">
        <h2 className="mb-4 font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
          Add event
        </h2>
        <form action={upsertEventAction} className="grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Title" className="hub-input" required />
          <input name="subtitle" placeholder="Subtitle" className="hub-input" />
          <select name="category" className="hub-select" defaultValue="featured">
            <option value="featured">Featured</option>
            <option value="weekly">Weekly</option>
            <option value="special">Special</option>
          </select>
          <select name="clanId" className="hub-select" defaultValue="">
            <option value="">Coalition-wide</option>
            {clans.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="startsAt" type="datetime-local" className="hub-input" />
          <input
            name="timezone"
            defaultValue="Asia/Manila"
            className="hub-input"
            placeholder="Timezone"
          />
          <select name="recurrence" className="hub-select" defaultValue="none">
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="as_announced">As announced</option>
          </select>
          <input
            name="recurrenceNote"
            placeholder="Schedule note"
            className="hub-input"
          />
          <input name="badge" placeholder="Badge" className="hub-input" />
          <input name="sortOrder" type="number" defaultValue={0} className="hub-input" />
          <label className="flex items-center gap-2 text-sm text-[#c9a84a]">
            <input type="checkbox" name="isMajor" /> Major event (countdown)
          </label>
          <label className="flex items-center gap-2 text-sm text-[#c9a84a]">
            <input type="checkbox" name="isPublished" defaultChecked /> Published
          </label>
          <button type="submit" className="hub-btn-filled sm:col-span-2">
            Create event
          </button>
        </form>
        <form action={uploadMediaAction} className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#d4af37]/15 pt-4">
          <div className="flex-1">
            <p className="mb-1 font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
              Upload icon (optional — copy media id into event edit)
            </p>
            <input name="file" type="file" accept="image/*" className="hub-input" />
          </div>
          <button type="submit" className="hub-btn">
            Upload
          </button>
        </form>
      </OrnateFrame>

      <div className="space-y-4">
        {events.map((ev) => (
          <OrnateFrame key={ev.id} className="p-5" ornate={false}>
            <form action={upsertEventAction} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="id" value={ev.id} />
              <input name="title" defaultValue={ev.title} className="hub-input" />
              <input
                name="subtitle"
                defaultValue={ev.subtitle ?? ""}
                className="hub-input"
              />
              <select name="category" defaultValue={ev.category} className="hub-select">
                <option value="featured">Featured</option>
                <option value="weekly">Weekly</option>
                <option value="special">Special</option>
              </select>
              <select name="clanId" defaultValue={ev.clanId ?? ""} className="hub-select">
                <option value="">Coalition-wide</option>
                {clans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                name="startsAt"
                type="datetime-local"
                className="hub-input"
                defaultValue={
                  ev.startsAt
                    ? new Date(ev.startsAt.getTime() - ev.startsAt.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
              />
              <input name="timezone" defaultValue={ev.timezone} className="hub-input" />
              <select name="recurrence" defaultValue={ev.recurrence} className="hub-select">
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_announced">As announced</option>
              </select>
              <input
                name="recurrenceNote"
                defaultValue={ev.recurrenceNote ?? ""}
                className="hub-input"
              />
              <input name="badge" defaultValue={ev.badge ?? ""} className="hub-input" />
              <input
                name="iconMediaId"
                defaultValue={ev.iconMediaId ?? ""}
                placeholder="Icon media id"
                className="hub-input"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={ev.sortOrder}
                className="hub-input"
              />
              <label className="flex items-center gap-2 text-sm text-[#c9a84a]">
                <input type="checkbox" name="isMajor" defaultChecked={ev.isMajor} /> Major
              </label>
              <label className="flex items-center gap-2 text-sm text-[#c9a84a]">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={ev.isPublished}
                />{" "}
                Published
              </label>
              <button type="submit" className="hub-btn sm:col-span-2">
                Save card
              </button>
            </form>
            <form action={softDeleteEventAction.bind(null, ev.id)} className="mt-2">
              <button type="submit" className="text-xs text-red-400/80">
                Soft delete
              </button>
            </form>
          </OrnateFrame>
        ))}
      </div>
    </div>
  );
}
