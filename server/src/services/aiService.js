const { GoogleGenAI } = require("@google/genai");
const env = require("../lib/env");

/**
 * Intelligent heuristics fallback when Gemini API key is absent or unreachable.
 * Never fails, always returns high-quality structured Ukrainian suggestions.
 */
function generateHeuristicAnalysis(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Subtasks heuristic
  let subtasks = [];
  if (text.includes("звіт") || text.includes("аналіз")) {
    subtasks = [
      { title: "Зібрати вхідні дані та метрики" },
      { title: "Сформувати структуру та ключові висновки" },
      { title: "Оформити графіки та візуалізацію" },
      { title: "Фінальна вичитка та узгодження з керівником" },
    ];
  } else if (text.includes("презентац") || text.includes("виступ") || text.includes("доповід")) {
    subtasks = [
      { title: "Скласти тезовий план та таймінг виступу" },
      { title: "Підготувати структуру слайдів та ключові тези" },
      { title: "Підібрати візуальні матеріали та графіку" },
      { title: "Провести тренувальну репетицію таймінгу" },
    ];
  } else if (text.includes("проєкт") || text.includes("розроб") || text.includes("код") || text.includes("api") || text.includes("фіча")) {
    subtasks = [
      { title: "Описати технічні вимоги та архітектуру" },
      { title: "Реалізувати базову функціональність" },
      { title: "Покрити тестами та перевірити крайові випадки" },
      { title: "Оформити pull request та провести код-рев'ю" },
    ];
  } else if (text.includes("купити") || text.includes("магазин") || text.includes("замовити") || text.includes("продукт")) {
    subtasks = [
      { title: "Скласти точний список покупок" },
      { title: "Перевірити наявність та ціни" },
      { title: "Оформити замовлення або відвідати магазин" },
    ];
  } else if (text.includes("зустріч") || text.includes("дзвінок") || text.includes("call") || text.includes("обговорення")) {
    subtasks = [
      { title: "Підготувати порядок денний (agenda)" },
      { title: "Провести зустріч та зафіксувати домовленості" },
      { title: "Надіслати підсумковий follow-up лист усім учасникам" },
    ];
  } else {
    subtasks = [
      { title: "Уточнити ціль та зібрати необхідні матеріали" },
      { title: "Виконати основний обсяг робіт" },
      { title: "Перевірити якість та завершити задачу" },
    ];
  }

  // 2. Priority heuristic
  let priority = "medium";
  let priorityReason = "Стандартний пріоритет для запланованої задачі";

  if (
    text.includes("термінов") ||
    text.includes("аварій") ||
    text.includes("критичн") ||
    text.includes("блокує") ||
    text.includes("asap") ||
    text.includes("сьогодні до")
  ) {
    priority = "urgent";
    priorityReason = "Виявлено маркери високої терміновості (терміново / ASAP / блокуючий фактор)";
  } else if (
    text.includes("важлив") ||
    text.includes("дедлайн") ||
    text.includes("звіт") ||
    text.includes("клієнт") ||
    text.includes("договір")
  ) {
    priority = "high";
    priorityReason = "Задача має високий бізнес-вплив або фіксований дедлайн";
  } else if (
    text.includes("ідея") ||
    text.includes("почитати") ||
    text.includes("переглянути") ||
    text.includes("колись") ||
    text.includes("хобі")
  ) {
    priority = "low";
    priorityReason = "Задача для розвитку або низької пріоритетності";
  }

  // 3. Time estimate heuristic
  let minutes = 45;
  let formatted = "45 хв";
  let reasoning = "Середня тривалість для стандартної задачі";

  if (text.includes("швидко") || text.includes("дзвінок") || text.includes("повідомлення") || text.includes("перевірити пошту")) {
    minutes = 20;
    formatted = "20 хв";
    reasoning = "Коротке завдання з мінімальними зусиллями";
  } else if (text.includes("звіт") || text.includes("презентац") || text.includes("дизайн") || text.includes("стаття")) {
    minutes = 120;
    formatted = "2 год";
    reasoning = "Потребує концентрації, збору матеріалів та оформлення";
  } else if (text.includes("проєкт") || text.includes("рефакторинг") || text.includes("міграція")) {
    minutes = 240;
    formatted = "4 год";
    reasoning = "Комплексне завдання, що містить кілька фаз реалізації";
  }

  // 4. Tags heuristic
  const tagsSet = new Set();
  if (text.includes("робот") || text.includes("проєкт") || text.includes("клієнт")) tagsSet.add("робота");
  if (text.includes("код") || text.includes("api") || text.includes("баг") || text.includes("розроб")) tagsSet.add("dev");
  if (text.includes("звіт") || text.includes("фінанс") || text.includes("рахунок")) tagsSet.add("фінанси");
  if (text.includes("зустріч") || text.includes("дзвінок") || text.includes("команда")) tagsSet.add("комунікація");
  if (text.includes("покупк") || text.includes("магазин") || text.includes("дім") || text.includes("сім'я")) tagsSet.add("особисте");
  if (text.includes("книг") || text.includes("курс") || text.includes("навчан")) tagsSet.add("навчання");

  if (tagsSet.size === 0) {
    tagsSet.add("фокус");
  }

  return {
    subtasks,
    estimate: { minutes, formatted, reasoning },
    priority,
    priorityReason,
    tags: Array.from(tagsSet),
    source: "heuristic",
  };
}

