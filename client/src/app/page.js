"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">TODO</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
        >
          <LogOut className="h-4 w-4" />
          Вийти
        </button>
      </header>
      <section className="px-6 py-10 text-zinc-600">тут шось буде))</section>
    </main>
  );
}
