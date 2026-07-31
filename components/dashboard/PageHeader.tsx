export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10">
      <h1 className="font-display text-3xl tracking-[0.06em] text-[#f2efe6] sm:text-4xl md:text-[2.75rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl font-display text-sm italic leading-relaxed tracking-wide text-[#d4af37]/90 sm:text-base">
          {description}
        </p>
      ) : null}
      <div
        className="mt-6 h-px max-w-md"
        style={{
          background:
            "linear-gradient(90deg, rgba(212,175,55,0.7), rgba(212,175,55,0.15), transparent)",
        }}
      />
    </header>
  );
}
