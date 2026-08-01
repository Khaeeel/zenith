import ClansBrowser from "@/components/dashboard/ClansBrowser";
import {
  getAlliancesForFilter,
  getClansForList,
  getServersAndRegions,
} from "@/lib/tracker/queries";

/** Short cache; admin clan mutations call revalidatePath. */
export const revalidate = 30;

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
