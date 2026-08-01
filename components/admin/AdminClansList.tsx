"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import HubSearchInput, {
  matchesSearch,
} from "@/components/dashboard/HubSearchInput";
import {
  softDeleteClanAction,
  upsertClanAction,
  updateClanResourcesAction,
} from "@/lib/actions/clans-members";

export type AdminClanListItem = {
  id: string;
  name: string;
  slug: string;
  serverId: string;
  serverName: string;
  memberCount: number;
  resources: {
    clanFund: string;
    darksteel: string;
    clanEnergy: string;
    energyCapacityPct: number;
  } | null;
};

export default function AdminClansList({
  clans,
  servers,
}: {
  clans: AdminClanListItem[];
  servers: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      clans.filter((clan) =>
        matchesSearch(query, clan.name, clan.slug, clan.serverName),
      ),
    [clans, query],
  );

  return (
    <>
      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
              List of clans
            </h2>
            <p className="mt-1 text-sm text-[rgba(242,239,230,0.45)]">
              {filtered.length}
              {query.trim() ? ` of ${clans.length}` : ""} clan
              {filtered.length === 1 ? "" : "s"}
              {query.trim() ? " matching" : " tracked"}
            </p>
          </div>
          <HubSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by clan name…"
            aria-label="Search clans"
          />
        </div>

        {clans.length === 0 ? (
          <OrnateFrame className="p-5" ornate={false}>
            <p className="text-sm text-[rgba(242,239,230,0.5)]">
              No clans yet. Create one above.
            </p>
          </OrnateFrame>
        ) : filtered.length === 0 ? (
          <OrnateFrame className="p-5" ornate={false}>
            <p className="text-sm text-[rgba(242,239,230,0.5)]">
              No clans match “{query.trim()}”.
            </p>
          </OrnateFrame>
        ) : (
          <OrnateFrame className="mb-6 p-4" ornate={false}>
            <ul className="flex flex-wrap gap-2">
              {filtered.map((clan) => (
                <li key={clan.id}>
                  <a
                    href={`#clan-${clan.slug}`}
                    className="hub-btn inline-flex items-center gap-2"
                  >
                    <span>{clan.name}</span>
                    <span className="text-[10px] tracking-wider text-[#8a7028] uppercase">
                      {clan.memberCount}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </OrnateFrame>
        )}
      </section>

      <div className="space-y-4">
        {filtered.map((clan) => (
          <OrnateFrame
            key={clan.id}
            id={`clan-${clan.slug}`}
            className="scroll-mt-24 p-5"
            ornate={false}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg text-[#f0d060]">{clan.name}</p>
                <p className="text-sm text-[rgba(242,239,230,0.5)]">
                  /{clan.slug} · {clan.serverName} · {clan.memberCount} members
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/clans/${clan.slug}`}
                  className="hub-btn"
                >
                  View
                </Link>
                <ConfirmForm
                  action={softDeleteClanAction.bind(null, clan.id)}
                  title="Delete clan"
                  message={`Soft delete ${clan.name}? It will be removed from the public dashboard (not permanently wiped).`}
                  confirmLabel="Delete"
                  tone="danger"
                  successMessage="Clan removed from the dashboard."
                >
                  <button type="submit" className="hub-btn">
                    Soft delete
                  </button>
                </ConfirmForm>
              </div>
            </div>

            <ConfirmForm
              action={upsertClanAction}
              className="mt-4 grid gap-3 sm:grid-cols-3"
              title="Save clan"
              message={`Save changes to ${clan.name}? Updates show on the public dashboard.`}
              confirmLabel="Save"
              successMessage="Clan updated on the dashboard."
            >
              <input type="hidden" name="id" value={clan.id} />
              <AdminField label="Name" required>
                <input
                  name="name"
                  defaultValue={clan.name}
                  className="hub-input"
                  required
                />
              </AdminField>
              <AdminField label="Slug" required>
                <input
                  name="slug"
                  defaultValue={clan.slug}
                  className="hub-input"
                  required
                />
              </AdminField>
              <AdminField label="Server" required>
                <select
                  name="serverId"
                  defaultValue={clan.serverId}
                  className="hub-select"
                  required
                >
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </AdminField>
              <button type="submit" className="hub-btn sm:col-span-3">
                Save clan
              </button>
            </ConfirmForm>

            <ConfirmForm
              action={updateClanResourcesAction}
              className="mt-4 grid gap-3 border-t border-[#d4af37]/15 pt-4 sm:grid-cols-4"
              title="Save resources"
              message={`Update resources for ${clan.name}?`}
              confirmLabel="Save resources"
              successMessage="Clan resources updated."
            >
              <input type="hidden" name="clanId" value={clan.id} />
              <AdminField label="Clan fund">
                <input
                  name="clanFund"
                  className="hub-input"
                  defaultValue={clan.resources?.clanFund ?? "0"}
                  placeholder="0"
                />
              </AdminField>
              <AdminField label="Darksteel">
                <input
                  name="darksteel"
                  className="hub-input"
                  defaultValue={clan.resources?.darksteel ?? "0"}
                  placeholder="0"
                />
              </AdminField>
              <AdminField label="Clan energy">
                <input
                  name="clanEnergy"
                  className="hub-input"
                  defaultValue={clan.resources?.clanEnergy ?? "0"}
                  placeholder="0"
                />
              </AdminField>
              <AdminField label="Capacity %">
                <input
                  name="energyCapacityPct"
                  className="hub-input"
                  defaultValue={clan.resources?.energyCapacityPct ?? 0}
                  placeholder="0"
                />
              </AdminField>
              <button type="submit" className="hub-btn sm:col-span-4">
                Save resources
              </button>
            </ConfirmForm>
          </OrnateFrame>
        ))}
      </div>
    </>
  );
}
