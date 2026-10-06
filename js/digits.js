window.fa = function (input) {
    if (input === null || input === undefined) return input;
    return String(input);
};

window.esc = function (input) {
    if (input === null || input === undefined) return "";
    return String(input).replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[ch]));
};
