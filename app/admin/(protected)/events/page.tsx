import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import {
  setEventVisibilityAction,
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
        description="Each field maps to what players see on the Events page. Hide to unpublish without deleting."
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
        <ConfirmForm
          action={upsertEventAction}
          className="grid gap-4 sm:grid-cols-2"
          title="Create event"
          message="Create this event card on the public Events page?"
          confirmLabel="Create"
          successMessage="Event created successfully."
        >
          <AdminField
            label="Event title"
            hint="Main headline on the event card."
            required
          >
            <input name="title" placeholder="e.g. Valley War" className="hub-input" required />
          </AdminField>
          <AdminField
            label="Subtitle"
            hint="Short line under the title."
          >
            <input
              name="subtitle"
              placeholder="e.g. Coalition valley defense"
              className="hub-input"
            />
          </AdminField>
          <AdminField
            label="Category section"
            hint="Which Events page section this card appears in."
          >
            <select name="category" className="hub-select" defaultValue="featured">
              <option value="featured">Featured</option>
              <option value="weekly">Weekly</option>
              <option value="special">Special</option>
            </select>
          </AdminField>
          <AdminField
            label="Clan scope"
            hint="Coalition-wide, or limited to one clan."
          >
            <select name="clanId" className="hub-select" defaultValue="">
              <option value="">Coalition-wide</option>
              {clans.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField
            label="Starts at"
            hint="Date & time used for schedule and countdown."
          >
            <input name="startsAt" type="datetime-local" className="hub-input" />
          </AdminField>
          <AdminField
            label="Timezone"
            hint="Displayed timezone for this event (e.g. Asia/Manila)."
          >
            <input
              name="timezone"
              defaultValue="Asia/Manila"
              className="hub-input"
              placeholder="Asia/Manila"
            />
          </AdminField>
          <AdminField
            label="Recurrence"
            hint="How often this event repeats."
          >
            <select name="recurrence" className="hub-select" defaultValue="none">
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_announced">As announced</option>
            </select>
          </AdminField>
          <AdminField
            label="Schedule note"
            hint="Fallback schedule text when Starts at is empty (e.g. Daily · 12:00 / 18:00 PH)."
          >
            <input
              name="recurrenceNote"
              placeholder="Friday · 10:00 PM PH Time"
              className="hub-input"
            />
          </AdminField>
          <AdminField
            label="Badge / status label"
            hint="Small status chip on the card (e.g. Upcoming, Live)."
          >
            <input name="badge" placeholder="Upcoming" className="hub-input" />
          </AdminField>
          <AdminField
            label="Sort order"
            hint="Lower numbers appear first within the same category."
          >
            <input name="sortOrder" type="number" defaultValue={0} className="hub-input" />
          </AdminField>
          <AdminField
            label="Major event"
            hint="If checked, this event can drive the big countdown."
          >
            <span className="flex items-center gap-2 text-sm text-[#c9a84a]">
              <input type="checkbox" name="isMajor" className="accent-[#d4af37]" />
              Enable major countdown
            </span>
          </AdminField>
          <AdminField
            label="Published"
            hint="Unchecked = hidden from the public Events page (same as Hide)."
          >
            <span className="flex items-center gap-2 text-sm text-[#c9a84a]">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked
                className="accent-[#d4af37]"
              />
              Show on public Events page
            </span>
          </AdminField>
          <button type="submit" className="hub-btn-filled sm:col-span-2">
            Create event
          </button>
        </ConfirmForm>
        <ConfirmForm
          action={uploadMediaAction}
          className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#d4af37]/15 pt-4"
          title="Upload media"
          message="Upload this image as media?"
          confirmLabel="Upload"
          successMessage="Media uploaded. Copy the media id into an event if needed."
        >
          <div className="flex-1">
            <p className="mb-1 font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
              Upload icon image
            </p>
            <p className="mb-2 text-[11px] text-[rgba(242,239,230,0.4)]">
              Optional. After upload, paste the media id into Icon media id below.
            </p>
            <input name="file" type="file" accept="image/*" className="hub-input" />
          </div>
          <button type="submit" className="hub-btn">
            Upload
          </button>
        </ConfirmForm>
      </OrnateFrame>

      <div className="space-y-4">
        {events.map((ev) => (
          <OrnateFrame key={ev.id} className="p-5" ornate={false}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-lg text-[#f0d060]">{ev.title}</p>
              <span
                className={`inline-block border px-2 py-0.5 font-display text-[9px] tracking-[0.2em] uppercase ${
                  ev.isPublished
                    ? "border-[#d4af37]/40 bg-[rgba(212,175,55,0.1)] text-[#f0d060]"
                    : "border-white/15 bg-white/5 text-[rgba(242,239,230,0.45)]"
                }`}
              >
                {ev.isPublished ? "Visible" : "Hidden"}
              </span>
            </div>
            <ConfirmForm
              action={upsertEventAction}
              className="grid gap-4 sm:grid-cols-2"
              title="Save event"
              message={`Save changes to “${ev.title}”? These update the public Events page.`}
              confirmLabel="Save"
              successMessage="Event updated successfully."
            >
              <input type="hidden" name="id" value={ev.id} />
              <AdminField
                label="Event title"
                hint="Main headline on the event card."
                required
              >
                <input name="title" defaultValue={ev.title} className="hub-input" required />
              </AdminField>
              <AdminField
                label="Subtitle"
                hint="Short line under the title."
              >
                <input
                  name="subtitle"
                  defaultValue={ev.subtitle ?? ""}
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Category section"
                hint="Which Events page section this card appears in."
              >
                <select
                  name="category"
                  defaultValue={ev.category}
                  className="hub-select"
                >
                  <option value="featured">Featured</option>
                  <option value="weekly">Weekly</option>
                  <option value="special">Special</option>
                </select>
              </AdminField>
              <AdminField
                label="Clan scope"
                hint="Coalition-wide, or limited to one clan."
              >
                <select
                  name="clanId"
                  defaultValue={ev.clanId ?? ""}
                  className="hub-select"
                >
                  <option value="">Coalition-wide</option>
                  {clans.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField
                label="Starts at"
                hint="Date & time used for schedule and countdown."
              >
                <input
                  name="startsAt"
                  type="datetime-local"
                  className="hub-input"
                  defaultValue={
                    ev.startsAt
                      ? new Date(
                          ev.startsAt.getTime() -
                            ev.startsAt.getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                />
              </AdminField>
              <AdminField
                label="Timezone"
                hint="Displayed timezone for this event."
              >
                <input
                  name="timezone"
                  defaultValue={ev.timezone}
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Recurrence"
                hint="How often this event repeats."
              >
                <select
                  name="recurrence"
                  defaultValue={ev.recurrence}
                  className="hub-select"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_announced">As announced</option>
                </select>
              </AdminField>
              <AdminField
                label="Schedule note"
                hint="Fallback schedule text when Starts at is empty."
              >
                <input
                  name="recurrenceNote"
                  defaultValue={ev.recurrenceNote ?? ""}
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Badge / status label"
                hint="Small status chip (e.g. Upcoming)."
              >
                <input
                  name="badge"
                  defaultValue={ev.badge ?? ""}
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Icon media id"
                hint="Optional uploaded media id for the card icon."
              >
                <input
                  name="iconMediaId"
                  defaultValue={ev.iconMediaId ?? ""}
                  placeholder="Paste media id"
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Sort order"
                hint="Lower numbers appear first in the same category."
              >
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={ev.sortOrder}
                  className="hub-input"
                />
              </AdminField>
              <AdminField
                label="Major event"
                hint="If checked, can drive the big countdown."
              >
                <span className="flex items-center gap-2 text-sm text-[#c9a84a]">
                  <input
                    type="checkbox"
                    name="isMajor"
                    defaultChecked={ev.isMajor}
                    className="accent-[#d4af37]"
                  />
                  Enable major countdown
                </span>
              </AdminField>
              <AdminField
                label="Published"
                hint="Unchecked hides this card from the public Events page."
                className="sm:col-span-2"
              >
                <span className="flex items-center gap-2 text-sm text-[#c9a84a]">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={ev.isPublished}
                    className="accent-[#d4af37]"
                  />
                  Show on public Events page
                </span>
              </AdminField>
              <button type="submit" className="hub-btn sm:col-span-2">
                Save card
              </button>
            </ConfirmForm>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {ev.isPublished ? (
                <ConfirmForm
                  action={setEventVisibilityAction.bind(null, ev.id, false)}
                  title="Hide event"
                  message={`Hide “${ev.title}” from the public Events page? You can show it again later.`}
                  confirmLabel="Hide"
                  successMessage="Event hidden from the public page."
                >
                  <button
                    type="submit"
                    className="text-xs text-[#c9a84a]/80 hover:text-[#f0d060]"
                  >
                    Hide
                  </button>
                </ConfirmForm>
              ) : (
                <ConfirmForm
                  action={setEventVisibilityAction.bind(null, ev.id, true)}
                  title="Show event"
                  message={`Show “${ev.title}” on the public Events page again?`}
                  confirmLabel="Show"
                  successMessage="Event is visible again."
                >
                  <button
                    type="submit"
                    className="text-xs text-[#f0d060] hover:text-[#f2efe6]"
                  >
                    Show
                  </button>
                </ConfirmForm>
              )}
              <ConfirmForm
                action={softDeleteEventAction.bind(null, ev.id)}
                title="Delete event"
                message={`Soft delete “${ev.title}”? Prefer Hide if you may need it later.`}
                confirmLabel="Delete"
                tone="danger"
                successMessage="Event deleted."
              >
                <button type="submit" className="text-xs text-red-400/80">
                  Soft delete
                </button>
              </ConfirmForm>
            </div>
          </OrnateFrame>
        ))}
      </div>
    </div>
  );
}
