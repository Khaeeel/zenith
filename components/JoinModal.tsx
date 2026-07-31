"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { MIR4_CLASSES, TIMEZONES } from "@/lib/clans";
import { submitJoinApplicationAction } from "@/lib/actions/join";

type JoinModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  ign: string;
  discord: string;
  email: string;
  clanId: string;
  powerScore: string;
  classId: string;
  hourStart: string;
  hourEnd: string;
  timezone: string;
  reason: string;
};

const INITIAL: FormState = {
  ign: "",
  discord: "",
  email: "",
  clanId: "",
  powerScore: "",
  classId: "",
  hourStart: "18",
  hourEnd: "23",
  timezone: "UTC+8",
  reason: "",
};

function formatHour(h: string) {
  const n = Number(h);
  const ampm = n >= 12 ? "PM" : "AM";
  const display = n % 12 === 0 ? 12 : n % 12;
  return `${display}:00 ${ampm}`;
}

export default function JoinModal({ open, onClose }: JoinModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [clans, setClans] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/clans")
      .then((r) => r.json())
      .then((data) => setClans(Array.isArray(data) ? data : []))
      .catch(() => setClans([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const res = await submitJoinApplicationAction(fd);
    setSubmitting(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSuccess(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setError("");
      setForm(INITIAL);
    }, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-modal-title"
            className="gold-border relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-obsidian/95 shadow-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/20 bg-obsidian/95 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h2
                    id="join-modal-title"
                    className="font-display text-sm tracking-wide text-gold-bright sm:text-base"
                  >
                    Join the Coalition
                  </h2>
                  <p className="text-[10px] tracking-wider text-gold-dim uppercase">
                    Application Form
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-gold transition hover:border-gold hover:bg-gold/10"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center gap-4 py-10 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold bg-gold/10 text-2xl text-gold-bright gold-glow">
                      ✦
                    </div>
                    <h3 className="font-display text-xl text-gold-bright">
                      Application Received
                    </h3>
                    <p className="max-w-xs text-sm text-foreground/70">
                      Your request has been noted. Clan leaders and elders will
                      review it soon. Welcome to the resistance.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-4 rounded-full border border-gold/50 px-6 py-2 font-display text-sm tracking-wider text-gold transition hover:bg-gold/10"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Field label="IGN (In-Game Name)" required>
                      <input
                        className="arc-input"
                        required
                        value={form.ign}
                        onChange={(e) => update("ign", e.target.value)}
                        placeholder="Your character name"
                        maxLength={32}
                      />
                    </Field>

                    <Field label="Discord Username" required>
                      <input
                        className="arc-input"
                        required
                        value={form.discord}
                        onChange={(e) => update("discord", e.target.value)}
                        placeholder="username"
                        maxLength={64}
                      />
                    </Field>

                    <Field label="Email (optional)">
                      <input
                        className="arc-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@email.com"
                      />
                    </Field>

                    <Field label="Choose a Clan" required>
                      <select
                        className="arc-input appearance-none"
                        required
                        value={form.clanId}
                        onChange={(e) => update("clanId", e.target.value)}
                      >
                        <option value="" disabled>
                          Select a clan…
                        </option>
                        {clans.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {error ? (
                      <p className="text-sm text-red-400">{error}</p>
                    ) : null}

                    <Field label="Power Score" required>
                      <input
                        className="arc-input"
                        required
                        type="number"
                        min={0}
                        step={1}
                        value={form.powerScore}
                        onChange={(e) => update("powerScore", e.target.value)}
                        placeholder="e.g. 185000"
                      />
                    </Field>

                    <Field label="Class" required>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {MIR4_CLASSES.map((cls) => {
                          const selected = form.classId === cls.id;
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => update("classId", cls.id)}
                              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition ${
                                selected
                                  ? "border-gold bg-gold/15 text-gold-bright"
                                  : "border-gold/20 text-foreground/60 hover:border-gold/50"
                              }`}
                              aria-pressed={selected}
                            >
                              <span className="text-lg">{cls.icon}</span>
                              <span className="text-[9px] tracking-wide">
                                {cls.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Hidden required validation */}
                      <input
                        tabIndex={-1}
                        className="sr-only"
                        required
                        value={form.classId}
                        onChange={() => {}}
                      />
                    </Field>

                    <Field label="Active Hours / Timezone" required>
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] tracking-wider text-gold-dim uppercase">
                              From — {formatHour(form.hourStart)}
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={23}
                              value={form.hourStart}
                              onChange={(e) =>
                                update("hourStart", e.target.value)
                              }
                              className="w-full accent-gold"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] tracking-wider text-gold-dim uppercase">
                              To — {formatHour(form.hourEnd)}
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={23}
                              value={form.hourEnd}
                              onChange={(e) =>
                                update("hourEnd", e.target.value)
                              }
                              className="w-full accent-gold"
                            />
                          </div>
                        </div>
                        <select
                          className="arc-input appearance-none"
                          required
                          value={form.timezone}
                          onChange={(e) => update("timezone", e.target.value)}
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Why do you want to join the clan?" required>
                      <textarea
                        className="arc-input min-h-[100px] resize-y"
                        required
                        value={form.reason}
                        onChange={(e) => update("reason", e.target.value)}
                        placeholder="Tell the leaders why you belong here…"
                        maxLength={500}
                      />
                      <p className="mt-1 text-right text-[10px] text-foreground/40">
                        {form.reason.length}/500
                      </p>
                    </Field>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative mt-2 overflow-hidden rounded-full bg-gradient-to-r from-gold-dim via-gold to-gold-bright px-6 py-3 font-display text-sm font-semibold tracking-widest text-obsidian uppercase transition disabled:opacity-60"
                    >
                      <span className="relative z-10">
                        {submitting ? "Submitting…" : "Submit Application"}
                      </span>
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition group-hover:translate-x-full group-hover:duration-700" />
                    </button>

                    <p className="text-center text-[10px] text-foreground/40">
                      Applications are reviewed by clan leaders & elders.
                      Credentials stay confidential.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display text-xs tracking-wider text-gold">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
      </span>
      {children}
    </label>
  );
}
