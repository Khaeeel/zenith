"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormEvent, Suspense, useState, useTransition } from "react";
import { loginAction } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push(params.get("callbackUrl") || "/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="hub-input"
          placeholder="admin@arc-zenith.local"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="hub-input"
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="hub-btn-filled w-full py-3.5"
      >
        {pending ? "Signing in…" : "Enter Command Hub"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="hub-theme relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(60,80,120,0.4), transparent 55%), radial-gradient(ellipse at bottom, rgba(212,175,55,0.06), transparent 40%), linear-gradient(180deg, #0a1224 0%, #070b14 100%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 h-[45vh] w-[60vw] -translate-x-1/2 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(180,200,255,0.2), transparent 65%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt="ARC"
            className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]"
          />
          <p className="mt-4 font-display text-[10px] tracking-[0.35em] text-[#c9a84a] uppercase">
            Official Command Hub
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.08em] text-[#f2efe6]">
            Admin Access
          </h1>
          <p className="mt-3 max-w-sm font-display text-sm italic text-[#d4af37]/85">
            Sign in to manage clans, members, events, and contacts.
          </p>
        </div>

        <div className="hub-frame hub-frame-ornate p-6 sm:p-8">
          <span className="hub-ornament-bottom" aria-hidden />
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-5 text-center text-[11px] text-[rgba(242,239,230,0.35)]">
            Seed password: ChangeMe123!
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-display text-[10px] tracking-[0.2em] text-[#c9a84a]/70 uppercase hover:text-[#f0d060]"
          >
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
