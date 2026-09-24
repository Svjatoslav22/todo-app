"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles, Sun, Moon, ShieldCheck } from "lucide-react";
import api, { setAccessToken } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }

    if (password.length < 6) {
      setError("Пароль повинен бути щонайменше 6 символів");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", { email, password });
      setAccessToken(data.accessToken || data.token);
      toast.success("Вітаємо в Todo Pro!", {
        description: "Ваш обліковий запис успішно створено.",
      });
      router.push("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Помилка створення акаунту. Спробуйте ще раз";
      setError(msg);
      toast.error("Помилка реєстрації", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none -z-10" />

      {/* Theme Switcher in Corner */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-2.5 text-zinc-600 dark:text-zinc-300 shadow-sm backdrop-blur-xl transition hover:bg-white dark:hover:bg-zinc-800"
          aria-label="Змінити тему"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Реєстрація в Todo Pro</span>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
            Створіть робочий простір нового покоління для щоденної продуктивності
          </p>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-8 shadow-xl backdrop-blur-2xl space-y-4"
        >
          <Input
            id="email"
            label="Електронна пошта"
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Input
            id="password"
            label="Пароль"
            type="password"
            required
            placeholder="•••••••• (мін. 6 символів)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Паролі надійно шифруються за допомогою bcrypt</span>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? "Створення облікового запису..." : "Створити акаунт"}
          </Button>

          <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Вже зареєстровані?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Увійти в акаунт
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
