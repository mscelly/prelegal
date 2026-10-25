"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#209dd7] focus:outline-none focus:ring-1 focus:ring-[#209dd7]";

/**
 * Placeholder sign-in: accepts any input and takes the user into the platform.
 * Real authentication against the backend comes later.
 */
export default function LoginForm() {
  const router = useRouter();

  function signIn(e: FormEvent) {
    e.preventDefault();
    router.push("/nda/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={signIn}
        aria-label="Sign in"
        className="w-full max-w-sm space-y-5 rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#032147]">Prelegal</h1>
          <p className="text-sm text-[#888888]">Sign in to draft your legal agreements.</p>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input id="password" type="password" autoComplete="current-password" className={inputClass} />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e2d75] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#753991]"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
