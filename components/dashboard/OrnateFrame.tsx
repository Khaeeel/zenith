import type { ReactNode } from "react";

export default function OrnateFrame({
  children,
  className = "",
  ornate = true,
}: {
  children: ReactNode;
  className?: string;
  ornate?: boolean;
}) {
  return (
    <div
      className={`hub-frame ${ornate ? "hub-frame-ornate" : ""} ${className}`}
    >
      {children}
      {ornate ? <span className="hub-ornament-bottom" aria-hidden /> : null}
    </div>
  );
}
