(function () {
    try {
        var path = window.location.pathname.replace(/^\//, "");
        var el = document.getElementById("brokenPath");
        if (el && path && path !== "404.html") {
            el.textContent = "/" + path;
        }
    } catch (e) { }
})();
