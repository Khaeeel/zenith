"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { isActionResult } from "@/lib/action-result";

type ConfirmTone = "default" | "danger";

type Feedback =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type ConfirmFormProps = {
  /** Always invoked with FormData from the wrapped form */
  action: (formData: FormData) => unknown;
  children: ReactNode;
  className?: string;
  /** Shown in the confirm dialog body */
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Shown only after the action succeeds and the page refreshes */
  successMessage?: string;
  successTitle?: string;
  /** Set false for redirects (e.g. logout) */
  notifySuccess?: boolean;
};

/**
 * Drop-in form wrapper — confirms, runs the server action, refreshes UI,
 * then shows a success popup only after data has updated.
 */
export default function ConfirmForm({
  action,
  children,
  className,
  message,
  title = "Confirm changes",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  successMessage = "Changes saved successfully.",
  successTitle = "Success",
  notifySuccess = true,
}: ConfirmFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const titleId = useId();
  const descId = useId();
  const feedbackTitleId = useId();
  const feedbackDescId = useId();

  useEffect(() => {
    if (!confirmOpen && !feedback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || pending) return;
      if (feedback) setFeedback(null);
      else setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, feedback, pending]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFeedback(null);
    setConfirmOpen(true);
  }

  function runConfirmed() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);

    startTransition(async () => {
      try {
        const result = await action(fd);

        if (isActionResult(result) && !result.ok) {
          setConfirmOpen(false);
          setFeedback({
            kind: "error",
            message: result.error || "Something went wrong.",
          });
          return;
        }

        // Refresh RSC payload so UI matches DB before success popup
        router.refresh();
        await new Promise((r) => setTimeout(r, 150));

        setConfirmOpen(false);
        if (notifySuccess) {
          setFeedback({ kind: "success", message: successMessage });
        }
      } catch (err) {
        // Next.js redirect() throws — let navigation proceed
        const dig =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest?: unknown }).digest ?? "")
            : "";
        if (dig.startsWith("NEXT_REDIRECT")) {
          setConfirmOpen(false);
          return;
        }
        setConfirmOpen(false);
        setFeedback({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    });
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className={className}>
        {children}
      </form>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => {
            if (!pending) setConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="hub-frame w-full max-w-md border border-[#d4af37]/35 bg-[rgba(8,12,22,0.98)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={titleId}
              className="font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase"
            >
              {title}
            </h2>
            <p
              id={descId}
              className="mt-3 text-sm leading-relaxed text-[rgba(242,239,230,0.7)]"
            >
              {message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="hub-btn"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={
                  tone === "danger"
                    ? "rounded-sm border border-red-500/50 bg-red-950/50 px-4 py-2 font-display text-[10px] tracking-[0.2em] text-red-200 uppercase transition hover:bg-red-900/50 disabled:opacity-50"
                    : "hub-btn-filled"
                }
                disabled={pending}
                onClick={runConfirmed}
              >
                {pending ? "Saving…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => setFeedback(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={feedbackTitleId}
            aria-describedby={feedbackDescId}
            className="hub-frame w-full max-w-md border border-[#d4af37]/35 bg-[rgba(8,12,22,0.98)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={feedbackTitleId}
              className={`font-display text-sm tracking-[0.2em] uppercase ${
                feedback.kind === "success" ? "text-[#f0d060]" : "text-red-300"
              }`}
            >
              {feedback.kind === "success" ? successTitle : "Couldn’t save"}
            </h2>
            <p
              id={feedbackDescId}
              className="mt-3 text-sm leading-relaxed text-[rgba(242,239,230,0.7)]"
            >
              {feedback.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="hub-btn-filled"
                onClick={() => setFeedback(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
