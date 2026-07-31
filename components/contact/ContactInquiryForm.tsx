"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitJoinApplicationAction } from "@/lib/actions/join";

/** Lightweight inquiry form on Contact page — stores as join app with reason prefix */
export default function ContactInquiryForm({
  clanId,
}: {
  clanId?: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (!clanId) {
      setError("No clan configured for inquiries yet.");
      return;
    }
    fd.set("clanId", clanId);
    fd.set("classId", "warrior");
    fd.set("powerScore", "0");
    fd.set("hourStart", "0");
    fd.set("hourEnd", "0");
    fd.set("timezone", "UTC+8");
    const topic = String(fd.get("topic") || "General");
    const message = String(fd.get("message") || "");
    fd.set("reason", `[Contact:${topic}] ${message}`);
    fd.set("ign", String(fd.get("name") || "Contact"));
    start(async () => {
      const res = await submitJoinApplicationAction(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDone(true);
      (e.target as HTMLFormElement).reset();
    });
  }

  if (done) {
    return (
      <div className="border border-[#d4af37]/35 bg-[rgba(212,175,55,0.08)] px-5 py-8 text-center">
        <p className="font-display text-lg text-[#f0d060]">Message sent</p>
        <p className="mt-2 text-sm text-[rgba(242,239,230,0.55)]">
          Officers will review your inquiry shortly.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="hub-btn mt-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Name
        </label>
        <input name="name" required className="hub-input" placeholder="Your name / IGN" />
      </div>
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Discord ID
        </label>
        <input name="discord" required className="hub-input" placeholder="username" />
      </div>
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Email
        </label>
        <input name="email" type="email" className="hub-input" placeholder="optional@" />
      </div>
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Topic
        </label>
        <select name="topic" className="hub-select w-full" defaultValue="Recruitment">
          <option>Recruitment</option>
          <option>Alliance</option>
          <option>Events</option>
          <option>Support</option>
          <option>General</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Clan / Alliance
        </label>
        <input name="clanAlliance" className="hub-input" placeholder="Optional context" />
      </div>
      <div>
        <label className="mb-1 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={4}
          className="hub-input"
          placeholder="How can we help?"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" disabled={pending} className="hub-btn-filled w-full py-3">
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
