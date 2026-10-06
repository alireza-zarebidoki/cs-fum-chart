<div align="center">

🌐 [فارسی](README.md) · **English**

# 📚 Computer Science Curriculum Chart — Ferdowsi University of Mashhad

An interactive, fully **data-driven** website for browsing the approved
Bachelor's curriculum of Computer Science: syllabi, prerequisites and
corequisites, units and hours per course, a prerequisite graph, and a suggested
8-semester plan.

No framework, no build step, no backend — just **plain HTML + CSS + Vanilla JS**.

[![Validate](https://github.com/alireza-zarebidoki/cs-fum-chart/actions/workflows/validate.yml/badge.svg)](https://github.com/alireza-zarebidoki/cs-fum-chart/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
![No build](https://img.shields.io/badge/build-none-brightgreen)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow)

[🌐 Live site](https://chart.csfum.ir) ·
[Report a bug](../../issues) ·
[Request a feature](../../issues)

</div>

> The site itself is in Persian (RTL). This page is the English documentation of the repository.

---

## Contents

- [Features](#-features)
- [Project structure](#-project-structure)
- [Running locally](#-running-locally)
- [Deployment](#-deployment)
- [Working with the data](#-working-with-the-data)
- [Current data and extraction method](#-current-data-and-extraction-method)
- [Visual identity](#-visual-identity)
- [SEO](#-seo)
- [Security](#-security)
- [Known limitations](#-known-limitations)
- [Contributing](#-contributing)
- [Maintainers & Credits](#-maintainers--credits)
- [License](#-license)
- [Changelog](#-changelog)

---

## ✨ Features

- **82 complete courses**, each with goals, competencies, syllabus, teaching methods, evaluation method and references — as in the approved regulation.
- **Prerequisite/corequisite graph** in the style of `git log --graph`, highlighting the related chain on hover/focus, with selectable scope (core courses / all 82 courses / a single cluster).
- **Suggested 8-semester plan** for arranging courses.
- **8 knowledge clusters** (AI, machine learning, security, bioinformatics, …), each with its own page.
- **Full list with search and filters** (course type, cluster, exercise session).
- **Dark/light theme**, Persian font Vazirmatn + code font JetBrains Mono.
- **Fully static and dependency-free** — deployable on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, or shared Apache hosting).
- **Content-driven architecture**: no course text is hard-coded in HTML/JS; everything is read from `data/*.json`.

## 📁 Project structure

```
.
├── index.html               Home page (stats, clusters, featured courses, prerequisite graph)
├── all-courses.html         Full, filterable list of all 82 courses
├── semester-plan.html       Suggested 8-semester plan
├── course.html              Course detail template (?id= parameter)
├── cluster.html             Knowledge-cluster page template (?id= parameter)
├── 404.html                 404 error page
│
├── css/
│   └── style.css            All styles; dark mode by default + light mode
│
├── js/
│   ├── data.js               Data access layer (fetches the JSON files)
│   ├── shared.js              Shared code: course card, type colors, prerequisite/dependent chain tracing
│   ├── main.js                Home page logic: clusters, featured courses, prerequisite graph
│   ├── all-courses.js         Full-list logic: search, type/cluster/exercise filters
│   ├── semester-plan.js       Semester plan logic
│   ├── course-detail.js       Course page logic + syllabus checklist + dependent/related courses
│   ├── cluster-detail.js      Cluster page logic
│   ├── theme.js                Dark/light switch
│   ├── mobile-nav.js           Mobile hamburger menu
│   ├── 404.js                  Shows the broken path on the 404 page
│   ├── digits.js               Number display + safe escape helper for innerHTML
│   └── seo.js                  Dynamic metadata/JSON-LD for template-driven pages
│
├── data/
│   ├── courses.json          ⭐ Main source of course data (edit here)
│   ├── clusters.json         The 8 knowledge clusters
│   └── semester-plan.json    ⭐ Suggested 8-semester layout (edit here)
│
├── files/
│   └── curriculum.pdf        The original approved curriculum document (extraction source)
│
├── scripts/
│   ├── generate-sitemap.js   Generates sitemap.xml from data/*.json
│   └── validate-data.js      Validates data integrity, links and sitemap (for CI)
│
├── .github/                 Issue/PR templates and GitHub Actions
├── favicon.ico / favicon.svg / apple-touch-icon.png / og-image.png
├── robots.txt / sitemap.xml
└── README.md · README.en.md · LICENSE · NOTICE.md · CONTRIBUTING.md · CODE_OF_CONDUCT.md · SECURITY.md · CHANGELOG.md
```

> ℹ️ All files live in the **repository root** (there is no separate `site/` folder),
> so run the commands below from the project root.

## 🚀 Running locally

For security reasons (CORS), browsers don't allow `fetch` of JSON files from
`file://`, so the project must be served by a small local server. Any of these works:

```bash
# Python (preinstalled on most systems)
python3 -m http.server 8000
# then open: http://localhost:8000
```

```bash
# or Node.js
npx serve .
```

Or use the **Live Server** extension in VS Code (right-click `index.html` → Open with Live Server).

To validate data integrity (missing prerequisites, cycles, stale sitemap, broken links):

```bash
node scripts/validate-data.js
```


## 🗂 Working with the data

### Adding a new course

Add a new object to the `courses` array in `data/courses.json`:

| Key | Description |
| --- | --- |
| `id` | Unique Latin identifier, used in the URL (`course.html?id=...`) |
| `titleFa` / `titleEn` | Course name |
| `type` | One of: General, Basic, Required specialized, Elective specialized, Skills – employability (Persian values as in the existing data) |
| `hasExerciseSession` | `true` / `false` |
| `units` / `hours` | `{theory, practical, total}` |
| `prerequisites` / `corequisites` | Arrays of other course `id`s (auto-linked in the graph and detail pages) |
| `clusters` | Array of knowledge-cluster `id`s (from `clusters.json`) |
| `goals`, `competencies`, `syllabus`, `teachingMethods`, `references` | Arrays of strings |
| `evaluation` | `{continuousMax, midtermMax, finalMin, finalNote, projectMax, projectNote}` |
| `equipment` | String or `null` |
| `featured` | `true` to show on the home page (featured list) |
| `stub` | `true` for a course that is only needed as a prerequisite and has no full syllabus yet |

After saving the file and refreshing, the new course appears in the list, filters,
detail page and prerequisite graph — no HTML/JS changes needed.

### Adding/editing knowledge clusters

In `data/clusters.json`, each cluster has an `id`, `nameFa`, `nameEn` and `color`
(hex, for the color dot and card edge). Each cluster's course list and count are
derived automatically from `courses.json` — no manual list is needed.

### Editing the semester plan

Edit only `data/semester-plan.json` — no UI code changes are needed. Each item
either points to a real `id` from `courses.json` or is a `placeholder` such as
"General" or "Elective" for courses without a dedicated syllabus.

### Updating the sitemap

Every time you add a course or cluster:

```bash
node scripts/generate-sitemap.js
```

This regenerates `sitemap.xml` from `data/*.json` (no `npm install` needed — only
Node built-ins are used).

## 📊 Current data and extraction method

This version contains **all 82 courses that have a full syllabus in the regulation**:
6 basic courses, 27 required specialized courses, 4 skills–employability courses, and
all 45 unique elective courses across the 8 knowledge clusters + unclustered — each with
complete goals, competencies, syllabus, teaching methods, evaluation and references.

**Courses not included:** the 22 units of general courses (Persian, Islamic studies,
foreign language, physical education, etc.). The regulation has no dedicated syllabus for
them — they follow the nationwide general curriculum — so they were deliberately not fabricated.

Direct text extraction from the original PDF (`files/curriculum.pdf`) had a font bug for
its Persian sections (some letters were dropped mid-word, or look-alike letters were
swapped). To work around it, all 107 syllabus pages were processed with Persian OCR
(Tesseract) at 200 dpi, and the textual content (goals, syllabus, teaching methods)
was taken from OCR; numeric tables (units, hours, prerequisites) and English references
were taken from direct PDF extraction because it was more accurate there. The result was
checked against the official unit totals per category (basic = 20 units, required
specialized = 73 units / 1216 hours).

> **Known limitation:** despite these two cleanup passes, minor OCR typos may remain in
> some courses' syllabus/goals text (e.g. one wrong character in a rare math term). The
> core content and structure of each course are verified, but for an exact official
> reference, compare with the original PDF (`files/curriculum.pdf`).

## 🎨 Visual identity

- Persian font: **Vazirmatn** (from jsDelivr, pinned to `v33.003`) — Latin/code font: **JetBrains Mono** (Google Fonts).
- Default theme: dark, with a "code editor" idea — knowledge clusters are treated like the
  syntax-highlighting colors of an editor theme.
- Signature element: the prerequisite graph in `git log --graph` style — courses as nodes,
  prerequisites as edges, laid out by chain depth.
- Light mode is supported too (button at the top of the page).
- Accessibility: visible keyboard focus outline, `prefers-reduced-motion` support, full keyboard navigation.

## 🔍 SEO

The site is published on `chart.csfum.ir` (and in parallel on GitHub Pages);
`chart.csfum.ir` is treated as canonical so duplicate content between the two
addresses isn't a problem.

- **`robots.txt` / `sitemap.xml`**: in the project root. Don't edit `sitemap.xml` by hand — always
  regenerate it with `node scripts/generate-sitemap.js`.
- **`CNAME`**: connects the custom domain to GitHub Pages (the domain must also be set in
  GitHub's Settings → Pages).
- **Title/description/canonical/Open Graph**: static pages (`index.html`, `all-courses.html`,
  `semester-plan.html`) have these statically in `<head>`. Template-driven pages (`course.html`,
  `cluster.html`) have a static fallback that, after JavaScript runs (`js/seo.js` + `updateSEO()`
  in `course-detail.js`/`cluster-detail.js`), is replaced with the real title/description of that course or cluster.
- **JSON-LD (structured data)**: `WebSite` + `EducationalOccupationalProgram` on the home page,
  `Course` + `BreadcrumbList` on each course page, `ItemList` + `BreadcrumbList` on each cluster page,
  and `ItemList` on the full course list — all injected dynamically with `injectJSONLD()`.
- **`og-image.png`** (1200×630): link preview image for social networks.

> ⚠️ **Important limitation:** the main content of `course.html`, `cluster.html`,
> `semester-plan.html` and `all-courses.html` isn't in the raw HTML; it is built from
> `data/*.json` only after JavaScript runs. Google usually runs JavaScript but with a delay
> (second-pass rendering); many other crawlers don't fully run it. For faster, more reliable
> indexing — especially for ranking on individual course names — the best next step is
> **pre-rendering real HTML for each page at build time (Static Site Generation)**. That is a
> separate, larger architectural change.

## 🔒 Security

The site is fully static (no server/database/forms), so most classic web vulnerabilities
(SQL injection, CSRF, auth) are not applicable. Still, these defense-in-depth measures are in place:

- **`js/digits.js` → `esc()`**: before any free text (title, syllabus, notes, references, …) is
  put into `innerHTML`, it passes through this function so that `& < > " '` are shown as HTML
  entities. Since all data comes from `data/*.json`, edited directly by the maintainer, this
  layer is not protection against an outside attacker today — it is insurance for the day
  these JSON files are filled from a form, a multi-user CMS or an external source.
  **Note for future development:** wrap any new `innerHTML` rendering of free JSON text in
  `esc(...)` (see the `esc(fa(course.something))` pattern in the other `js/*.js` files).
- **Content-Security-Policy**: a CSP meta tag is added to the `<head>` of every page
  (`script-src 'self'`, etc.) so that even if an external/inline script is accidentally added
  one day, it doesn't run by default.
- The font is pinned to a specific version (`v33.003`) on `cdn.jsdelivr.net`, not `latest`.
  As another layer, you can self-host the font or lock the link with
  `integrity="sha384-..."` (Subresource Integrity).

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## ⚠️ Known limitations

- The syllabus checklist (ticking items) is stored in the browser's `localStorage`; it is not
  synced between devices.
- The prerequisite graph currently shows only courses defined in `courses.json` (not all 138
  units of the program).
- Template-driven pages are rendered client-side (see the [SEO](#-seo) section).

## 🤝 Contributing

Pull requests and issues are welcome, especially for:

- Fixing typos/OCR errors in course syllabus, goals or references (`data/courses.json`)
- Adding or fixing course prerequisites/corequisites
- Improving accessibility and performance

Full details are in [CONTRIBUTING.md](CONTRIBUTING.md). In short: test the project as described in
[Running locally](#-running-locally), run `node scripts/validate-data.js`, and if you added/removed a
course or cluster, also run `node scripts/generate-sitemap.js` and commit the fresh `sitemap.xml`.
Contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## 👥 Maintainers & Credits

- **Alireza ZareBidoki** — Lead Developer ([GitHub](https://github.com/alireza-zarebidoki) · [Website](https://alireza.zarebidoki.com))
- **Shaeya Khojandi** — Content Verification & Quality Assurance ([GitHub](https://github.com/Sha5ndI))



## 📄 License

- **Code** (HTML, CSS, JavaScript and scripts): [MIT License](LICENSE)
- **Curriculum content** (`data/` and `files/curriculum.pdf`): derived from an official document of Ferdowsi University of Mashhad and **owned by the university / Computer Science group**; the MIT license does not cover it. Details in [NOTICE.md](NOTICE.md).

This is an unofficial student initiative and is not officially affiliated with Ferdowsi University of Mashhad.

## 🕘 Changelog

The full list of changes per version is in [CHANGELOG.md](CHANGELOG.md).

---

<div align="center">

Built for Computer Science students at Ferdowsi University of Mashhad 🎓

</div>
