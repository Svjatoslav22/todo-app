/**
 * Smart Natural Language Parser for Ukrainian task input
 * Parses:
 * - Priorities: !терміновий, !високий, !середній, !низький, !p1, !p2, !p3, !p4
 * - Dates: сьогодні, завтра, післязавтра, в понеділок, у вівторок, о 15:00
 * - Tags: #дім, #робота, #навчання
 */

export function parseNaturalLanguageTask(input) {
  if (!input || typeof input !== "string") {
    return { cleanTitle: "", priority: "none", dueDate: null, tags: [] };
  }

  let text = input;
  let priority = "none";
  let dueDate = null;
  const tags = [];

  // 1. Parse Priority
  const priorityPatterns = [
    { regex: /!(терміновий|urgent|p1|критичний)/i, value: "urgent" },
    { regex: /!(високий|high|p2)/i, value: "high" },
    { regex: /!(середній|medium|p3)/i, value: "medium" },
    { regex: /!(низький|low|p4)/i, value: "low" },
    { regex: /!(звичайний|none)/i, value: "none" },
  ];

  for (const p of priorityPatterns) {
    if (p.regex.test(text)) {
      priority = p.value;
      text = text.replace(p.regex, "").trim();
      break;
    }
  }

  // 2. Parse Tags (#tag)
  const tagMatches = text.match(/#([\p{L}\w-]+)/gu);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      const cleanTag = t.replace("#", "").trim();
      if (cleanTag && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
    });
    text = text.replace(/#([\p{L}\w-]+)/gu, "").trim();
  }

  // 3. Parse Dates
  const now = new Date();

  // "сьогодні"
  if (/\bсьогодні\b/i.test(text)) {
    const d = new Date(now);
    d.setHours(20, 0, 0, 0);
    dueDate = d;
    text = text.replace(/\bсьогодні\b/i, "").trim();
  }
  // "післязавтра"
  else if (/\bпіслязавтра\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    d.setHours(20, 0, 0, 0);
    dueDate = d;
    text = text.replace(/\bпіслязавтра\b/i, "").trim();
  }
  // "завтра"
  else if (/\bзавтра\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    dueDate = d;
    text = text.replace(/\bзавтра\b/i, "").trim();
  }
  // "через N днів"
  const inDaysMatch = text.match(/\bчерез\s+(\d+)\s+дн(і|ів|я)\b/i);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(20, 0, 0, 0);
    dueDate = d;
    text = text.replace(inDaysMatch[0], "").trim();
  }

  // Parse time if present: "о 14:00" or "о 10" or "в 15:30"
  const timeMatch = text.match(/\b(?:о|в|at)\s+(\d{1,2})(?::(\d{2}))?\b/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      if (!dueDate) {
        dueDate = new Date(now);
      }
      dueDate.setHours(hours, minutes, 0, 0);
      text = text.replace(timeMatch[0], "").trim();
    }
  }

  // Clean remaining double spaces
  const cleanTitle = text.replace(/\s+/g, " ").trim();

  return {
    cleanTitle,
    priority,
    dueDate,
    tags,
  };
}
