# ▶️ چطور پروژه رو روی سیستم خودت ران کنی

این راهنمای سریع هست برای اینکه پروژه‌ی Kanban frontend رو روی سیستم خودت اجرا کنی و تم‌های Alucard و Dracula رو ببینی.

---

## ۱) پیش‌نیازها

به یکی از این‌ها نیاز داری:

| گزینه | نسخه | نصب |
|-------|------|-----|
| [Node.js](https://nodejs.org/) | ۲۰ یا بالاتر | پیشنهاد شه |
| [Bun](https://bun.sh/) | ۱.۱ یا بالاتر | سریع‌تر (پیشنهاد من) |
| [pnpm](https://pnpm.io/) / npm | هر نسخه‌ی پایدار | اوکی هست |

---

## ۲) extract و install

```bash
# ZIP رو extract کن
unzip kanban-frontend.zip
cd kanban-frontend

# پکیج‌ها رو نصب کن (یکی از این سه تا)
bun install        # پیشنهادی
# یا
npm install
# یا
pnpm install
```

---

## ۳) env variable ها

```bash
# فایل env رو کپی کن
cp .env.example .env
```

محتویات `.env`:

```bash
# آدرس backend API (تویی مرحله‌ی bootstrap لازمش نداری برای دیدن UI)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> 💡 اگه فعلاً backend راه‌انداختی، همین پیش‌فرض رو بذار باشه. UI و theme toggle بدون backend هم کار می‌کنه.

---

## ۴) اجرای dev server

```bash
bun run dev
# یا
npm run dev
# یا
pnpm dev
```

حالا مرورگر رو باز کن روی: **http://localhost:3000**

---

## ۵) چی ببینی؟

| URL | چی می‌بینی |
|-----|-----------|
| `/` | صفحه‌ی landing با توضیح پروژه + دکمه‌ی Sign in |
| `/dev/components` | **component showcase** — همه‌ی primitive ها در هر دو تم |
| `/login` | صفحه‌ی ورود با validation |
| `/boards` | صفحه‌ی محافظت‌شده (بدون cookie به /login ریدایرکت میشه) |
| `/workspace` | صفحه‌ی محافظت‌شده (همان بالا) |

### 🎨 تست theme toggle

۱. روی آیکون palette/sun/moon در گوشه‌ی بالا-راست کلیک کن
۲. بین **Alucard (light)** و **Dracula (dark)** سوییچ کن
۳. باید ببینی رنگ‌ها بدون reload عوض میشن

---

## ۶) تست middleware (route protection)

```bash
# این کار رو بکن: مرورگر رو باز کن روی
http://localhost:3000/boards

# باید خودش ریدایرکت کنه به:
http://localhost:3000/login?next=/boards
```

برای اینکه به `/boards` دسترسی پیدا کنی، باید یه cookie تستی ست کنی:

**در console مرورگر (DevTools → Application → Cookies):**
- اسم کوکی: `kanban.refresh-token`
- مقدار: `test-token`
- بعد reload کن

حالا `/boards` باز میشه (با skeleton placeholder چون backend وصل نیست).

---

## ۷) lint و build (اختیاری)

```bash
# چک کیفیت کد
bun run lint

# build production
bun run build

# اجرای production build
bun run start
```

---

## ۸) مشکل‌یابی

| مشکل | راه‌حل |
|------|--------|
| `Cannot find module` | `node_modules` رو پاک کن و دوباره install کن |
| پورت ۳۰۰۰ اشغاله | `PORT=3001 bun run dev` یا در `package.json` تغییر بده |
| Tailwind class ها کار نمی‌کنن | مطمئن شو `bun run dev` در حال اجراست، نه build استاتیک |
| Hydration warning در console | طبیعیه به‌خاطر next-themes، `suppressHydrationWarning` در `layout.tsx` ست شده |

---

## ۹) ساختار فولدر (یادآوری)

```
src/
  app/              ← route ها (page.tsx, login/, boards/, workspace/, dev/components/)
  components/
    ui/             ← shadcn primitives (Button, Card, …)
    layout/         ← AppShell, Sidebar, Header, ThemeToggle
    features/       ← auth, boards, kanban (barrel)
  lib/
    api/            ← client.ts, errors.ts, auth.ts, workspaces.ts, boards.ts, cards.ts
    auth/           ← context.tsx, storage.ts, config.ts
    validators/     ← Zod schema ها
  hooks/
  types/
  proxy.ts          ← middleware (auth guard)

README.md           ← داکیومنت کامل (تم‌ها، API، auth، convention)
RUN.md              ← همین فایل
.env.example
```

---

## ۱۰) قدم بعدی

وقتی backend تیم آماده شد:

۱. `NEXT_PUBLIC_API_URL` در `.env` رو به آدرس backend واقعی تغییر بده
۲. CORS در backend رو ست کن: `CORS_ORIGIN=http://localhost:3000`
۳. مسیرهای API در `src/lib/api/*.ts` رو با مسیرهای واقعی backend چک کن
۴. شروع کن به ساخت فیچر روی branch های جدا:
   - `feat/auth-pages` — register, forgot password
   - `feat/boards-dashboard` — داشبورد board ها
   - `feat/kanban-board` — drag-and-drop kanban

موفق باشی! 🚀
