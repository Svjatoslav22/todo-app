/**
 * Productivity, Streak, Heatmap, and Achievements tracking.
 * Syncs seamlessly to localStorage with reactive updates.
 */

const STREAK_KEY = "todo-pro-streak-v1";
const ACTIVITY_KEY = "todo-pro-activity-v1";
const FOCUS_KEY = "todo-pro-focus-time-v1";

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getProductivityData() {
  if (typeof window === "undefined") {
    return {
      currentStreak: 1,
      bestStreak: 1,
      lastActiveDate: getTodayKey(),
      totalCompleted: 0,
      todayCompleted: 0,
      focusMinutes: 0,
    };
  }

  try {
    const rawStreak = localStorage.getItem(STREAK_KEY);
    const streakData = rawStreak
      ? JSON.parse(rawStreak)
      : {
          currentStreak: 1,
          bestStreak: 1,
          lastActiveDate: getTodayKey(),
          totalCompleted: 0,
        };

    const rawActivity = localStorage.getItem(ACTIVITY_KEY);
    const activityMap = rawActivity ? JSON.parse(rawActivity) : {};
    const todayCount = activityMap[getTodayKey()] || 0;

    const rawFocus = localStorage.getItem(FOCUS_KEY);
    const focusMinutes = rawFocus ? parseInt(rawFocus, 10) : 0;

    return {
      currentStreak: streakData.currentStreak || 1,
      bestStreak: streakData.bestStreak || 1,
      lastActiveDate: streakData.lastActiveDate,
      totalCompleted: streakData.totalCompleted || 0,
      todayCompleted: todayCount,
      focusMinutes,
    };
  } catch {
    return {
      currentStreak: 1,
      bestStreak: 1,
      lastActiveDate: getTodayKey(),
      totalCompleted: 0,
      todayCompleted: 0,
      focusMinutes: 0,
    };
  }
}

export function recordTaskCompletion() {
  if (typeof window === "undefined") return;

  try {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    // 1. Update activity heatmap
    const rawActivity = localStorage.getItem(ACTIVITY_KEY);
    const activityMap = rawActivity ? JSON.parse(rawActivity) : {};
    activityMap[today] = (activityMap[today] || 0) + 1;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityMap));

    // 2. Update streak & total count
    const rawStreak = localStorage.getItem(STREAK_KEY);
    const streakData = rawStreak
      ? JSON.parse(rawStreak)
      : { currentStreak: 1, bestStreak: 1, lastActiveDate: null, totalCompleted: 0 };

    let nextStreak = streakData.currentStreak || 1;
    if (streakData.lastActiveDate === today) {
      // Already active today
    } else if (streakData.lastActiveDate === yesterday) {
      nextStreak += 1;
    } else {
      nextStreak = 1;
    }

    const nextBest = Math.max(streakData.bestStreak || 1, nextStreak);
    const updatedData = {
      currentStreak: nextStreak,
      bestStreak: nextBest,
      lastActiveDate: today,
      totalCompleted: (streakData.totalCompleted || 0) + 1,
    };

    localStorage.setItem(STREAK_KEY, JSON.stringify(updatedData));
    window.dispatchEvent(new Event("todo-pro-stats-updated"));
  } catch {
    // Ignore storage issues
  }
}

export function recordFocusMinutes(minutes) {
  if (typeof window === "undefined") return;

  try {
    const rawFocus = localStorage.getItem(FOCUS_KEY);
    const current = rawFocus ? parseInt(rawFocus, 10) : 0;
    const nextTotal = current + minutes;
    localStorage.setItem(FOCUS_KEY, String(nextTotal));

    // Also mark active today
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const rawStreak = localStorage.getItem(STREAK_KEY);
    const streakData = rawStreak
      ? JSON.parse(rawStreak)
      : { currentStreak: 1, bestStreak: 1, lastActiveDate: null, totalCompleted: 0 };

    let nextStreak = streakData.currentStreak || 1;
    if (streakData.lastActiveDate !== today) {
      if (streakData.lastActiveDate === yesterday) {
        nextStreak += 1;
      } else {
        nextStreak = 1;
      }
    }
    const nextBest = Math.max(streakData.bestStreak || 1, nextStreak);
    localStorage.setItem(
      STREAK_KEY,
      JSON.stringify({
        ...streakData,
        currentStreak: nextStreak,
        bestStreak: nextBest,
        lastActiveDate: today,
      })
    );

    window.dispatchEvent(new Event("todo-pro-stats-updated"));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Returns 12 weeks (84 days) of activity for the GitHub-style heatmap.
 */
export function getActivityHeatmapData() {
  if (typeof window === "undefined") return [];

  try {
    const rawActivity = localStorage.getItem(ACTIVITY_KEY);
    const activityMap = rawActivity ? JSON.parse(rawActivity) : {};

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 84 days = 12 weeks
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      const count = activityMap[key] || 0;
      let level = 0;
      if (count >= 7) level = 4;
      else if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      days.push({
        date: key,
        count,
        level,
        dayOfWeek: d.getDay(), // 0 = Sun, 1 = Mon ...
        formatted: `${day}.${month}`,
      });
    }

    return days;
  } catch {
    return [];
  }
}

/**
 * Returns stats for Monday through Sunday of the current week.
 */
export function getWeeklyChartData() {
  if (typeof window === "undefined") {
    return [
      { day: "Пн", count: 0, isToday: false },
      { day: "Вт", count: 0, isToday: false },
      { day: "Ср", count: 0, isToday: false },
      { day: "Чт", count: 0, isToday: false },
      { day: "Пт", count: 0, isToday: false },
      { day: "Сб", count: 0, isToday: false },
      { day: "Нд", count: 0, isToday: false },
    ];
  }

  try {
    const rawActivity = localStorage.getItem(ACTIVITY_KEY);
    const activityMap = rawActivity ? JSON.parse(rawActivity) : {};

    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
    // Calculate Monday of current week
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + mondayOffset);

    const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    const chart = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      chart.push({
        day: dayLabels[i],
        count: activityMap[key] || 0,
        isToday: d.toDateString() === now.toDateString(),
        date: `${day}.${month}`,
      });
    }

    return chart;
  } catch {
    return [];
  }
}

export const ACHIEVEMENTS = [
  {
    id: "first_task",
    title: "Перший крок",
    desc: "Виконано перше завдання в Todo Pro",
    icon: "🌱",
    check: (stats) => stats.totalCompleted >= 1,
  },
  {
    id: "streak_3",
    title: "У вогні",
    desc: "Утримуйте серію активності від 3 днів поспіль",
    icon: "🔥",
    check: (stats) => stats.currentStreak >= 3 || stats.bestStreak >= 3,
  },
  {
    id: "focus_zen",
    title: "Майстер фокусу",
    desc: "Проведено 25+ хвилин у Помодоро-таймері",
    icon: "🧘",
    check: (stats) => stats.focusMinutes >= 25,
  },
  {
    id: "sprinter",
    title: "Спринтер",
    desc: "Виконано 5 або більше завдань за один день",
    icon: "⚡",
    check: (stats) => stats.todayCompleted >= 5,
  },
  {
    id: "titan",
    title: "Титан продуктивності",
    desc: "Завершено понад 15 завдань загалом",
    icon: "🏆",
    check: (stats) => stats.totalCompleted >= 15,
  },
  {
    id: "clean_space",
    title: "Чистий простір",
    desc: "Всі завдання на сьогодні успішно закриті",
    icon: "✨",
    check: (stats, todayPendingCount) =>
      stats.todayCompleted >= 1 && todayPendingCount === 0,
  },
];
