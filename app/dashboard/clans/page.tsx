"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";
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

export default function ClansPage() {
  const [clans, setClans] = useState<ClanRow[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [servers, setServers] = useState<{ id: string; name: string }[]>([]);
  const [alliances, setAlliances] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [serverId, setServerId] = useState("all");
  const [allianceId, setAllianceId] = useState("all");

  useEffect(() => {
    fetch("/api/tracker/clans")
      .then((r) => r.json())
      .then((data) => {
        setClans(data.clans ?? []);
        setRegions(data.regions ?? []);
        setServers(data.servers ?? []);
        setAlliances(data.alliances ?? []);
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clans
      .filter((clan) => {
        if (q && !clan.name.toLowerCase().includes(q)) return false;
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
  }, [clans, query, region, serverId, allianceId]);

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
        description="Browse and compare clans across regions, servers, and alliances."
      />

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clan..."
          className="hub-input"
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
