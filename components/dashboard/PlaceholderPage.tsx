import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader
        title={title}
        description="This section is coming soon. Static dashboard data is live on Overview and Clans."
      />
      <OrnateFrame className="px-6 py-16 text-center">
        <p className="font-display text-sm tracking-[0.28em] text-[#8a7028] uppercase">
          Under construction
        </p>
      </OrnateFrame>
    </div>
  );
}
