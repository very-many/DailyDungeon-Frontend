/**
 * Keeps the daily streak badge (`Streak.astro`) up to date from localStorage.
 *
 * The badge's boot script already puts the streak on screen during parsing, so
 * what this module adds is the live update when a day is finished while the page
 * is open — and a re-render on load, which covers a page where that inline
 * script did not run.
 */
import { currentStreak, PROGRESS_EVENT } from "./game/progress";

const badge = document.getElementById("streak");
const count = document.getElementById("streak-count");

if (badge && count) {
    const render = (): void => {
        const streak = currentStreak();
        // `data-streak` drives the look: 0 keeps the flame grey and frozen.
        badge.dataset.streak = String(streak);
        count.textContent = String(streak);
    };

    render();
    document.addEventListener(PROGRESS_EVENT, render);
}
