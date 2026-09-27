/**
 * Progress of the daily dungeon, kept in localStorage.
 *
 * The daily puzzle is seeded with the day it was generated for, so its `seed`
 * is an ISO date and doubles as the day key: storing a solved seed is all it
 * takes to know that today is done *and* to count the streak.
 *
 * The API is deliberately fire-and-forget: storage can be unavailable (private
 * mode, blocked cookies), and then the dungeon is still playable, it just
 * forgets the progress.
 */

/** Solved daily seeds, i.e. ISO dates. */
const STORAGE_KEY = "daily-dungeon:completed";

/** Fired on `document` after a solved day has been recorded. */
export const PROGRESS_EVENT = "progress:change";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today as the backend seeds it: the date in UTC, matching `date.today()`. */
export function todaySeed(now: Date = new Date()): string {
    return now.toISOString().slice(0, 10);
}

export function hasCompleted(seed: string): boolean {
    return readSeeds().includes(seed);
}

/** Record a solved day. Idempotent, so revisiting a finished day is harmless. */
export function markCompleted(seed: string): void {
    const seeds = readSeeds();
    if (seeds.includes(seed)) return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...seeds, seed].sort()));
    } catch {
        return; // Nothing stored, so nothing changed — do not announce it.
    }

    document.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

/**
 * Number of consecutive days solved up to today.
 *
 * The chain may end yesterday as well: today's dungeon is still open, so a
 * streak only breaks once a whole day has gone by unplayed.
 */
export function currentStreak(today: string = todaySeed()): number {
    const seeds = new Set(readSeeds());
    let cursor = seeds.has(today) ? today : previousDay(today);

    let streak = 0;
    while (seeds.has(cursor)) {
        streak++;
        cursor = previousDay(cursor);
    }
    return streak;
}

function previousDay(iso: string): string {
    const day = new Date(`${iso}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() - 1);
    return day.toISOString().slice(0, 10);
}

/**
 * The rule above is mirrored by the boot script in `Streak.astro`, which cannot
 * import anything and has to run before the first frame — keep the two in step.
 */

function readSeeds(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        // Only dates can be days of the streak, so anything else is dropped
        // rather than trusted.
        return Array.isArray(parsed)
            ? parsed.filter(
                  (seed): seed is string =>
                      typeof seed === "string" && ISO_DATE.test(seed),
              )
            : [];
    } catch {
        return [];
    }
}
