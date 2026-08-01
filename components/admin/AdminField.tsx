import type { ReactNode } from "react";

/** Labeled admin form field with optional required asterisk. */
export default function AdminField({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1.5 font-display text-[10px] tracking-[0.2em] text-[#8a7028] uppercase">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-400" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </p>
      {children}
      {hint ? (
        <p className="mt-1.5 text-[11px] leading-snug text-[rgba(242,239,230,0.4)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
