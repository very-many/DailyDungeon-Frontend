/**
 * Dark-mode theme manager.
 *
 * - "light" / "dark": stored explicitly in localStorage.
 * - "system": follow the OS `prefers-color-scheme` setting.
 */

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function readStoredTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    return "system";
}

function resolveTheme(theme: Theme): "light" | "dark" {
    if (theme === "system") {
        return prefersDark.matches ? "dark" : "light";
    }
    return theme;
}

function applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle(
        "dark",
        resolveTheme(theme) === "dark",
    );
}

/** The theme the user has chosen, or "system" when following the OS. */
export function getTheme(): Theme {
    return readStoredTheme();
}

/** Persist and apply a theme choice. */
export function setTheme(theme: Theme): void {
    if (theme === "system") {
        localStorage.removeItem(STORAGE_KEY);
    } else {
        localStorage.setItem(STORAGE_KEY, theme);
    }
    applyTheme(theme);
}

/** Apply the saved theme now and follow OS changes while in "system" mode. */
export function initTheme(): void {
    applyTheme(getTheme());

    prefersDark.addEventListener("change", () => {
        if (getTheme() === "system") {
            applyTheme("system");
        }
    });
}

initTheme();
