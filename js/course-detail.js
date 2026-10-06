function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function checklistKey(courseId) {
  return `cs-curriculum-checklist:${courseId}`;
}

function loadChecklist(courseId) {
  try {
    return JSON.parse(localStorage.getItem(checklistKey(courseId)) || "{}");
  } catch (e) {
    return {};
  }
}

function saveChecklist(courseId, data) {
  try {
    localStorage.setItem(checklistKey(courseId), JSON.stringify(data));
  } catch (e) {}
}

async function init() {
  const { courses, clusters } = await DataStore.loadAll();
  const id = getParam("id");
  const course = DataStore.getCourseById(id);
  const root = document.getElementById("courseRoot");

  if (!course) {
    root.innerHTML = `
      <div class="empty-state">
        درسی با این شناسه پیدا نشد.
        <div style="margin-top:14px"><a href="all-courses.html" class="link-chip">بازگشت به فهرست دروس</a></div>
      </div>`;
    document.title = "درس پیدا نشد | چارت دروس علوم کامپیوتر دانشگاه فردوسی مشهد";
    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) robotsTag.setAttribute("content", "noindex, follow");
    return;
  }

  const pageTitle = `${course.titleFa}${course.titleEn ? " (" + course.titleEn + ")" : ""} | چارت دروس علوم کامپیوتر دانشگاه فردوسی مشهد`;
  const descSource =
    (course.goals && course.goals[0]) ||
    (course.syllabus && course.syllabus.slice(0, 3).join("، ")) ||
    course.note ||
    "";
  const pageDescription = truncateForMeta(
    `سرفصل، پیش‌نیاز، واحد و روش ارزیابی درس ${course.titleFa} | رشته‌ی علوم کامپیوتر، دانشگاه فردوسی مشهد. ${descSource}`
  );
  updateSEO({ title: pageTitle, description: pageDescription, path: `course.html?id=${encodeURIComponent(course.id)}` });

  injectJSONLD("ld-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: `${window.SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "فهرست دروس", item: `${window.SITE_URL}/all-courses.html` },
      { "@type": "ListItem", position: 3, name: course.titleFa, item: `${window.SITE_URL}/course.html?id=${encodeURIComponent(course.id)}` },
    ],
  });

  if (!course.stub) {
    injectJSONLD("ld-course", {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.titleFa,
      alternateName: course.titleEn || undefined,
      courseCode: course.code || undefined,
      description: pageDescription,
      inLanguage: "fa-IR",
      provider: {
        "@type": "CollegeOrUniversity",
        name: "دانشگاه فردوسی مشهد",
        sameAs: "https://www.um.ac.ir",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Onsite",
        courseWorkload: course.units && course.units.total ? `PT${course.units.total * 16}H` : undefined,
      },
    });
  }

  if (course.stub) {
    root.innerHTML = renderStub(course);
    return;
  }

  root.innerHTML = renderCourse(course, clusters, courses);
  bindChecklist(course);
  revealCascade(root);
}

function badgeClass(type) {
  return TYPE_BADGE_CLASS[type] || "type-required";
}

function renderStub(course) {
  return `
    <div class="breadcrumb">
      <a href="all-courses.html">فهرست دروس</a> <span>/</span> <span>${esc(fa(course.titleFa))}</span>
    </div>
    <div class="course-header reveal">
      <h1>${esc(fa(course.titleFa))}</h1>
      <div class="en-title">${esc(course.titleEn)}</div>
    </div>
    <div class="stub-notice">
      ⚠️ ${esc(course.note)}
    </div>`;
}

