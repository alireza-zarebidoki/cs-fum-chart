window.SITE_URL = "https://chart.csfum.ir";

function updateSEO({ title, description, path }) {
    if (title) {
        document.title = title;
        const og = document.getElementById("ogTitle");
        if (og) og.setAttribute("content", title);
        const tw = document.querySelector('meta[name="twitter:title"]');
        if (tw) tw.setAttribute("content", title);
    }
    if (description) {
        const desc = document.getElementById("metaDescription") || document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute("content", description);
        const ogDesc = document.getElementById("ogDescription");
        if (ogDesc) ogDesc.setAttribute("content", description);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute("content", description);
    }
    if (path) {
        const url = `${window.SITE_URL}/${path}`;
        const canonical = document.getElementById("canonicalLink") || document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute("href", url);
        const ogUrl = document.getElementById("ogUrl");
        if (ogUrl) ogUrl.setAttribute("content", url);
    }
}

function injectJSONLD(id, data) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.id = id;
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

function truncateForMeta(text, max = 160) {
    if (!text) return "";
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max - 1).trimEnd() + "…";
}
