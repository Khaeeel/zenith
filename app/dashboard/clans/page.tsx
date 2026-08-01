import ClansBrowser from "@/components/dashboard/ClansBrowser";
import {
  getAlliancesForFilter,
  getClansForList,
  getServersAndRegions,
} from "@/lib/tracker/queries";

/** Fresh after admin clan mutations (revalidatePath). */
export const dynamic = "force-dynamic";

export default async function ClansPage() {
  const [clans, { servers, regions }, alliances] = await Promise.all([
    getClansForList(),
    getServersAndRegions(),
    getAlliancesForFilter(),
  ]);

  return (
    <ClansBrowser
      initialClans={clans}
      regions={regions}
      servers={servers.map((s) => ({ id: s.id, name: s.name }))}
      alliances={alliances}
    />
  );
}
