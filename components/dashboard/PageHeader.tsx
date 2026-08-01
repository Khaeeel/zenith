import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  belowTitle,
  meta,
  aside,
  actions,
}: {
  title: string;
  description?: string;
  /** Content directly under the title block (e.g. active clan card). */
  belowTitle?: ReactNode;
  /** Optional center content (fills space between title and aside). */
  meta?: ReactNode;
  aside?: ReactNode;
  /** Top-right actions (links/buttons) — never overlaps the title. */
  actions?: ReactNode;
}) {
  const hasMeta = Boolean(meta);
  const hasAside = Boolean(aside);
  const multi = hasMeta || hasAside;

  const gridClass = !multi
    ? "w-full min-w-0"
    : hasMeta && hasAside
      ? "grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-[minmax(11rem,0.85fr)_minmax(0,1.35fr)_minmax(13rem,0.95fr)] xl:items-start xl:gap-6"
      : "grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-start xl:grid-cols-[minmax(0,1.5fr)_minmax(13rem,0.95fr)] xl:gap-6";

  return (
    <header className="mb-6 w-full min-w-0 sm:mb-8 lg:mb-10">
      <div className={gridClass}>
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h1 className="min-w-0 font-display text-[clamp(1.75rem,4vw+0.5rem,2.75rem)] leading-tight tracking-[0.06em] text-[#f2efe6]">
              {title}
            </h1>
            {actions && !multi ? (
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end sm:pt-2">
                {actions}
              </div>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2 max-w-prose font-display text-[clamp(0.8rem,1.5vw+0.4rem,1rem)] italic leading-relaxed tracking-wide text-[#d4af37]/90 sm:mt-3">
              {description}
            </p>
          ) : null}
          {belowTitle ? <div className="mt-3 w-full sm:mt-4">{belowTitle}</div> : null}
        </div>

        {actions && multi ? (
          <div
            className={`flex flex-wrap gap-2 md:col-span-2 ${hasMeta && hasAside ? "xl:col-span-3" : ""} xl:justify-end`}
          >
            {actions}
          </div>
        ) : null}

        {meta ? (
          <div className="min-w-0 w-full md:col-span-1 xl:pt-1">{meta}</div>
        ) : null}

        {aside ? (
          <div
            className={`min-w-0 w-full xl:pt-1 ${hasMeta ? "md:col-span-2 xl:col-span-1" : ""}`}
          >
            {aside}
          </div>
        ) : null}
      </div>
      <div
        className={`mt-5 h-px w-full sm:mt-6 ${multi ? "" : "max-w-md"}`}
        style={{
          background:
            "linear-gradient(90deg, rgba(212,175,55,0.7), rgba(212,175,55,0.15), transparent)",
        }}
      />
    </header>
  );
}
