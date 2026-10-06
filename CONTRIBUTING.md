**فارسی** · [English](#english)

<div dir="rtl">

# راهنمای مشارکت

ممنون که می‌خواهید به این پروژه کمک کنید! 🎓

## چه کمکی بیشتر به کار می‌آید؟

1. **اصلاح داده‌ها** (مهم‌ترین مورد): غلط‌های تایپی/OCR در سرفصل‌ها، پیش‌نیاز و هم‌نیاز اشتباه، واحد و ساعت نادرست — در `data/courses.json`
2. گزارش باگ و مشکلات نمایشی (موبایل، مرورگرهای مختلف، تم روشن/تاریک)
3. بهبود دسترس‌پذیری و کارایی

برای اصلاح داده، لطفاً **حتماً مرجع** (شماره‌ی صفحه‌ی `files/curriculum.pdf`) را در توضیح PR یا Issue بنویسید.

## راه‌اندازی محلی

نیازی به `npm install` یا build نیست.

```bash
git clone https://github.com/alireza-zarebidoki/cs-fum-chart.git
cd cs-fum-chart
python3 -m http.server 8000     # سپس http://localhost:8000
```

> مرورگر از `file://` اجازه‌ی `fetch` فایل‌های JSON را نمی‌دهد؛ حتماً از سرور محلی استفاده کنید.

## قبل از ارسال PR

```bash
node scripts/validate-data.js        # بررسی داده‌ها، لینک‌ها و sitemap
node scripts/generate-sitemap.js     # فقط اگر درس/خوشه اضافه یا حذف کردید
```

همین بررسی‌ها به‌صورت خودکار با GitHub Actions هم روی هر PR اجرا می‌شوند.

## قواعد کد

- **بدون فریم‌ورک و بدون build**: فقط HTML + CSS + Vanilla JS.
- **بدون اسکریپت inline**: CSP پروژه `script-src 'self'` است؛ هر کد جاوااسکریپت باید در `js/` باشد.
- هر متن آزادی که از JSON به `innerHTML` می‌دهید را با `esc(...)` (از `js/digits.js`) بپوشانید.
- متن درس‌ها فقط در `data/*.json` باشد، نه در HTML/JS.
- بعد از تغییر در `css/` یا `js/`، مقدار `?v=...` را در تگ‌های `<link>`/`<script>` فایل‌های HTML بالا ببرید؛ وگرنه مرورگرها نسخه‌ی کش‌شده را نشان می‌دهند.

## ارسال PR

1. مخزن را Fork کنید و یک شاخه‌ی جدید بسازید (`fix/calculus-prereq`، `feat/print-style` و …).
2. تغییرات را کوچک و متمرکز نگه دارید.
3. پیام کامیت کوتاه و روشن باشد (مثلاً `data: fix typo in discrete-math syllabus`).
4. PR را باز کنید و قالب آن را کامل کنید.

با مشارکت در این پروژه، [آیین‌نامه‌ی رفتار](CODE_OF_CONDUCT.md) را می‌پذیرید و قبول می‌کنید که کد شما تحت مجوز MIT منتشر شود. محتوای درسی تابع [NOTICE.md](NOTICE.md) است.

</div>

---

## English

# Contributing Guide

Thanks for wanting to help with this project! 🎓

## What help is most useful?

1. **Data corrections** (most important): typos/OCR errors in syllabi, wrong prerequisites/corequisites, wrong units and hours — in `data/courses.json`
2. Bug reports and display problems (mobile, different browsers, light/dark theme)
3. Accessibility and performance improvements

For data corrections, please **always include a reference** (the page number in `files/curriculum.pdf`) in your PR or issue description.

## Local setup

No `npm install` or build step is needed.

```bash
git clone https://github.com/alireza-zarebidoki/cs-fum-chart.git
cd cs-fum-chart
python3 -m http.server 8000     # then open http://localhost:8000
```

> Browsers don't allow `fetch` of JSON files from `file://`; always use a local server.

## Before sending a PR

```bash
node scripts/validate-data.js        # checks data, links and sitemap
node scripts/generate-sitemap.js     # only if you added or removed a course/cluster
```

The same checks also run automatically with GitHub Actions on every PR.

## Code rules

- **No framework, no build**: only HTML + CSS + Vanilla JS.
- **No inline scripts**: the project's CSP is `script-src 'self'`; all JavaScript must live in `js/`.
- Wrap any free text you put into `innerHTML` from JSON with `esc(...)` (from `js/digits.js`).
- Course text belongs only in `data/*.json`, not in HTML/JS.
- After changing anything in `css/` or `js/`, bump the `?v=...` value in the `<link>`/`<script>` tags of the HTML files; otherwise browsers will show the cached version.

## Sending a PR

1. Fork the repo and create a new branch (`fix/calculus-prereq`, `feat/print-style`, …).
2. Keep changes small and focused.
3. Keep commit messages short and clear (e.g. `data: fix typo in discrete-math syllabus`).
4. Open the PR and fill in its template.

By contributing, you accept the [Code of Conduct](CODE_OF_CONDUCT.md) and agree that your code is released under the MIT license. Curriculum content is governed by [NOTICE.md](NOTICE.md).
