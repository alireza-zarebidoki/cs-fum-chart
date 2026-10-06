#!/usr/bin/env node
/* =========================================================
   validate-data.js
   یکپارچگی داده‌ها و فایل‌های پروژه را بررسی می‌کند:

     node scripts/validate-data.js

   در صورت هر خطا با کد خروج ۱ تمام می‌شود (برای CI).

   Note: this script was written with the help of AI (Claude by Anthropic)
   and reviewed by the maintainer.
   این اسکریپت با کمک هوش مصنوعی (Claude از Anthropic) نوشته شده است.
   ========================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf-8");
const errors = [];
const err = (m) => errors.push(m);

// ---- JSON ----
const courses = JSON.parse(read("data/courses.json")).courses;
const clusters = JSON.parse(read("data/clusters.json")).clusters;
const plan = JSON.parse(read("data/semester-plan.json"));

const ids = new Set();
for (const c of courses) {
    if (!c.id) err("درسی بدون id وجود دارد");
    if (ids.has(c.id)) err(`id تکراری: ${c.id}`);
    ids.add(c.id);
}
const clusterIds = new Set(clusters.map((c) => c.id));

for (const c of courses) {
    for (const key of ["prerequisites", "corequisites"]) {
        for (const ref of c[key] || []) {
            if (!ids.has(ref)) err(`${c.id}: ${key} به id ناموجود «${ref}» اشاره می‌کند`);
            if (ref === c.id) err(`${c.id}: خودش را در ${key} دارد`);
        }
    }
    for (const cl of c.clusters || []) {
        if (!clusterIds.has(cl)) err(`${c.id}: خوشه‌ی ناموجود «${cl}»`);
    }
}

// ---- چرخه در پیش‌نیازها ----
const graph = new Map(courses.map((c) => [c.id, c.prerequisites || []]));
const state = new Map();
(function visitAll() {
    const visit = (n, stack) => {
        if (state.get(n) === 2) return;
        if (state.get(n) === 1) return err(`چرخه در پیش‌نیازها: ${[...stack, n].join(" → ")}`);
        state.set(n, 1);
        for (const p of graph.get(n) || []) if (graph.has(p)) visit(p, [...stack, n]);
        state.set(n, 2);
    };
    for (const n of graph.keys()) visit(n, []);
})();

// ---- چارت ترمی ----
const planRefs = [...JSON.stringify(plan).matchAll(/"id":\s*"([^"]+)"/g)].map((m) => m[1]);
for (const r of planRefs) if (!ids.has(r)) err(`semester-plan.json: id ناموجود «${r}»`);

// ---- sitemap همگام با داده‌ها ----
const expected = new Set([
    "/",
    "/all-courses.html",
    "/semester-plan.html",
    ...courses.filter((c) => !c.stub).map((c) => `/course.html?id=${encodeURIComponent(c.id)}`),
    ...clusters.map((c) => `/cluster.html?id=${encodeURIComponent(c.id)}`),
]);
const actual = new Set(
    [...read("sitemap.xml").matchAll(/<loc>https?:\/\/[^/]+(.*?)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"))
);
for (const u of expected) if (!actual.has(u)) err(`sitemap.xml ناقص است: ${u} (اجرا کنید: node scripts/generate-sitemap.js)`);
for (const u of actual) if (!expected.has(u)) err(`sitemap.xml آدرس اضافه دارد: ${u}`);

// ---- لینک‌های محلی در HTML ----
for (const f of fs.readdirSync(ROOT).filter((x) => x.endsWith(".html"))) {
    const html = read(f);
    for (const m of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
        const ref = m[1];
        if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
        if (!fs.existsSync(path.join(ROOT, ref))) err(`${f}: فایل ارجاع‌شده وجود ندارد: ${ref}`);
    }
    if (/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>/.test(html)) {
        err(`${f}: اسکریپت inline پیدا شد — با CSP (script-src 'self') بلاک می‌شود`);
    }
}

if (errors.length) {
    console.error(`❌ ${errors.length} مشکل پیدا شد:\n` + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
}
console.log(`✅ همه‌چیز درست است — ${courses.length} درس، ${clusters.length} خوشه، ${planRefs.length} ارجاع در چارت ترمی`);
