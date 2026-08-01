import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { updateAccountAction } from "@/lib/actions/clans-members";

export default async function AdminAccountPage() {
  const session = await requireAdmin();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { member: true },
  });

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Account"
        description="Update your display name, email, password, and linked IGN."
      />
      <OrnateFrame className="max-w-xl p-6">
        <ConfirmForm
          action={updateAccountAction}
          className="space-y-4"
          title="Save account"
          message="Save these account changes?"
          confirmLabel="Save account"
        >
          <div>
            <label className="mb-1 block font-display text-[10px] tracking-widest text-[#c9a84a] uppercase">
              Display name
              <span className="ml-0.5 text-red-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              name="displayName"
              defaultValue={user.displayName}
              className="hub-input"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-[10px] tracking-widest text-[#c9a84a] uppercase">
              Email
              <span className="ml-0.5 text-red-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              className="hub-input"
              required
            />
          </div>
          {user.member ? (
            <div>
              <label className="mb-1 block font-display text-[10px] tracking-widest text-[#c9a84a] uppercase">
                Linked IGN
              </label>
              <input
                name="ign"
                defaultValue={user.member.ign}
                className="hub-input"
              />
            </div>
          ) : (
            <p className="text-sm text-[rgba(242,239,230,0.45)]">
              No linked member character.
            </p>
          )}
          <div>
            <label className="mb-1 block font-display text-[10px] tracking-widest text-[#c9a84a] uppercase">
              New password (optional)
            </label>
            <input
              name="password"
              type="password"
              className="hub-input"
              placeholder="Leave blank to keep current"
            />
          </div>
          <button type="submit" className="hub-btn-filled">
            Save account
          </button>
        </ConfirmForm>
      </OrnateFrame>
    </div>
  );
}
