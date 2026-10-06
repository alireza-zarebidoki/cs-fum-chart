const TYPE_BADGE_CLASS = {
    "عمومی": "type-general",
    "پایه": "type-basic",
    "تخصصی الزامی": "type-required",
    "تخصصی اختیاری": "type-elective",
    "مهارتی – اشتغال‌پذیری": "type-skill",
};

function typeBadgeClass(type) {
    return TYPE_BADGE_CLASS[type] || "type-required";
}

function courseCardHTML(c, clusters) {
    const clusterDots = (c.clusters || [])
        .map((id) => {
            const cl = clusters.find((k) => k.id === id);
            return cl ? `<span class="cluster-tag" style="--c:${esc(cl.color)}" title="${esc(cl.nameFa)}"></span>` : "";
        })
        .join("");
    return `
    <div class="course-card reveal" data-id="${esc(c.id)}" tabindex="0" role="link" aria-label="${esc(c.titleFa)}">
      <div class="course-card-top">
        <div class="course-title-block">
          <div class="course-title-fa">${esc(fa(c.titleFa))}</div>
          <div class="course-title-en">${esc(c.titleEn || "")}</div>
        </div>
        <div class="course-code">${c.code ? "#" + esc(fa(c.code)) : ""}</div>
      </div>
      <div class="badge-row">
        <span class="badge ${typeBadgeClass(c.type)}">${esc(c.type)}</span>
        <span class="badge ${c.hasExerciseSession ? "has-ex" : "no-ex"}">
          ${c.hasExerciseSession === true ? "✓ حل تمرین" : c.hasExerciseSession === false ? "بدون حل تمرین" : "—"}
        </span>
      </div>
      <div class="course-meta-row">
        <div class="course-meta-stats">
          <span>${esc(fa(c.units.total ?? "?"))} unit</span>
          <span>${esc(fa(c.hours.total ?? "?"))}h</span>
        </div>
        <div class="cluster-tags">${clusterDots}</div>
      </div>
    </div>`;
}

function bindCourseCardClicks(grid) {
    grid.querySelectorAll(".course-card").forEach((card) => {
        const go = () => { window.location.href = `course.html?id=${card.dataset.id}`; };
        card.addEventListener("click", go);
        card.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    });
}

function getAncestorChain(id, allCourses) {
    const result = new Set();
    const visit = (cid) => {
        const c = allCourses.find((x) => x.id === cid);
        if (!c) return;
        [...(c.prerequisites || []), ...(c.corequisites || [])].forEach((pid) => {
            if (!result.has(pid)) {
                result.add(pid);
                visit(pid);
            }
        });
    };
    visit(id);
    return result;
}

function getDescendantChain(id, allCourses) {
    const result = new Set();
    const visit = (cid) => {
        allCourses.forEach((c) => {
            if ((c.prerequisites || []).includes(cid) || (c.corequisites || []).includes(cid)) {
                if (!result.has(c.id)) {
                    result.add(c.id);
                    visit(c.id);
                }
            }
        });
    };
    visit(id);
    return result;
}

function staggerDelay(i) {
    const FAST_STEPS = 10;
    const STEP = 70;
    const TAIL_STEP = 16;
    const MAX_DELAY = 1200;
    const delay = i < FAST_STEPS ? i * STEP : FAST_STEPS * STEP + (i - FAST_STEPS) * TAIL_STEP;
    return Math.min(delay, MAX_DELAY);
}

function revealCascade(root) {
    const scope = root || document;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scope.querySelectorAll(".reveal:not(.reveal-visible)").forEach((el) => el.classList.add("reveal-visible"));
        return;
    }

    const els = Array.from(scope.querySelectorAll(".reveal:not(.reveal-visible)"));
    if (els.length === 0) return;

    const scored = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, band: Math.round(r.top / 36) * 36, right: r.right };
    });
    scored.sort((a, b) => a.band - b.band || b.right - a.right);

    scored.forEach((item, i) => {
        item.el.style.animationDelay = `${staggerDelay(i)}ms`;
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            scored.forEach((item) => {
                item.el.classList.add("reveal-visible");
                item.el.addEventListener(
                    "animationend",
                    () => {
                        item.el.classList.remove("reveal", "reveal-visible");
                        item.el.style.animationDelay = "";
                    },
                    { once: true }
                );
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => revealCascade());
function emptyStateHTML(activeType) {
    if (activeType === "عمومی") {
        return `
      <div class="empty-state" style="grid-column: 1/-1">
        <div style="font-size:32px;margin-bottom:10px">😄</div>
        فکر کنم جای اشتباهی دنبالش می‌گردی!
        <div class="section-note" style="margin-top:8px; max-width:420px; margin-inline:auto">
          دروس عمومی (فارسی، معارف اسلامی، زبان خارجی، تربیت‌بدنی و…) توی سرفصل اختصاصی
          علوم کامپیوتر نیستن — این‌ها رو باید داخل سایت دانشکده‌ی مربوط به خودشون پیدا کنی 😉
        </div>
      </div>`;
    }
    return `
    <div class="empty-state" style="grid-column: 1/-1">
      <div style="font-size:32px;margin-bottom:10px">؟</div>
      هیچ درسی با این فیلترها یافت نشد.
      <div class="mono" style="margin-top:8px">try clearing a filter above</div>
    </div>`;
}
