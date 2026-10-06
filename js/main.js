const state = {
    courses: [],
    clusters: [],
    activeCluster: null,
    graphScope: "core",
    focusedCourseId: null,
    showAncestors: true,
    showDescendants: false,
};

async function init() {
    const { courses, clusters, meta } = await DataStore.loadAll();
    state.courses = courses;
    state.clusters = clusters;

    renderStats(meta);
    renderClusters(clusters, courses);
    renderFeatured(courses, clusters);
    renderGraphScopeOptions(clusters);
    renderPrereqGraph();
    bindGraphScopeEvents();
    bindGraphFocusEvents();
    bindFullscreenButton();
    revealCascade();
}

/* ---------------- Hero stats ---------------- */
function renderStats(meta) {
    const row = document.getElementById("statRow");
    const total = { label: "کل واحدها", value: meta.totalUnits };
    const items = [total, ...meta.unitDistribution.map((d) => ({ label: d.type, value: d.units }))];
    row.innerHTML = items
        .map(
            (it) => `
      <div class="stat-card reveal">
        <div class="stat-num">${esc(fa(it.value))}</div>
        <div class="stat-label">${esc(it.label)}</div>
      </div>`
        )
        .join("");
}

/* ---------------- Cluster cards ---------------- */
function renderClusters(clusters, courses) {
    const grid = document.getElementById("clusterGrid");
    grid.innerHTML = clusters
        .map((cl) => {
            const count = courses.filter((c) => (c.clusters || []).includes(cl.id)).length;
            return `
      <div class="cluster-card reveal" data-cluster="${esc(cl.id)}" style="--c:${esc(cl.color)}" tabindex="0" role="link" aria-label="${esc(cl.nameFa)}">
        <div>
          <div class="cluster-name-fa"><span class="cluster-dot"></span>${esc(cl.nameFa)}</div>
          <div class="cluster-name-en">${esc(cl.nameEn)}</div>
        </div>
        <div class="cluster-desc-preview">${esc(cl.description || "")}</div>
        <div class="cluster-card-footer">
          <span class="cluster-count">${esc(fa(count))} درس</span>
        </div>
      </div>`;
        })
        .join("");

    grid.querySelectorAll(".cluster-card").forEach((card) => {
        const openPage = () => { window.location.href = `cluster.html?id=${card.dataset.cluster}`; };
        card.addEventListener("click", openPage);
        card.addEventListener("keydown", (e) => { if (e.key === "Enter") openPage(); });
    });
}

/* ---------------- Featured courses preview ---------------- */
function renderFeatured(courses, clusters) {
    const grid = document.getElementById("featuredGrid");
    const featured = courses.filter((c) => c.featured);
    grid.innerHTML = featured.map((c) => courseCardHTML(c, clusters)).join("");
    bindCourseCardClicks(grid);
    document.getElementById("totalCourseCount").textContent = courses.length;
}

/* ---------------- Prerequisite graph ---------------- */
function renderGraphScopeOptions(clusters) {
    const menu = document.getElementById("graphScopeMenu");
    const items = [
        { value: "core", label: "دروس اصلی (پایه + تخصصی الزامی + مهارتی)" },
        { value: "all", label: "همه‌ی 82 درس" },
        ...clusters.map((cl) => ({ value: `cluster:${cl.id}`, label: `فقط خوشه‌ی ${cl.nameFa}` })),
    ];
    menu.innerHTML = items
        .map(
            (it) => `<div class="custom-select-item ${it.value === state.graphScope ? "active" : ""}" data-value="${esc(it.value)}">${esc(it.label)}</div>`
        )
        .join("");
    const activeItem = items.find((it) => it.value === state.graphScope);
    document.getElementById("graphScopeLabel").textContent = activeItem ? activeItem.label : "دروس اصلی";

    menu.querySelectorAll(".custom-select-item").forEach((el) => {
        el.addEventListener("click", () => {
            state.graphScope = el.dataset.value;
            document.getElementById("graphScopeLabel").textContent = el.textContent;
            menu.querySelectorAll(".custom-select-item").forEach((x) => x.classList.remove("active"));
            el.classList.add("active");
            closeAllDropdowns();
            if (state.focusedCourseId && !coursesInScope().some((c) => c.id === state.focusedCourseId)) {
                state.focusedCourseId = null;
                document.getElementById("graphFocusInput").value = "";
            }
            renderPrereqGraph();
        });
    });
}

function closeAllDropdowns() {
    document.querySelectorAll(".custom-select-menu.open").forEach((m) => m.classList.remove("open"));
    document.querySelectorAll(".custom-select-btn.open").forEach((b) => b.classList.remove("open"));
}

