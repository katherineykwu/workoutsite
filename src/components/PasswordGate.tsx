// Password gate — light theme
"use client";

import { useState } from "react";

export default function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem("trainer-auth", "true");
      onSuccess();
    } else {
      setError("Wrong password. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3F4] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-pink rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FF1A66]/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A0A1F] mb-1">Trainer Access</h1>
          <p className="text-[#1A0A1F]/40 text-sm">Enter your password to manage workouts</p>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3.5 bg-[#F5F3F4] border border-black/5 rounded-xl text-[#1A0A1F] placeholder-[#1A0A1F]/30 focus:outline-none focus:ring-2 focus:ring-[#FF1A66] focus:border-transparent transition-all"
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 mt-3 text-[#FF1A66] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 gradient-pink text-white py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FF1A66]/25"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
