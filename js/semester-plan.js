const planState = {
    courses: [],
    clusters: [],
    plan: null,
    focusedId: null,
};

async function init() {
    const [{ courses, clusters }, plan] = await Promise.all([
        DataStore.loadAll(),
        DataStore.loadSemesterPlan(),
    ]);
    planState.courses = courses;
    planState.clusters = clusters;
    planState.plan = plan;

    document.getElementById("planNote").textContent = plan.meta.note;
    renderLegend();
    renderPlan();
}

function renderLegend() {
    const legend = document.getElementById("termLegend");
    const items = [
        { cls: "type-basic", label: "پایه" },
        { cls: "type-required", label: "تخصصی الزامی" },
        { cls: "type-elective", label: "تخصصی اختیاری" },
        { cls: "type-skill", label: "مهارتی" },
        { cls: "type-general", label: "عمومی" },
    ];
    legend.innerHTML = items
        .map((it) => `<span class="badge ${it.cls}" style="font-size:12.5px">${it.label}</span>`)
        .join(" ");
}

function findItemCourse(item) {
    if (!item.id) return null;
    return planState.courses.find((c) => c.id === item.id) || null;
}

function itemCardHTML(item, term) {
    const course = findItemCourse(item);
    if (!course) {
        const label = item.note || item.placeholder;
        return `
      <div class="term-card term-card-placeholder reveal" data-placeholder="1">
        <div class="term-card-title">${esc(label)}</div>
      </div>`;
    }
    return `
    <div class="term-card reveal ${typeBadgeClass(course.type)}-bg" data-id="${esc(course.id)}" tabindex="0" role="link" aria-label="${esc(course.titleFa)}">
      <div class="term-card-title">${esc(fa(course.titleFa))}</div>
      <div class="term-card-en mono">${esc(course.titleEn || "")}</div>
      <div class="term-card-meta">
        <span class="badge ${typeBadgeClass(course.type)}">${esc(course.type)}</span>
        <span class="mono">${esc(fa(course.units.total ?? "?"))}w</span>
      </div>
    </div>`;
}

function renderPlan() {
    const root = document.getElementById("termPlanRoot");
    root.innerHTML = planState.plan.terms
        .map((t) => {
            const sortedItems = [...t.items].sort((a, b) => (a.id ? 0 : 1) - (b.id ? 0 : 1));
            return `
      <div class="term-row">
        <div class="term-row-label">
          <div class="term-num">ترم ${esc(fa(t.term))}</div>
        </div>
        <div class="term-row-items">
          ${sortedItems.map((it) => itemCardHTML(it, t.term)).join("")}
        </div>
      </div>`;
        })
        .join("");

    root.querySelectorAll(".term-card[data-id]").forEach((card) => {
        card.addEventListener("mouseenter", () => focusCourse(card.dataset.id));
        card.addEventListener("focus", () => focusCourse(card.dataset.id));
        card.addEventListener("mouseleave", clearFocusPlan);
        card.addEventListener("blur", clearFocusPlan);
        card.addEventListener("click", () => { window.location.href = `course.html?id=${card.dataset.id}`; });
        card.addEventListener("keydown", (e) => { if (e.key === "Enter") window.location.href = `course.html?id=${card.dataset.id}`; });
    });

    revealCascade(root);
}

function focusCourse(id) {
    clearFocusPlan();
    const ancestors = getAncestorChain(id, planState.courses);
    const descendants = getDescendantChain(id, planState.courses);
    document.querySelectorAll(`.term-card[data-id="${id}"]`).forEach((el) => el.classList.add("is-self"));
    document.querySelectorAll(".term-card[data-id]").forEach((el) => {
        if (ancestors.has(el.dataset.id)) el.classList.add("is-ancestor");
        if (descendants.has(el.dataset.id)) el.classList.add("is-descendant");
    });
    document.getElementById("termPlanRoot").classList.add("has-focus");
}

function clearFocusPlan() {
    document.querySelectorAll(".term-card.is-self, .term-card.is-ancestor, .term-card.is-descendant").forEach((el) => {
        el.classList.remove("is-self", "is-ancestor", "is-descendant");
    });
    document.getElementById("termPlanRoot").classList.remove("has-focus");
}

document.addEventListener("DOMContentLoaded", init);
