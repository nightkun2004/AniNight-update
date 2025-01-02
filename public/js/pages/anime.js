const BTN_MENU_TOGGLE = document.getElementById("menuButton");
const ASIDE_BAR = document.getElementById("aside");

BTN_MENU_TOGGLE?.addEventListener("click", () => {
    ASIDE_BAR.classList.toggle("-translate-x-full");
});