import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { updateApplicationStatusAction } from "@/lib/actions/join";

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const apps = await db.joinApplication.findMany({
    include: { clan: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Join Applications"
        description="Review applications submitted from the homepage Join form."
      />
      <div className="space-y-3">
        {apps.length === 0 ? (
          <OrnateFrame className="p-6 text-sm text-[rgba(242,239,230,0.45)]">
            No applications yet.
          </OrnateFrame>
        ) : null}
        {apps.map((a) => (
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
                  {a.status} · {a.createdAt.toISOString()}
                </p>
              </div>
              <div className="flex gap-2">
                <ConfirmForm
                  action={updateApplicationStatusAction.bind(null, a.id, "accepted")}
                  title="Accept application"
                  message={`Accept ${a.ign}'s application to ${a.clan.name}?`}
                  confirmLabel="Accept"
                >
                  <button type="submit" className="hub-btn-filled">
                    Accept
                  </button>
                </ConfirmForm>
                <ConfirmForm
                  action={updateApplicationStatusAction.bind(null, a.id, "rejected")}
                  title="Reject application"
                  message={`Reject ${a.ign}'s application?`}
                  confirmLabel="Reject"
                  tone="danger"
                >
                  <button type="submit" className="hub-btn">
                    Reject
                  </button>
                </ConfirmForm>
              </div>
            </div>
          </OrnateFrame>
        ))}
      </div>
    </div>
  );
}
