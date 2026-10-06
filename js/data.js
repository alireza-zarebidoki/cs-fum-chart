const DataStore = (() => {
    let coursesCache = null;
    let clustersCache = null;
    let metaCache = null;
    let planCache = null;

    async function loadAll() {
        if (coursesCache && clustersCache) {
            return { courses: coursesCache, clusters: clustersCache, meta: metaCache };
        }
        const base = getBasePath();
        const [coursesRes, clustersRes] = await Promise.all([
            fetch(`${base}data/courses.json`),
            fetch(`${base}data/clusters.json`),
        ]);
        const coursesJson = await coursesRes.json();
        const clustersJson = await clustersRes.json();

        coursesCache = coursesJson.courses;
        metaCache = coursesJson.meta;
        clustersCache = clustersJson.clusters;

        return { courses: coursesCache, clusters: clustersCache, meta: metaCache };
    }

    async function loadSemesterPlan() {
        if (planCache) return planCache;
        const base = getBasePath();
        const res = await fetch(`${base}data/semester-plan.json`);
        planCache = await res.json();
        return planCache;
    }

    function getBasePath() {
        return "./";
    }

    function getCourseById(id) {
        if (!coursesCache) return null;
        return coursesCache.find((c) => c.id === id) || null;
    }

    function getClusterById(id) {
        if (!clustersCache) return null;
        return clustersCache.find((c) => c.id === id) || null;
    }

    return { loadAll, loadSemesterPlan, getCourseById, getClusterById };
})();
