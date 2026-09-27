/**
 * Fills in the daily streak badge (`Streak.astro`) from localStorage.
 *
 * The badge ships the cold, zero state because the server cannot know about
 * local storage; this script swaps in the stored streak once its bundle runs
 * and again whenever a day is recorded while the page is open.
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
