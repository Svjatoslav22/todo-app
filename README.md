# ⚡ Todo Pro — Production-Grade Task Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)

> **Todo Pro** — це повнофункціональний, преміальний та високопродуктивний веб-додаток для керування завданнями та персональної продуктивності, створений за стандартами сучасних інструментів світового рівня (**Linear + Notion + Todoist**).

---

## 🌟 Чому це не просто звичайний CRUD (Ключові переваги)

### 🎨 Дизайн-система та візуальна естетика
- **Преміальний вигляд:** Glassmorphism, плавні анімації на базі `framer-motion`, гармонійна колірна палітра в стилі HSL.
- **Двомовний темний/світлий режим:** Підтримка системних налаштувань OS та збереження вибору в `localStorage`.
- **Жодних стандартних браузерних контролів:** Всі елементи (Select, Dropdown, Modal, DatePicker, Tooltip) створені з нуля для максимальної естетики.
- **Українська мова інтерфейсу:** 100% інтерфейсу, повідомлень про помилки та системних статусів виконано якісною українською мовою.

### 🧠 Розумні задачі та Natural Language Parser
- **Швидке створення природною мовою:** Парсинг пріоритетів (`!високий`), дат (`сьогодні`, `завтра`, `понеділок`) та тегів (`#робота`) безпосередньо з текстового рядка введення.
- **Підзадачі з прогресом:** Інтерактивний чеклист підзадач з анімованим індикатором виконання та святковим конфетті при завершенні.
- **Система пріоритетів P1–P5:** Колірні прапорці від термінового до низького.
- **Корзина та архів:** М'яке видалення (soft delete) з можливістю відновлення в один клік або через Undo-сповіщення (6 сек).
- **Масові дії (Batch Actions):** Плаваюча панель для вибору кількох завдань, групової зміни статусу, пріоритету або видалення.

### 📊 4 динамічні подання (Multi-View)
- **Список (List View):** З гнучким групуванням (за статусом, за пріоритетом, за дедлайнами або без групування).
- **Канбан-дошка (Kanban View):** Інтерактивні колонки з підтримкою **Drag & Drop** (`@dnd-kit/core`), миттєвим переміщенням між статусами та звуковим/візуальним відгуком.
- **Календар (Calendar View):** Місячна та тижнева сітка з бейджами дедлайнів та швидким створенням на обрану дату.
- **Таймлайн (Timeline View):** 14-денна горизонтальна вісь термінів із підсвічуванням прострочених завдань.

### 🔥 Продуктивність та мотивація
- **Командна палітра (`Ctrl+K` / `⌘K`):** Повноцінна навігація додатком, швидкі команди, зміна тем та пошук завдань виключно з клавіатури.
- **Гарячі клавіші (`?`):** Підтримка `N` (нова задача), `P` (помодоро), `D` (мій день), `1–4` (зміна подань), `/` (пошук), `Esc`.
- **Помодоро-таймер (`P`):** Анімоване кругове SVG-кільце зворотного відліку (25 / 5 / 15 хв), синтезований приємний дзвоник через **Web Audio API** (без сторонніх аудіофайлів) та прив'язка до поточної задачі.
- **«Мій день» (`D`):** Щоденний хаб мотивації — стрік активності (🔥 днів поспіль), круговий індикатор прогресу дня, графік за тиждень, 12-тижнева матриця активності (**GitHub-style Heatmap**) та 6 гейміфікованих бейджів досягнень.
- **Конфетті:** Салют частинок на базі `canvas-confetti` при закритті задач.

### 🛡️ Адмін-панель та безпека (RBAC)
- **Ролі користувачів:** Дворівневий доступ (`user` та `admin`). Сторінка `/admin` захищена на рівні бекенду та фронтенду (екран 403 Forbidden).
- **Аналітика платформи:** Загальна кількість користувачів, задач, відсоток виконання, активні користувачі за 24г та графік реєстрацій за останні 7 днів.
- **Керування акаунтами:** Пагінація, пошук, фільтрація, блокування/розблокування користувачів, зміна ролей.
- **Імперсонація (Login As):** Можливість адміністратора безпечно увійти під будь-яким акаунтом для тестування та підтримки.
- **Журнал аудиту (Audit Log):** Фіксація всіх критичних подій у системі (реєстрація, вхід, зміна ролі, блокування, імперсонація) з IP-адресами та часом.

### ✨ Google Gemini AI інтеграція
- **AI-декомпозиція:** Розбиття задачі на 3–5 логічних послідовних кроків українською мовою.
- **Оцінка часу виконання:** Реалістичний прорахунок тривалості з текстовим обґрунтуванням.
- **Визначення пріоритету:** Аналіз терміновості та важливості з порадою щодо пріоритету.
- **Автоматичні теги:** Підбір релевантних категорій.
- **Гібридний Fallback:** Якщо API-ключ Gemini відсутній або ліміти вичерпано, додаток миттєво використовує вбудовані інтелектуальні евристики без жодних збоїв чи помилок.

