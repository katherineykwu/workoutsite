// Password gate — Jamie's army green theme with Bonobono
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
      setError("Wrong password. Try again!");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F0] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🦦</span>
          <h1 className="text-2xl font-extrabold text-[#4A5D23] mb-1">Hey, Jamie!</h1>
          <p className="text-[#4A5D23]/40 text-sm">Enter your password to get started</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#4A5D23]/10 shadow-sm p-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3.5 bg-[#F7F6F0] border border-[#4A5D23]/10 rounded-xl text-[#1A0A1F] placeholder-[#1A0A1F]/30 focus:outline-none focus:ring-2 focus:ring-[#4A5D23] focus:border-transparent transition-all"
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 mt-3 text-[#E8730C] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 bg-[#4A5D23] text-white py-3.5 rounded-xl font-bold hover:bg-[#3D4E1C] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#4A5D23]/25"
          >
            {loading ? "Checking..." : "Let's Go!"}
          </button>
        </div>
      </form>
    </div>
  );
}
