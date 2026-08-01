import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import {
  setAnnouncementVisibilityAction,
  softDeleteAnnouncementAction,
  upsertAnnouncementAction,
} from "@/lib/actions/content";
import { ANNOUNCEMENT_IMAGE_PREFERRED } from "@/lib/announcement-image";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const items = await db.announcement.findMany({
    where: { deletedAt: null },
    include: { image: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Dashboard announcement feed with optional banner photos. Hide to remove from the public feed without deleting."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/dashboard/announcements" className="hub-btn">
          View dashboard page →
        </a>
      </div>

      <OrnateFrame className="mb-8 p-5">
        <ConfirmForm
          action={upsertAnnouncementAction}
          className="grid gap-3"
          title="Publish announcement"
          message="Publish this announcement to the dashboard feed?"
          confirmLabel="Publish"
          successMessage="Announcement published successfully."
        >
          <AdminField label="Title" required>
            <input name="title" placeholder="Title" className="hub-input" required />
          </AdminField>
          <AdminField label="Body" required>
            <textarea
              name="body"
              placeholder="Body"
              className="hub-input"
              rows={3}
              required
            />
          </AdminField>
          <AdminField label="Icon">
            <select name="icon" className="hub-select" defaultValue="bell">
              <option value="bell">Bell</option>
              <option value="war">War</option>
            </select>
          </AdminField>

          <div className="border border-[#d4af37]/20 bg-[rgba(8,12,22,0.45)] p-3">
            <p className="font-display text-[10px] tracking-[0.2em] text-[#8a7028] uppercase">
              Banner photo (optional)
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[rgba(242,239,230,0.55)]">
              Preferred size:{" "}
              <span className="text-[#f0d060]">
                {ANNOUNCEMENT_IMAGE_PREFERRED.label}
              </span>{" "}
              — recommended for a uniform feed, but not required. Other sizes
              will be cropped to 16:9 on the dashboard.
            </p>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hub-input mt-3 w-full text-xs file:mr-2 file:border-0 file:bg-transparent file:font-display file:text-[10px] file:tracking-widest file:text-[#f0d060] file:uppercase"
            />
          </div>

          <button type="submit" className="hub-btn-filled">
            Publish
          </button>
        </ConfirmForm>
      </OrnateFrame>

      <div className="space-y-3">
        {items.map((a) => (
          <OrnateFrame key={a.id} className="p-4" ornate={false}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-block border px-2 py-0.5 font-display text-[9px] tracking-[0.2em] uppercase ${
                  a.isPublished
                    ? "border-[#d4af37]/40 bg-[rgba(212,175,55,0.1)] text-[#f0d060]"
                    : "border-white/15 bg-white/5 text-[rgba(242,239,230,0.45)]"
                }`}
              >
                {a.isPublished ? "Visible" : "Hidden"}
              </span>
            </div>
            {a.image ? (
              <div className="mb-3 aspect-video w-full max-w-md overflow-hidden border border-[#d4af37]/25 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image.url}
                  alt={a.image.alt ?? a.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <ConfirmForm
              action={upsertAnnouncementAction}
              className="grid gap-2"
              title="Save announcement"
              message={`Save changes to “${a.title}”?`}
              confirmLabel="Save"
              successMessage="Announcement updated successfully."
            >
              <input type="hidden" name="id" value={a.id} />
              <AdminField label="Title" required>
                <input name="title" defaultValue={a.title} className="hub-input" required />
              </AdminField>
              <AdminField label="Body" required>
                <textarea
                  name="body"
                  defaultValue={a.body}
                  className="hub-input"
                  rows={2}
                  required
                />
              </AdminField>
              <AdminField label="Icon">
                <select name="icon" defaultValue={a.icon} className="hub-select">
                  <option value="bell">Bell</option>
                  <option value="war">War</option>
                </select>
              </AdminField>

              <div className="border border-[#d4af37]/20 bg-[rgba(8,12,22,0.45)] p-3">
                <p className="font-display text-[10px] tracking-[0.2em] text-[#8a7028] uppercase">
                  Banner photo
                </p>
                <p className="mt-1.5 text-xs text-[rgba(242,239,230,0.55)]">
                  Preferred:{" "}
                  <span className="text-[#f0d060]">
                    {ANNOUNCEMENT_IMAGE_PREFERRED.label}
                  </span>{" "}
                  (optional). Leave empty to keep the current image.
                </p>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hub-input mt-3 w-full text-xs file:mr-2 file:border-0 file:bg-transparent file:font-display file:text-[10px] file:tracking-widest file:text-[#f0d060] file:uppercase"
                />
                {a.image ? (
                  <label className="mt-2 flex items-center gap-2 text-xs text-red-300/80">
                    <input
                      type="checkbox"
                      name="clearImage"
                      value="1"
                      className="accent-red-400"
                    />
                    Remove current photo
                  </label>
                ) : null}
              </div>

              <button type="submit" className="hub-btn">
                Save
              </button>
            </ConfirmForm>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {a.isPublished ? (
                <ConfirmForm
                  action={setAnnouncementVisibilityAction.bind(null, a.id, false)}
                  title="Hide announcement"
                  message={`Hide “${a.title}” from the dashboard? You can show it again later.`}
                  confirmLabel="Hide"
                  successMessage="Announcement hidden from the dashboard."
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
                  action={setAnnouncementVisibilityAction.bind(null, a.id, true)}
                  title="Show announcement"
                  message={`Show “${a.title}” on the dashboard again?`}
                  confirmLabel="Show"
                  successMessage="Announcement is visible on the dashboard again."
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
                action={softDeleteAnnouncementAction.bind(null, a.id)}
                title="Delete announcement"
                message={`Soft delete “${a.title}”? Prefer Hide if you may need it later.`}
                confirmLabel="Delete"
                tone="danger"
                successMessage="Announcement deleted."
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
