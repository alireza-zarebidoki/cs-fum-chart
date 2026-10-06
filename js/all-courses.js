const state = {
    courses: [],
    clusters: [],
    activeCluster: "all",
    activeType: "all",
    hasExerciseOnly: false,
    query: "",
};

async function init() {
    const { courses, clusters, meta } = await DataStore.loadAll();
    state.courses = courses;
    state.clusters = clusters;

    updateSEO({
        description: truncateForMeta(
            `فهرست و سرفصل کامل ${fa(courses.length)} درس رشته‌ی علوم کامپیوتر دانشگاه فردوسی مشهد، شامل ${meta.unitDistribution.map((d) => d.type).join("، ")}.`
        ),
    });

    renderTypeOptions(meta);
    renderClusterOptions(clusters);
    applyHashParams();
    renderCourses();
    bindFilterEvents();
}

function renderCourseListJSONLD(list) {
    injectJSONLD("ld-itemlist", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "فهرست کامل دروس علوم کامپیوتر دانشگاه فردوسی مشهد",
        numberOfItems: list.length,
        itemListElement: list.slice(0, 100).map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.titleFa,
            url: `${window.SITE_URL}/course.html?id=${encodeURIComponent(c.id)}`,
        })),
    });
}

function applyHashParams() {
    const match = window.location.hash.match(/cluster=([\w-]+)/);
    if (!match) return;
    if (!state.clusters.some((c) => c.id === match[1])) return;
    state.activeCluster = match[1];
    document.getElementById("clusterSelect").value = match[1];
}

function renderTypeOptions(meta) {
    const select = document.getElementById("typeSelect");
    const types = meta.unitDistribution.map((d) => d.type);
    select.innerHTML =
        `<option value="all">همه انواع دروس</option>` +
        types.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

function renderClusterOptions(clusters) {
    const select = document.getElementById("clusterSelect");
    select.innerHTML =
        `<option value="all">همه خوشه‌ها</option>` +
        clusters.map((cl) => `<option value="${esc(cl.id)}">${esc(cl.nameFa)}</option>`).join("");
}

function bindFilterEvents() {
    document.getElementById("searchInput").addEventListener("input", (e) => {
        state.query = e.target.value.trim();
        renderCourses();
    });
    document.getElementById("typeSelect").addEventListener("change", (e) => {
        state.activeType = e.target.value;
        renderCourses();
    });
    document.getElementById("clusterSelect").addEventListener("change", (e) => {
        state.activeCluster = e.target.value;
        renderCourses();
    });
    document.getElementById("exerciseToggle").addEventListener("change", (e) => {
        state.hasExerciseOnly = e.target.checked;
        e.target.closest(".chip-toggle").classList.toggle("active", state.hasExerciseOnly);
        renderCourses();
    });
}

function renderCourses() {
    const grid = document.getElementById("courseGrid");
    const pillWrap = document.getElementById("activeFilters");

    let list = state.courses;

    if (state.activeCluster !== "all") {
        list = list.filter((c) => (c.clusters || []).includes(state.activeCluster));
    }
    if (state.activeType !== "all") {
        list = list.filter((c) => c.type === state.activeType);
    }
    if (state.hasExerciseOnly) {
        list = list.filter((c) => c.hasExerciseSession === true);
    }
    if (state.query) {
        const q = state.query.toLowerCase();
        list = list.filter(
            (c) =>
                c.titleFa.toLowerCase().includes(q) ||
                (c.titleEn || "").toLowerCase().includes(q) ||
                (c.syllabus || []).some((s) => s.toLowerCase().includes(q))
        );
    }

    const pills = [];
    if (state.activeCluster !== "all") {
        const cl = state.clusters.find((c) => c.id === state.activeCluster);
        pills.push(`<span class="active-filter-pill" data-clear="cluster">${esc(cl.nameFa)} ✕</span>`);
    }
    if (state.activeType !== "all") {
        pills.push(`<span class="active-filter-pill" data-clear="type">${esc(state.activeType)} ✕</span>`);
    }
    if (state.hasExerciseOnly) {
        pills.push(`<span class="active-filter-pill" data-clear="exercise">دارای حل تمرین ✕</span>`);
    }
    pillWrap.innerHTML = pills.join("");
    pillWrap.querySelectorAll(".active-filter-pill").forEach((p) => {
        p.addEventListener("click", () => {
            const clear = p.dataset.clear;
            if (clear === "cluster") {
                state.activeCluster = "all";
                document.getElementById("clusterSelect").value = "all";
            }
            if (clear === "type") {
                state.activeType = "all";
                document.getElementById("typeSelect").value = "all";
            }
            if (clear === "exercise") {
                state.hasExerciseOnly = false;
                const cb = document.getElementById("exerciseToggle");
                cb.checked = false;
                cb.closest(".chip-toggle").classList.remove("active");
            }
            renderCourses();
        });
    });

    document.getElementById("resultCount").textContent = `${fa(list.length)} درس`;
    renderCourseListJSONLD(list);

    if (list.length === 0) {
        grid.innerHTML = emptyStateHTML(state.activeType);
        return;
    }

    grid.innerHTML = list.map((c) => courseCardHTML(c, state.clusters)).join("");
    bindCourseCardClicks(grid);
    revealCascade(grid);
}

document.addEventListener("DOMContentLoaded", init);