/**
 * Main AI Assistant function.
 * Uses Google Gemini API if GEMINI_API_KEY is available; seamlessly falls back to heuristics.
 */
async function analyzeTaskWithAI({ title, description = "" }) {
  if (!title || !title.trim()) {
    throw new Error("Назва завдання обов'язкова для аналізу");
  }

  // If no Gemini API key configured, use intelligent heuristics immediately
  if (!env.GEMINI_API_KEY) {
    return generateHeuristicAnalysis(title, description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const prompt = `
Ти — експертний персональний асистент із продуктивності (Todo Pro).
Проаналізуй задачу користувача та надай структуровану декомпозицію виключно українською мовою.

Назва задачі: "${title}"
Опис: "${description || "Немає"}"

Поверни валідний JSON-об'єкт строго за такою структурою:
{
  "subtasks": [
    { "title": "Чіткий перший крок українською" },
    { "title": "Другий крок" },
    { "title": "Третій крок" },
    { "title": "Четвертий крок" }
  ],
  "estimate": {
    "minutes": 45,
    "formatted": "45 хв",
    "reasoning": "Коротке обґрунтування оцінки часу"
  },
  "priority": "urgent" | "high" | "medium" | "low",
  "priorityReason": "Чому саме такий пріоритет (1 речення)",
  "tags": ["тег1", "тег2", "тег3"]
}

Правила:
- Кількість підзадач: від 3 до 5 конкретних дій, що починаються з дієслова (наприклад: "Зібрати...", "Написати...", "Перевірити...").
- Оцінка часу має бути реалістичною (від 15 до 480 хвилин).
- Пріоритет має відповідати важливості та терміновості.
- Теги: 2-4 лаконічні категорії в нижньому регістрі (наприклад: ["робота", "звіт"]).
- Відповідь повинна бути ТІЛЬКИ у форматі JSON без markdown-обгорток або зайвого тексту.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    // Clean potential markdown blocks
    const cleanedJson = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);

    return {
      subtasks: Array.isArray(parsed.subtasks)
        ? parsed.subtasks.map((s) => ({ title: String(s.title || s) }))
        : [],
      estimate: parsed.estimate || {
        minutes: 45,
        formatted: "45 хв",
        reasoning: "Оцінка Gemini AI",
      },
      priority: ["urgent", "high", "medium", "low"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      priorityReason: parsed.priorityReason || "Визначено штучним інтелектом",
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : ["ai"],
      source: "gemini",
    };
  } catch (err) {
    console.warn("Gemini API call failed or timed out. Using intelligent heuristic fallback:", err.message);
    return generateHeuristicAnalysis(title, description);
  }
}

module.exports = {
  analyzeTaskWithAI,
  generateHeuristicAnalysis,
};