function renderCourse(course, clusters, allCourses) {
  const clusterChips = (course.clusters || [])
    .map((cid) => {
      const cl = clusters.find((c) => c.id === cid);
      if (!cl) return "";
      return `<a href="cluster.html?id=${encodeURIComponent(cid)}" class="link-chip" style="border-color:${esc(cl.color)}66;color:${esc(cl.color)}">
        <span class="cluster-dot" style="background:${esc(cl.color)}"></span>${esc(cl.nameFa)}
      </a>`;
    })
    .join("");

  const prereqChips = renderCourseLinks(course.prerequisites, allCourses, "ندارد");
  const coreqChips = renderCourseLinks(course.corequisites, allCourses, "ندارد");

  const dependents = allCourses.filter(
    (c) => (c.prerequisites || []).includes(course.id) || (c.corequisites || []).includes(course.id)
  );

  const siblings = allCourses.filter(
    (c) => c.id !== course.id && !c.stub && (c.clusters || []).some((cid) => (course.clusters || []).includes(cid))
  );

  const eval_ = course.evaluation || {};
  const evalRows = [
    { label: "ارزشیابی مستمر", val: eval_.continuousMax, color: "var(--cyan)" },
    { label: "میان‌ترم", val: eval_.midtermMax, color: "var(--accent)" },
    { label: "آزمون پایان‌ترم", val: eval_.finalMin, color: "var(--accent-2)" },
    { label: "پروژه", val: eval_.projectMax, color: "var(--green)" },
  ].filter((r) => r.val !== null && r.val !== undefined);

  const evalHTML = evalRows.length
    ? `<div class="eval-bars">
        ${evalRows
          .map(
            (r) => `
          <div class="eval-row">
            <div class="eval-label">${esc(r.label)}</div>
            <div class="eval-track"><div class="eval-fill" style="width:${Number(r.val) || 0}%;background:${esc(r.color)}"></div></div>
            <div class="eval-val">${esc(fa(r.val))}%</div>
          </div>`
          )
          .join("")}
        ${eval_.finalNote ? `<div class="section-note">توضیح: ${esc(eval_.finalNote)}${eval_.projectNote ? " · پروژه " + esc(eval_.projectNote) : ""}</div>` : ""}
      </div>`
    : `<div class="section-note mono">${esc(eval_.finalNote || "در اختیار مدرس")}</div>`;

  const syllabusHTML = (course.syllabus || [])
    .map(
      (item, idx) => `
      <li class="syllabus-item" data-idx="${idx}">
        <input type="checkbox" id="syl-${idx}" />
        <span>${esc(item)}</span>
      </li>`
    )
    .join("");

  const goalsHTML = (course.goals || []).map((g) => `<div class="goal-item"><span>${esc(g)}</span></div>`).join("");
  const compsHTML = (course.competencies || []).map((g) => `<div class="goal-item"><span>${esc(g)}</span></div>`).join("");

  const refsHTML = (course.references || []).length
    ? `<ul class="ref-list">${course.references.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>`
    : `<div class="section-note">منبعی برای این درس ثبت نشده است.</div>`;

  return `
    <div class="breadcrumb">
      <a href="all-courses.html">فهرست دروس</a> <span>/</span> <span>${esc(fa(course.titleFa))}</span>
    </div>

    <div class="course-header reveal">
      <div class="course-header-top">
        <div class="course-header-titles">
          <h1>${esc(fa(course.titleFa))}</h1>
          <div class="en-title">${esc(course.titleEn || "")}</div>
        </div>
        <div class="badge-row">
          <span class="badge ${badgeClass(course.type)}">${esc(course.type)}</span>
          <span class="badge ${course.hasExerciseSession ? "has-ex" : "no-ex"}">
            ${course.hasExerciseSession === true ? "✓ دارای حل تمرین" : course.hasExerciseSession === false ? "بدون حل تمرین" : "نامشخص"}
          </span>
          ${course.code ? `<span class="badge mono">#${esc(fa(course.code))}</span>` : ""}
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-box"><div class="k">UNITS (THEORY)</div><div class="v">${esc(fa(course.units.theory ?? "—"))}</div></div>
        <div class="detail-box"><div class="k">UNITS (PRACTICAL)</div><div class="v">${esc(fa(course.units.practical ?? "—"))}</div></div>
        <div class="detail-box"><div class="k">TOTAL UNITS</div><div class="v">${esc(fa(course.units.total ?? "—"))}</div></div>
        <div class="detail-box"><div class="k">TOTAL HOURS</div><div class="v">${esc(fa(course.hours.total ?? "—"))}</div></div>
      </div>

      ${clusterChips ? `<div style="margin-top:16px">${clusterChips}</div>` : ""}
    </div>

    <div class="card reveal">
      <h2>پیش‌نیازها و هم‌نیازها</h2>
      <div class="prereq-grid">
        <div class="prereq-block">
          <div class="prereq-block-title">پیش‌نیاز</div>
          <div class="prereq-block-body">${prereqChips}</div>
        </div>
        <div class="prereq-block">
          <div class="prereq-block-title">هم‌نیاز</div>
          <div class="prereq-block-body">${coreqChips}</div>
        </div>
        ${
          dependents.length
            ? `<div class="prereq-block prereq-block-wide">
                <div class="prereq-block-title">پیش‌نیاز/هم‌نیاز برای این دروس</div>
                <div class="prereq-block-body">${dependents.map((c) => `<a href="course.html?id=${encodeURIComponent(c.id)}" class="link-chip">${esc(fa(c.titleFa))}</a>`).join("")}</div>
              </div>`
            : ""
        }
      </div>
    </div>

    ${
      siblings.length
        ? `<div class="card reveal">
            <h2>دروس مرتبط در همین خوشه‌ی دانشی</h2>
            <div>${siblings
              .map((c) => `<a href="course.html?id=${encodeURIComponent(c.id)}" class="link-chip">${esc(fa(c.titleFa))}</a>`)
              .join("")}</div>
          </div>`
        : ""
    }

    <div class="two-col">
      <div>
        ${
          goalsHTML || compsHTML
            ? `<div class="card reveal">
                <h2>اهداف درس و شایستگی‌ها</h2>
                ${goalsHTML}
                ${compsHTML}
              </div>`
            : ""
        }

        <div class="card reveal">
          <h2>سرفصل‌های درس</h2>
          <ul class="syllabus-list" id="syllabusList">${syllabusHTML}</ul>
        </div>

        ${
          course.teachingMethods && course.teachingMethods.length
            ? `<div class="card reveal"><h2>روش یاددهی‌-یادگیری</h2>${course.teachingMethods.map((m) => `<div class="goal-item"><span>${esc(m)}</span></div>`).join("")}</div>`
            : ""
        }

        ${course.footnote ? `<div class="card reveal"><h2>یادداشت</h2><div class="section-note">${esc(course.footnote)}</div></div>` : ""}
      </div>

      <div>
        <div class="card reveal">
          <h2>روش ارزیابی</h2>
          ${evalHTML}
        </div>

        ${
          course.equipment
            ? `<div class="card reveal"><h2>تجهیزات موردنیاز</h2><div class="section-note">${esc(course.equipment)}</div></div>`
            : ""
        }

        <div class="card reveal">
          <h2>منابع و مراجع</h2>
          ${refsHTML}
        </div>
      </div>
    </div>
  `;
}

function renderCourseLinks(ids, allCourses, emptyLabel) {
  if (!ids || ids.length === 0) {
    return `<span class="prereq-empty">${emptyLabel}</span>`;
  }
  return ids
    .map((id) => {
      const c = allCourses.find((x) => x.id === id);
      if (!c) return `<span class="link-chip disabled">${esc(id)}</span>`;
      return `<a href="course.html?id=${encodeURIComponent(c.id)}" class="link-chip">${esc(fa(c.titleFa))}</a>`;
    })
    .join("");
}

function bindChecklist(course) {
  const saved = loadChecklist(course.id);
  const items = document.querySelectorAll("#syllabusList .syllabus-item");
  items.forEach((item) => {
    const idx = item.dataset.idx;
    const checkbox = item.querySelector("input");
    if (saved[idx]) {
      checkbox.checked = true;
      item.classList.add("checked");
    }
    item.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") checkbox.checked = !checkbox.checked;
      item.classList.toggle("checked", checkbox.checked);
      saved[idx] = checkbox.checked;
      saveChecklist(course.id, saved);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