function bindGraphScopeEvents() {
    const btn = document.getElementById("graphScopeBtn");
    const menu = document.getElementById("graphScopeMenu");
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !menu.classList.contains("open");
        closeAllDropdowns();
        if (willOpen) {
            menu.classList.add("open");
            btn.classList.add("open");
        }
    });
    document.addEventListener("click", (e) => {
        if (!document.getElementById("graphScopeCustom").contains(e.target)) {
            menu.classList.remove("open");
            btn.classList.remove("open");
        }
    });
}

function bindGraphFocusEvents() {
    const input = document.getElementById("graphFocusInput");
    const menu = document.getElementById("graphFocusMenu");

    function renderSuggestions(query) {
        const q = query.trim().toLowerCase();
        let matches = state.courses;
        if (q) {
            matches = state.courses.filter(
                (c) => c.titleFa.toLowerCase().includes(q) || (c.titleEn || "").toLowerCase().includes(q)
            );
        }

        if (matches.length === 0) {
            menu.innerHTML = `<div class="custom-select-empty">درسی یافت نشد</div>`;
        } else {
            menu.innerHTML = matches
                .map(
                    (c) => `<div class="custom-select-item" data-id="${esc(c.id)}">${esc(fa(c.titleFa))}<span class="en">${esc(c.titleEn || "")}</span></div>`
                )
                .join("");
            menu.querySelectorAll(".custom-select-item[data-id]").forEach((el) => {
                el.addEventListener("click", () => selectFocusCourse(el.dataset.id));
            });
        }
        menu.classList.add("open");
    }

    function selectFocusCourse(id) {
        const match = state.courses.find((c) => c.id === id);
        if (!match) return;
        input.value = match.titleFa;
        state.focusedCourseId = match.id;
        state.showAncestors = true;
        state.showDescendants = false;
        if (state.graphScope !== "all" && !coursesInScope().some((c) => c.id === match.id)) {
            state.graphScope = "all";
            document.getElementById("graphScopeLabel").textContent = "همه‌ی 82 درس";
        }
        closeAllDropdowns();
        renderPrereqGraph();
    }

    input.addEventListener("focus", () => renderSuggestions(input.value));
    input.addEventListener("input", () => {
        renderSuggestions(input.value);
        if (!input.value.trim() && state.focusedCourseId) {
            state.focusedCourseId = null;
            renderPrereqGraph();
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { menu.classList.remove("open"); input.blur(); }
    });
    document.addEventListener("click", (e) => {
        if (!document.getElementById("graphFocusCustom").contains(e.target)) {
            menu.classList.remove("open");
        }
    });
}

function clearGraphFocus() {
    state.focusedCourseId = null;
    const input = document.getElementById("graphFocusInput");
    if (input) input.value = "";
    renderPrereqGraph();
}

function bindFullscreenButton() {
    const btn = document.getElementById("graphFullscreenBtn");
    const container = document.getElementById("graphContainer");
    const isFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;
    btn.addEventListener("click", () => {
        if (isFullscreen()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
            const req = container.requestFullscreen || container.webkitRequestFullscreen;
            if (req) req.call(container);
        }
    });
}

function coursesInScope() {
    const all = state.courses;
    if (state.graphScope === "all") return all;
    if (state.graphScope.startsWith("cluster:")) {
        const cid = state.graphScope.split(":")[1];
        return all.filter((c) => (c.clusters || []).includes(cid));
    }
    return all.filter((c) => c.type !== "تخصصی اختیاری");
}

function renderPrereqGraph() {
    const wrap = document.getElementById("graphWrap");
    const scoped = coursesInScope();

    if (scoped.length === 0) {
        wrap.innerHTML = `<div class="empty-state">درسی در این محدوده پیدا نشد.</div>`;
        return;
    }

    const scopedIds = new Set(scoped.map((c) => c.id));
    const allCourses = state.courses;

    const depthCache = {};
    function depthOf(id, seen = new Set()) {
        if (depthCache[id] !== undefined) return depthCache[id];
        if (seen.has(id)) return 0;
        seen.add(id);
        const course = allCourses.find((c) => c.id === id);
        if (!course || !course.prerequisites || course.prerequisites.length === 0) {
            depthCache[id] = 0;
            return 0;
        }
        const d = 1 + Math.max(...course.prerequisites.map((p) => depthOf(p, seen)));
        depthCache[id] = d;
        return d;
    }

    const nodes = scoped.map((c) => ({ ...c, depth: depthOf(c.id) }));
    const byDepth = {};
    nodes.forEach((n) => {
        byDepth[n.depth] = byDepth[n.depth] || [];
        byDepth[n.depth].push(n);
    });
    const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b);
    const maxDepth = Math.max(...depths);

    const colWidth = 300;
    const rowHeight = 96;
    const nodeR = 8;
    const padX = 360, padY = 56;
    const maxRows = Math.max(...depths.map((d) => byDepth[d].length));
    const width = Math.max(760, depths.length * colWidth + padX * 2 - colWidth + 60);
    const height = maxRows * rowHeight + padY * 2 - rowHeight;

    const pos = {};
    depths.forEach((d) => {
        let rows = byDepth[d];
        if (d > 0) {
            rows = [...rows].sort((n1, n2) => {
                const avg = (n) => {
                    const ps = (n.prerequisites || []).map((p) => pos[p]?.y).filter((v) => v !== undefined);
                    return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 9999;
                };
                return avg(n1) - avg(n2);
            });
        }
        rows.forEach((n, rowIdx) => {
            pos[n.id] = {
                x: width - padX - (maxDepth - d) * colWidth,
                y: padY + rowIdx * rowHeight,
            };
        });
    });

    const edgeList = [];
    nodes.forEach((n) => {
        (n.prerequisites || []).forEach((pid) => {
            if (pos[pid] && scopedIds.has(pid)) edgeList.push({ from: pid, to: n.id, kind: "prereq" });
        });
        (n.corequisites || []).forEach((pid) => {
            if (pos[pid] && scopedIds.has(pid)) edgeList.push({ from: pid, to: n.id, kind: "coreq" });
        });
    });

    let edgesSVG = "";
    edgeList.forEach((e) => {
        const a = pos[e.from];
        const b = pos[e.to];
        const midX = (a.x + b.x) / 2;
        const stroke = e.kind === "prereq" ? "var(--accent)" : "var(--accent-2)";
        const dash = e.kind === "coreq" ? 'stroke-dasharray="5 4"' : "";
        edgesSVG += `<path class="graph-edge" data-from="${esc(e.from)}" data-to="${esc(e.to)}"
        d="M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}"
        fill="none" stroke="${stroke}" stroke-width="1.3" opacity="0.3" ${dash}
        marker-end="url(#arrow-${e.kind})" />`;
    });

    let nodesSVG = "";
    nodes.forEach((n) => {
        const p = pos[n.id];
        const clusterColor = (n.clusters && n.clusters[0] && state.clusters.find((c) => c.id === n.clusters[0])?.color) || "var(--accent)";
        nodesSVG += `
      <g class="graph-node" data-id="${esc(n.id)}" tabindex="0" role="link" aria-label="${esc(n.titleFa)}" transform="translate(${p.x},${p.y})">
        <circle r="${nodeR}" fill="${esc(clusterColor)}" stroke="var(--bg-card)" stroke-width="2.5"/>
        <text class="node-title node-halo" x="-16" y="-2" text-anchor="start" direction="rtl" font-size="13.5" font-family="Vazirmatn, sans-serif">${esc(fa(n.titleFa))}</text>
        <text class="node-title" x="-16" y="-2" text-anchor="start" direction="rtl" fill="var(--text)" font-size="13.5" font-family="Vazirmatn, sans-serif">${esc(fa(n.titleFa))}</text>
        <text class="node-sub-halo" x="-16" y="14" text-anchor="end" direction="ltr" font-size="9.5" font-family="JetBrains Mono, monospace">${esc(n.titleEn || "")}</text>
        <text x="-16" y="14" text-anchor="end" direction="ltr" fill="var(--text-dim)" font-size="9.5" font-family="JetBrains Mono, monospace">${esc(n.titleEn || "")}</text>
      </g>`;
    });

    wrap.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <marker id="arrow-prereq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" opacity="0.8"></path>
        </marker>
        <marker id="arrow-coreq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-2)" opacity="0.8"></path>
        </marker>
      </defs>
      ${edgesSVG}
      ${nodesSVG}
    </svg>
    <div class="graph-legend">
      <span><span class="legend-dot" style="background:var(--accent)"></span> پیش‌نیاز</span>
      <span><span class="legend-dot" style="background:var(--accent-2)"></span> هم‌نیاز</span>
      <span class="mono" style="color:var(--text-dim)">hover a node to trace its chain · click to open</span>
    </div>`;

    const svgEl = wrap.querySelector("svg");
    const nodeEls = wrap.querySelectorAll(".graph-node");

    function renderFocusPanel() {
        const panel = document.getElementById("graphFocusPanel");
        if (!state.focusedCourseId) {
            panel.style.display = "none";
            return;
        }
        const c = allCourses.find((x) => x.id === state.focusedCourseId);
        if (!c) { panel.style.display = "none"; return; }
        panel.style.display = "flex";
        panel.innerHTML = `
      <div class="gfp-title">${esc(fa(c.titleFa))}<span class="en">${esc(c.titleEn || "")}</span></div>
      <button class="gfp-toggle ${state.showAncestors ? "on" : ""}" id="gfpAncestors">زنجیره‌ی پیش‌نیاز/هم‌نیاز</button>
      <button class="gfp-toggle ${state.showDescendants ? "on" : ""}" id="gfpDescendants">دروس وابسته به این درس</button>
      <a href="course.html?id=${encodeURIComponent(c.id)}" class="gfp-toggle">مشاهده صفحه درس →</a>
      <span class="gfp-clear" id="gfpClear">✕ پاک کردن</span>
    `;
        document.getElementById("gfpAncestors").addEventListener("click", () => {
            state.showAncestors = !state.showAncestors;
            expandScopeIfNeeded();
            renderPrereqGraph();
        });
        document.getElementById("gfpDescendants").addEventListener("click", () => {
            state.showDescendants = !state.showDescendants;
            expandScopeIfNeeded();
            renderPrereqGraph();
        });
        document.getElementById("gfpClear").addEventListener("click", clearGraphFocus);
    }
    function expandScopeIfNeeded() {
        const needed = persistentHighlightIds();
        if (!needed) return;
        const scopedIds = new Set(coursesInScope().map((c) => c.id));
        const missing = [...needed].some((id) => !scopedIds.has(id));
        if (missing && state.graphScope !== "all") {
            state.graphScope = "all";
            const label = document.getElementById("graphScopeLabel");
            if (label) label.textContent = "همه‌ی 82 درس";
            document.querySelectorAll("#graphScopeMenu .custom-select-item").forEach((el) => {
                el.classList.toggle("active", el.dataset.value === "all");
            });
        }
    }
    renderFocusPanel();

    function persistentHighlightIds() {
        if (!state.focusedCourseId) return null;
        const ids = new Set([state.focusedCourseId]);
        if (state.showAncestors) getAncestorChain(state.focusedCourseId, allCourses).forEach((id) => ids.add(id));
        if (state.showDescendants) getDescendantChain(state.focusedCourseId, allCourses).forEach((id) => ids.add(id));
        return ids;
    }

    function applyHighlight(ids, focusId) {
        wrap.querySelectorAll(".is-focused, .is-neighbor").forEach((el) => el.classList.remove("is-focused", "is-neighbor"));
        wrap.querySelectorAll(".graph-edge.is-active").forEach((el) => el.classList.remove("is-active"));
        if (!ids) {
            wrap.classList.remove("has-focus");
            return;
        }
        wrap.classList.add("has-focus");
        nodeEls.forEach((g) => {
            if (g.dataset.id === focusId) g.classList.add("is-focused");
            else if (ids.has(g.dataset.id)) g.classList.add("is-neighbor");
        });
        svgEl.querySelectorAll(".graph-edge").forEach((edge) => {
            if (ids.has(edge.dataset.from) && ids.has(edge.dataset.to)) edge.classList.add("is-active");
        });
    }

    function showPersistent() {
        applyHighlight(persistentHighlightIds(), state.focusedCourseId);
    }

    showPersistent();

    function hoverFocus(id) {
        const neighborIds = new Set([id]);
        svgEl.querySelectorAll(`.graph-edge[data-from="${id}"], .graph-edge[data-to="${id}"]`).forEach((edge) => {
            neighborIds.add(edge.dataset.from);
            neighborIds.add(edge.dataset.to);
        });
        applyHighlight(neighborIds, id);
    }

    nodeEls.forEach((g) => {
        g.addEventListener("mouseenter", () => hoverFocus(g.dataset.id));
        g.addEventListener("focus", () => hoverFocus(g.dataset.id));
        g.addEventListener("mouseleave", showPersistent);
        g.addEventListener("blur", showPersistent);
        g.addEventListener("click", () => { window.location.href = `course.html?id=${g.dataset.id}`; });
        g.addEventListener("keydown", (e) => { if (e.key === "Enter") window.location.href = `course.html?id=${g.dataset.id}`; });
        g.style.cursor = "pointer";
    });
}

document.addEventListener("DOMContentLoaded", init);
