#!/usr/bin/env node
/* =========================================================
   generate-sitemap.js
   sitemap.xml را از روی data/courses.json و data/clusters.json
   می‌سازد:

     node scripts/generate-sitemap.js

   ========================================================= */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://chart.csfum.ir"; //اگر دامنه عوض شد
const ROOT = path.join(__dirname, "..");

const courses = JSON.parse(fs.readFileSync(path.join(ROOT, "data/courses.json"), "utf-8")).courses;
const clusters = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clusters.json"), "utf-8")).clusters;

const today = new Date().toISOString().slice(0, 10);

const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "monthly" },
    { loc: "/all-courses.html", priority: "0.9", changefreq: "monthly" },
    { loc: "/semester-plan.html", priority: "0.9", changefreq: "monthly" },
];

const courseUrls = courses
    .filter((c) => !c.stub)
    .map((c) => ({ loc: `/course.html?id=${encodeURIComponent(c.id)}`, priority: "0.7", changefreq: "yearly" }));

const clusterUrls = clusters.map((cl) => ({
    loc: `/cluster.html?id=${encodeURIComponent(cl.id)}`,
    priority: "0.6",
    changefreq: "yearly",
}));

const all = [...staticPages, ...courseUrls, ...clusterUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
        .map(
            (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
        )
        .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf-8");
console.log(`sitemap.xml نوشته شد — ${all.length} URL (${courseUrls.length} درس، ${clusterUrls.length} خوشه، ${staticPages.length} صفحه‌ی ثابت)`);
