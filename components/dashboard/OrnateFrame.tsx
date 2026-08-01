import type { ReactNode } from "react";

export default function OrnateFrame({
  children,
  className = "",
  ornate = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  ornate?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`hub-frame ${ornate ? "hub-frame-ornate" : ""} ${className}`}
    >
      {children}
      {ornate ? <span className="hub-ornament-bottom" aria-hidden /> : null}
    </div>
  );
}
