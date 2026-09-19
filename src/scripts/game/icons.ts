/**
 * Inline SVG markup for the dungeon board.
 *
 * These are plain strings because the grid is built with `document.createElement`.
 * The Tailwind classes are written out in full so the scanner picks them up.
 */

const SVG_BASE = [
    'xmlns="http://www.w3.org/2000/svg"',
    'fill="none"',
    'viewBox="0 0 24 24"',
    'stroke-width="1.5"',
    'stroke="currentColor"',
    'aria-hidden="true"',
].join(' ');

/** Fixed treasure cell (gem). */
export const TREASURE_ICON = `<svg ${SVG_BASE} class="size-4 text-gold sm:size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 4.5h10.5l3.75 5.25L12 19.5 3 9.75 6.75 4.5Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 4.5 7.5 9.75 12 19.5M15 4.5l1.5 5.25L12 19.5"/></svg>`;

/** "No wall here" marker placed by the player. */
export const MARK_ICON = `<svg ${SVG_BASE} class="size-4 text-tertiary sm:size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75 17.25 17.25M17.25 6.75 6.75 17.25"/></svg>`;
