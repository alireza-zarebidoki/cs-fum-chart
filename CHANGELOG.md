# Changelog / تاریخچه‌ی تغییرات

قالب بر اساس [Keep a Changelog](https://keepachangelog.com/) است و نسخه‌ها از [Semantic Versioning](https://semver.org/) پیروی می‌کنند.
Format follows Keep a Changelog; versions follow Semantic Versioning.

## [Unreleased]

## [1.0.0] — 2026-10-06 (۱۴۰۵/۰۷/۱۴)

اولین انتشار عمومی روی GitHub / First public release.

### Added
- مستندات دوزبانه (فارسی/English): README، CONTRIBUTING، SECURITY، CODE_OF_CONDUCT، NOTICE
- LICENSE (MIT برای کد)، قالب‌های Issue/PR، GitHub Actions (`validate.yml`)
- `scripts/validate-data.js` برای بررسی داده‌ها، لینک‌ها و sitemap

### Fixed
- `404.html`: اسکریپت inline که CSP بلاک می‌کرد به `js/404.js` منتقل شد
- غلط تایپی «هوش مصنویی» ← «هوش مصنوعی» در فوتر همه‌ی صفحات

### Changed
- حذف `frame-ancestors` از متاتگ CSP (در `<meta>` بی‌اثر است)
- افزودن `text/javascript` به قوانین کش/فشرده‌سازی `.htaccess`؛ افزایش `?v=`

## پیش از انتشار عمومی / Pre-release history

<details>
<summary>v0.5 — منوی موبایل و اعداد / mobile menu & digits</summary>

- منوی همبرگری موبایل (زیر ۶۰۰px)؛ حذف سوییچ اعداد فارسی/لاتین (همیشه لاتین)

</details>

<details>
<summary>v0.4 — بازخورد روی گراف و فهرست / graph & list feedback</summary>

- گراف پیش‌نیاز پیش‌فرض فقط «دروس اصلی»؛ منوی «همه» یا «یک خوشه»
- صفحه‌ی اصلی خلاصه شد؛ فهرست کامل به `all-courses.html` رفت

</details>

<details>
<summary>v0.3 — سرفصل کامل همه‌ی دروس / full syllabus for all courses</summary>

- همه‌ی ۸۲ درس دارای سرفصل رسمی؛ `clusters.json` از `courses.json` مشتق شد

</details>

<details>
<summary>v0.2 — صفحات خوشه / cluster pages</summary>

- صفحه‌ی هر خوشه، دروس وابسته/هم‌خوشه، بهبود گراف و دسترس‌پذیری

</details>

[Unreleased]: https://github.com/alireza-zarebidoki/cs-fum-chart/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/alireza-zarebidoki/cs-fum-chart/releases/tag/v1.0.0