---

## 🏗️ Архітектура проєкту

```mermaid
graph TD
    Client["Client (Next.js 16 + React 19)"]
    Server["Server (Express.js + Node.js)"]
    DB[("Neon PostgreSQL Cloud")]
    Gemini["Google Gemini API (2.5 Flash)"]

    Client -->|"HTTP / REST API + Bearer Token"| Server
    Client -->|"Silent Token Refresh (httpOnly Cookie)"| Server
    Server -->|"Prisma ORM"| DB
    Server -->|"@google/genai SDK (with Heuristic Fallback)"| Gemini

    subgraph Client Application
        Router["App Router (/login, /register, /, /admin)"]
        UI["Custom Design System + Framer Motion"]
        State["TanStack React Query + LocalStorage"]
        Audio["Web Audio API Synthesizer"]
    end

    subgraph Server Application
        Security["Helmet + CORS + Rate Limiting"]
        Auth["JWT Rotation + RBAC (User / Admin)"]
        Controllers["Task, Admin, Auth Controllers"]
        Validation["Zod Validation Schemas"]
        Audit["System Audit Logger"]
    end
```

---

## 🔒 Автентифікація та життєвий цикл токенів

```mermaid
sequenceDiagram
    autonumber
    actor User as Користувач
    participant Client as Frontend (Next.js)
    participant Server as Backend (Express)
    participant DB as База даних (Prisma)

    User->>Client: Введення email та пароля
    Client->>Server: POST /api/auth/login
    Server->>DB: Пошук та перевірка хешу bcrypt
    Server-->>Client: 200 OK + accessToken (15 хв) + Set-Cookie: refreshToken (7 днів, httpOnly)
    Client->>Client: Збереження accessToken у пам'яті

    Note over Client,Server: Доступ до захищених ресурсів
    Client->>Server: GET /api/tasks (Header: Bearer accessToken)
    Server-->>Client: 200 OK (Список завдань)

    Note over Client,Server: Автоматичне оновлення токена при закінченні
    Client->>Server: GET /api/tasks (Expired accessToken)
    Server-->>Client: 401 Unauthorized
    Client->>Server: POST /api/auth/refresh (з httpOnly refreshToken)
    Server-->>Client: 200 OK + новий accessToken + ротований refreshToken
    Client->>Server: Повтор початкового запиту із новим токеном
```

---

## 🚀 Швидкий запуск локально за 3 кроки

### 1. Клонування репозиторію та встановлення залежностей
```bash
git clone https://github.com/Svjatoslav22/todo-app.git
cd todo-app
npm run install:all
```

### 2. Налаштування змінних оточення

Створіть файл `server/.env` за прикладом `server/.env.example`:
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Підключення до вашої PostgreSQL БД (наприклад Neon.tech)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# Секретні ключі для JWT токенів
JWT_SECRET=super_secret_jwt_access_token_key_for_todo_pro
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_for_todo_pro

# Google Gemini AI (опціонально, при відсутності працює інтелектуальний fallback)
GEMINI_API_KEY=your_gemini_api_key_here
```

Створіть файл `client/.env.local` за прикладом `client/.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Застосуйте схему до бази даних:
```bash
npm run db:push
```

### 3. Одночасний запуск клієнта і сервера
```bash
npm run dev
```

