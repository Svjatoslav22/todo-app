import confetti from "canvas-confetti";

export function triggerConfetti() {
  if (typeof window === "undefined") return;

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
  });
}

export function triggerAchievementCelebration() {
  if (typeof window === "undefined") return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      particleCount,
      spread: 360,
      startVelocity: 30,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: ["#6366f1", "#8b5cf6", "#ec4899", "#fbbf24"],
    });
  }, 250);
}
