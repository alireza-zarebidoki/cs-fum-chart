(function () {
    const KEY = "cs-curriculum-theme";
    function apply(mode) {
        document.body.classList.toggle("light", mode === "light");
        const btn = document.getElementById("themeToggle");
        if (btn) btn.textContent = mode === "light" ? "🌙 حالت تاریک" : "☀️ حالت روشن";
    }
    function current() {
        try {
            return localStorage.getItem(KEY) || "dark";
        } catch (e) {
            return "dark";
        }
    }
    document.addEventListener("DOMContentLoaded", () => {
        const mode = current();
        apply(mode);
        const btn = document.getElementById("themeToggle");
        if (btn) {
            btn.addEventListener("click", () => {
                const next = document.body.classList.contains("light") ? "dark" : "light";
                try {
                    localStorage.setItem(KEY, next);
                } catch (e) { }
                apply(next);
            });
        }
    });
})();
