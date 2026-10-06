document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("open");
        btn.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove("open");
            btn.classList.remove("open");
        }
    });

    menu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
            menu.classList.remove("open");
            btn.classList.remove("open");
        });
    });
});
