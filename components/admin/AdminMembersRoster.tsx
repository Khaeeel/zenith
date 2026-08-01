"use client";

import { useMemo, useState } from "react";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import HubSearchInput, {
  matchesSearch,
} from "@/components/dashboard/HubSearchInput";
import { MIR4_CLASSES } from "@/lib/clans";
import {
  softDeleteMemberAction,
  upsertMemberAction,
} from "@/lib/actions/clans-members";

export type AdminMemberRow = {
  id: string;
  ign: string;
  role: string;
  powerScore: string;
  classId: string | null;
  clanId: string;
  clanName: string;
};

export default function AdminMembersRoster({
  clans,
  members,
  activeClanId,
}: {
  clans: { id: string; name: string }[];
  members: AdminMemberRow[];
  activeClanId: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();

  const visibleMembers = useMemo(() => {
    if (!q) {
      return activeClanId
        ? members.filter((m) => m.clanId === activeClanId)
        : members;
    }
    return members.filter((m) => matchesSearch(query, m.ign, m.clanName));
  }, [members, activeClanId, query, q]);

  const filteredClans = useMemo(() => {
    if (!q) return clans;
    const memberClanIds = new Set(visibleMembers.map((m) => m.clanId));
    return clans.filter(
      (c) => matchesSearch(query, c.name) || memberClanIds.has(c.id),
    );
  }, [clans, query, q, visibleMembers]);

  return (
    <>
      <div className="mb-4">
        <HubSearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by IGN or clan…"
          aria-label="Search members by IGN or clan"
        />
        {q ? (
          <p className="mt-2 text-xs text-[rgba(242,239,230,0.45)]">
            Showing {visibleMembers.length} match
            {visibleMembers.length === 1 ? "" : "es"} across clans
          </p>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {(q ? filteredClans : clans).map((c) => (
          <a
            key={c.id}
            href={`/admin/members?clanId=${c.id}`}
            className={`hub-btn min-w-0 truncate text-center ${activeClanId === c.id && !q ? "hub-btn-filled" : ""}`}
            title={c.name}
          >
            {c.name}
          </a>
        ))}
        {q && filteredClans.length === 0 ? (
          <p className="col-span-full text-sm text-[rgba(242,239,230,0.45)]">
            No clans match “{q}”.
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {visibleMembers.map((m) => (
          <OrnateFrame key={m.id} className="p-3 sm:p-4" ornate={false}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display text-sm text-[#f0d060]">
                  {m.ign}
                </p>
                {q || m.clanId !== activeClanId ? (
                  <p className="mt-0.5 text-[11px] text-[rgba(242,239,230,0.45)]">
                    {m.clanName}
                  </p>
                ) : null}
              </div>
              <ConfirmForm
                action={softDeleteMemberAction.bind(null, m.id)}
                title="Delete member"
                message={`Soft delete ${m.ign}? They will be removed from the active roster.`}
                confirmLabel="Delete"
                tone="danger"
                successMessage="Member deleted."
              >
                <button
                  type="submit"
                  className="shrink-0 text-xs tracking-wide text-red-400/80 hover:text-red-300"
                >
                  Soft delete
                </button>
              </ConfirmForm>
            </div>
            <ConfirmForm
              action={upsertMemberAction}
              className="space-y-3"
              title="Save member"
              message={`Save changes to ${m.ign}?`}
              confirmLabel="Save"
              successMessage="Member updated successfully."
            >
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="clanId" value={m.clanId} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <AdminField label="IGN" required>
                  <input
                    name="ign"
                    defaultValue={m.ign}
                    className="hub-input"
                    placeholder="IGN"
                    required
                  />
                </AdminField>
                <AdminField label="Role">
                  <select
                    name="role"
                    defaultValue={m.role}
                    className="hub-select"
                  >
                    <option value="clan_leader">Clan Leader</option>
                    <option value="elder">Elder</option>
                    <option value="master_protector">Master Protector</option>
                    <option value="member">Member</option>
                  </select>
                </AdminField>
                <AdminField label="Power score" required>
                  <input
                    name="powerScore"
                    defaultValue={m.powerScore}
                    className="hub-input"
                    inputMode="numeric"
                    pattern="[0-9,]+"
                    title="Enter a whole number"
                    required
                  />
                </AdminField>
                <AdminField label="Class">
                  <select
                    name="classId"
                    defaultValue={m.classId ?? ""}
                    className="hub-select"
                  >
                    {MIR4_CLASSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <button type="submit" className="hub-btn-filled w-full sm:w-auto">
                Save
              </button>
            </ConfirmForm>
          </OrnateFrame>
        ))}
        {visibleMembers.length === 0 ? (
          <OrnateFrame className="p-5" ornate={false}>
            <p className="text-sm text-[rgba(242,239,230,0.5)]">
              {q
                ? `No members match “${q}”.`
                : "No members in this clan yet."}
            </p>
          </OrnateFrame>
        ) : null}
      </div>
    </>
  );
}
