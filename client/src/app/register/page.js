"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { setAccessToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Будь ласка, заповніть усі поля");
      return;
    }

    if (password.length < 6) {
      setError("Пароль повинен містити щонайменше 6 символів");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", { email, password });
      setAccessToken(data.accessToken || data.token);
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Помилка реєстрації. Перевірте введені дані та спробуйте ще раз"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Реєстрація
          </h1>
          <p className="text-sm text-zinc-500">
            Створіть новий обліковий запис Todo Pro
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">
            Електронна пошта
          </span>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">Пароль</span>
            <span className="text-xs text-zinc-400">мін. 6 символів</span>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </label>

        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Реєстрація..." : "Створити акаунт"}
        </button>

        <p className="text-center text-sm text-zinc-600">
          Вже маєте акаунт?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-black"
          >
            Увійти
          </Link>
        </p>
      </form>
    </main>
  );
}