- **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
- **Backend API (Express):** [http://localhost:4000](http://localhost:4000)
- **Перевірка стану API:** [http://localhost:4000/health](http://localhost:4000/health)

---

## 📋 Документація API (REST Endpoints)

### 🔑 Автентифікація (`/api/auth`)
| Метод | Маршрут | Доступ | Опис |
|---|---|---|---|
| `POST` | `/api/auth/register` | Публічний | Реєстрація нового користувача |
| `POST` | `/api/auth/login` | Публічний | Вхід у систему, видача accessToken та refreshToken cookie |
| `POST` | `/api/auth/refresh` | Публічний | Безшумне оновлення пари токенів |
| `POST` | `/api/auth/logout` | Публічний | Очищення сесії та видалення cookie |
| `GET` | `/api/auth/me` | Авторизований | Отримання профілю поточного користувача |

### 📝 Завдання (`/api/tasks`)
| Метод | Маршрут | Доступ | Опис |
|---|---|---|---|
| `GET` | `/api/tasks` | Авторизований | Отримання списку завдань із фільтрами (`status`, `priority`, `search`, `isArchived`, `isDeleted`) |
| `POST` | `/api/tasks` | Авторизований | Створення нового завдання |
| `GET` | `/api/tasks/:id` | Авторизований | Деталі завдання із підзадачами та тегами |
| `PUT` | `/api/tasks/:id` | Авторизований | Оновлення параметрів завдання |
| `DELETE`| `/api/tasks/:id` | Авторизований | М'яке видалення в корзину / остаточне видалення |
| `POST` | `/api/tasks/:id/restore`| Авторизований | Відновлення завдання з корзини |
| `POST` | `/api/tasks/batch` | Авторизований | Масові операції над масивом `taskIds` |
| `POST` | `/api/tasks/reorder` | Авторизований | Транзакційне збереження порядку сортування (Drag & Drop) |
| `POST` | `/api/tasks/:id/subtasks/:subtaskId/toggle` | Авторизований | Перемикання виконання підзадачі |
| `POST` | `/api/tasks/ai-suggest` | Авторизований | Попередній AI аналіз та автозаповнення назви/опису |
| `POST` | `/api/tasks/:id/ai-assist` | Авторизований | AI декомпозиція, оцінка часу та підбір тегів для задачі |

### 🛡️ Адміністрування (`/api/admin`) — Тільки для ролі `admin`
| Метод | Маршрут | Доступ | Опис |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Тільки Admin | Загальна статистика системи та графік реєстрацій |
| `GET` | `/api/admin/users` | Тільки Admin | Пагінований список користувачів з фільтрами та пошуком |
| `PATCH`| `/api/admin/users/:id/role` | Тільки Admin | Зміна ролі користувача (`admin` / `user`) |
| `PATCH`| `/api/admin/users/:id/ban` | Тільки Admin | Блокування або розблокування облікового запису |
| `GET` | `/api/admin/users/:id/tasks`| Тільки Admin | Перегляд завдань користувача (read-only) |
| `POST` | `/api/admin/users/:id/impersonate`| Тільки Admin | Вхід під обраним користувачем (імітація сесії) |
| `GET` | `/api/admin/logs` | Тільки Admin | Перегляд системного журналу аудиту дій |

---

## ⌨️ Таблиця гарячих клавіш

| Клавіша | Дія |
|---|---|
| `Ctrl + K` або `⌘ + K` | Відкрити командну палітру дій |
| `N` | Швидке створення нового завдання |
| `P` | Запуск або відкриття Помодоро-таймера |
| `D` | Відкриття дашборду «Мій день» та статистики |
| `1` | Перемкнути на подання Списку (List) |
| `2` | Перемкнути на Канбан-дошку (Kanban) |
| `3` | Перемкнути на Календар (Calendar) |
| `4` | Перемкнути на Таймлайн (Timeline) |
| `/` | Швидкий фокус на полі пошуку |
| `?` | Довідка клавіатурних скорочень |
| `Esc` | Закрити активне модальне вікно / скинути вибір |

---

## 📦 Стек технологій та бібліотеки

- **Клієнт (Frontend):**
  - **Framework:** Next.js 16 (App Router, Turbopack)
  - **Core:** React 19 (Strict Mode, hooks, Server/Client components)
  - **Styling:** Tailwind CSS + кастомна дизайн-система змінних токенів
  - **Animations:** Framer Motion (плавні транзишени, переходи карток, модалок)
  - **Data Fetching:** TanStack React Query v5 (кешування, інвалідація, оптимістичні оновлення)
  - **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - **Effects:** `canvas-confetti` (салют перемог), Web Audio API (звуковий синтезатор)
  - **Icons:** `lucide-react`
- **Сервер (Backend):**
  - **Runtime:** Node.js (JavaScript CommonJS)
  - **Framework:** Express.js v5
  - **Database & ORM:** PostgreSQL (Neon Cloud Serverless) + Prisma ORM v6
  - **AI SDK:** `@google/genai` (Google Gemini 2.5 Flash)
  - **Validation:** Zod v4 (типізація вхідних тіл, параметрів та query)
  - **Security:** `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `bcryptjs`, `jsonwebtoken`
- **Інструменти розробки:**
  - `concurrently` (одночасний запуск клієнта і сервера)
  - ESLint v9 з конфігурацією Next.js Core Web Vitals
  - Conventional Commits для чистої історії розробки

---

## 🏆 Що робить цей проєкт особливим для портфоліо

1. **Повна продакшн-готовність:** Жодних спрощень чи заглушок. Працююча база даних, валідація, захист від атак, лімітування запитів та обробка помилок.
2. **Продуманий UX на рівні продуктів світового класу:** Реалізовані сценарії відновлення даних (Undo), збереження стану вкладок, миттєве реагування на дії користувача.
3. **Гібридний штучний інтелект:** Інтеграція найновіших моделей Google Gemini з безвідмовним алгоритмічним fallback-режимом.
4. **Повна реалізація RBAC:** Адміністративна консоль, контроль сесій, імперсонація та аудит.
5. **Чистий та оптимізований код:** 100% відповідність правилам лінтера React 19, швидкість збірки менше 1 секунди.

---

**Розроблено як еталонний full-stack продукт для портфоліо.** 🚀
