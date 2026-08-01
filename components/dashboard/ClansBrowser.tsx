"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";
import HubSearchInput, {
  matchesSearch,
} from "@/components/dashboard/HubSearchInput";
import { formatPower } from "@/lib/tracker-format";

type ClanRow = {
  id: string;
  slug: string;
  name: string;
  region: string;
  serverName: string;
  serverId: string;
  allianceName: string | null;
  allianceId: string | null;
  players: number;
  totalPower: number;
};

export default function ClansBrowser({
  initialClans,
  regions,
  servers,
  alliances,
}: {
  initialClans: ClanRow[];
  regions: string[];
  servers: { id: string; name: string }[];
  alliances: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [serverId, setServerId] = useState("all");
  const [allianceId, setAllianceId] = useState("all");

  const filtered = useMemo(() => {
    return initialClans
      .filter((clan) => {
        if (!matchesSearch(query, clan.name, clan.allianceName)) return false;
        if (region !== "all" && clan.region !== region) return false;
        if (serverId !== "all" && clan.serverId !== serverId) return false;
        if (allianceId === "none" && clan.allianceId !== null) return false;
        if (
          allianceId !== "all" &&
          allianceId !== "none" &&
          clan.allianceId !== allianceId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.totalPower - a.totalPower);
  }, [initialClans, query, region, serverId, allianceId]);

  function reset() {
    setQuery("");
    setRegion("all");
    setServerId("all");
    setAllianceId("all");
  }

  return (
    <div>
      <PageHeader
        title="Clan List"
        description="Browse and compare clans across regions, servers, and alliances. Updates from Admin appear here."
      />

      <div className="mb-4">
        <HubSearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by clan name…"
          aria-label="Search clans"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="hub-select"
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          className="hub-select"
        >
          <option value="all">All Servers</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={allianceId}
          onChange={(e) => setAllianceId(e.target.value)}
          className="hub-select"
        >
          <option value="all">All Alliances</option>
          <option value="none">No Alliance</option>
          {alliances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={reset} className="hub-btn">
          Reset
        </button>
      </div>

      <OrnateFrame className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hub-table min-w-[800px]">
            <thead>
              <tr>
                <th>Clan Name</th>
                <th>Region</th>
                <th>Server</th>
                <th>Alliance</th>
                <th>Players</th>
                <th>Total Power</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clan) => (
                <tr key={clan.id}>
                  <td className="font-medium text-[#f0d060]">{clan.name}</td>
                  <td>{clan.region}</td>
                  <td>{clan.serverName}</td>
                  <td>{clan.allianceName ?? "—"}</td>
                  <td>{clan.players}</td>
                  <td className="font-display text-[#d4af37]">
                    {formatPower(clan.totalPower)}
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/clans/${clan.slug}`}
                      className="font-display text-[10px] tracking-[0.18em] text-[#f0d060] uppercase hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-[rgba(242,239,230,0.4)]"
                  >
                    No clans match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </OrnateFrame>
    </div>
  );
}
