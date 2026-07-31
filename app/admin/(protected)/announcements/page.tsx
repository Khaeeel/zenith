import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import {
  softDeleteAnnouncementAction,
  upsertAnnouncementAction,
} from "@/lib/actions/content";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const items = await db.announcement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Announcements" description="Dashboard announcement feed." />

      <OrnateFrame className="mb-8 p-5">
        <form action={upsertAnnouncementAction} className="grid gap-3">
          <input name="title" placeholder="Title" className="hub-input" required />
          <textarea name="body" placeholder="Body" className="hub-input" rows={3} required />
          <select name="icon" className="hub-select" defaultValue="bell">
            <option value="bell">Bell</option>
            <option value="war">War</option>
          </select>
          <button type="submit" className="hub-btn-filled">
            Publish
          </button>
        </form>
      </OrnateFrame>

      <div className="space-y-3">
        {items.map((a) => (
          <OrnateFrame key={a.id} className="p-4" ornate={false}>
            <form action={upsertAnnouncementAction} className="grid gap-2">
              <input type="hidden" name="id" value={a.id} />
              <input name="title" defaultValue={a.title} className="hub-input" />
              <textarea name="body" defaultValue={a.body} className="hub-input" rows={2} />
              <select name="icon" defaultValue={a.icon} className="hub-select">
                <option value="bell">Bell</option>
                <option value="war">War</option>
              </select>
              <button type="submit" className="hub-btn">
                Save
              </button>
            </form>
            <form
              action={softDeleteAnnouncementAction.bind(null, a.id)}
              className="mt-2"
            >
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
