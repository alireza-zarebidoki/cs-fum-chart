function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

async function init() {
    const { courses, clusters } = await DataStore.loadAll();
    const id = getParam("id");
    const cluster = DataStore.getClusterById(id);
    const root = document.getElementById("clusterRoot");

    if (!cluster) {
        root.innerHTML = `
      <div class="empty-state">
        خوشه‌ی دانشی با این شناسه پیدا نشد.
        <div style="margin-top:14px"><a href="index.html#clusters" class="link-chip">بازگشت به خوشه‌های دانشی</a></div>
      </div>`;
        document.title = "خوشه‌ی دانشی پیدا نشد | چارت دروس علوم کامپیوتر دانشگاه فردوسی مشهد";
        const robotsTag = document.querySelector('meta[name="robots"]');
        if (robotsTag) robotsTag.setAttribute("content", "noindex, follow");
        return;
    }

    const detailedCourses = courses.filter((c) => (c.clusters || []).includes(id));

    const pageTitle = `خوشه‌ی ${cluster.nameFa} | چارت دروس علوم کامپیوتر دانشگاه فردوسی مشهد`;
    const pageDescription = truncateForMeta(
        `${cluster.description || ""} این خوشه شامل ${fa(detailedCourses.length)} درس از رشته‌ی علوم کامپیوتر دانشگاه فردوسی مشهد است.`
    );
    updateSEO({ title: pageTitle, description: pageDescription, path: `cluster.html?id=${encodeURIComponent(cluster.id)}` });

    injectJSONLD("ld-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: `${window.SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "خوشه‌های دانشی", item: `${window.SITE_URL}/#clusters` },
            { "@type": "ListItem", position: 3, name: cluster.nameFa, item: `${window.SITE_URL}/cluster.html?id=${encodeURIComponent(cluster.id)}` },
        ],
    });

    injectJSONLD("ld-itemlist", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `دروس خوشه‌ی ${cluster.nameFa}`,
        itemListElement: detailedCourses.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.titleFa,
            url: `${window.SITE_URL}/course.html?id=${encodeURIComponent(c.id)}`,
        })),
    });

    root.innerHTML = `
    <div class="breadcrumb">
      <a href="index.html#clusters">خوشه‌های دانشی</a> <span>/</span> <span>${esc(cluster.nameFa)}</span>
    </div>

    <div class="cluster-header reveal" style="--c:${esc(cluster.color)}">
      <h1 class="cluster-name-fa"><span class="cluster-dot"></span>${esc(cluster.nameFa)}</h1>
      <div class="cluster-name-en">${esc(cluster.nameEn)}</div>
      <p class="cluster-desc-full">${esc(cluster.description || "توضیحی برای این خوشه ثبت نشده است.")}</p>
      <div class="cluster-header-actions">
        <a href="all-courses.html#cluster=${encodeURIComponent(cluster.id)}" class="link-chip" style="border-color:${esc(cluster.color)}66;color:${esc(cluster.color)}">
          مشاهده در فهرست فیلترشده →
        </a>
      </div>
    </div>

    <div class="card reveal">
      <h2>دروس این خوشه (${esc(fa(detailedCourses.length))})</h2>
      ${detailedCourses.length
            ? `<ul class="cluster-course-list">
              ${detailedCourses
                .map(
                    (c) => `
                <li class="is-linked reveal" data-id="${esc(c.id)}">
                  <span class="pill-mini">${esc(fa(c.units.total ?? "?"))} unit</span>
                  <div class="course-title-en">${esc(c.titleEn || "")}</div>
                  <div class="course-title-fa">${esc(fa(c.titleFa))}</div>
                </li>`
                )
                .join("")}
            </ul>`
            : `<div class="section-note">هنوز درسی از این خوشه در پایگاه داده ثبت نشده است.</div>`
        }
    </div>
  `;

    revealCascade(root);
    root.querySelectorAll(".cluster-course-list li.is-linked").forEach((li) => {
        li.addEventListener("click", () => {
            window.location.href = `course.html?id=${li.dataset.id}`;
        });
    });
}

document.addEventListener("DOMContentLoaded", init);
