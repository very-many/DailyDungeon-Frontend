/**
 * Board metrics shared by the placeholder and the game itself.
 *
 * The cell sizes mirror `BASE_CELL` in `DungeonGame.ts` (`h-10 w-10` /
 * `sm:h-17 sm:w-17`) — keep them in sync when the board is resized.
 */

/** Cell footprint: `h-10 w-10`. */
export const CELL_PX = 40;
/** Cell footprint from the `sm` breakpoint on: `sm:h-17 sm:w-17`. */
export const CELL_PX_SM = 68;

/**
 * The chrome around the cells, i.e. everything that decides how tall the
 * finished board panel is:
 * border-2 on the grid + border-2 on the panel, the panel padding (p-4 /
 * sm:p-6), the gap-4 between grid and status, and the status' min-h-6.
 */
const GRID_BORDER_PX = 4;
const PANEL_BORDER_PX = 4;
const PANEL_PADDING_PX = 32;
const PANEL_PADDING_PX_SM = 48;
const GAP_PX = 16;
const STATUS_PX = 24;

/** Size the backend uses when a request does not ask for a specific one. */
export const DEFAULT_PUZZLE_SIZE: PuzzleSize = { width: 8, height: 8 };

export interface PuzzleSize {
    width: number;
    height: number;
}

/**
 * CSS custom properties describing the exact size of the board panel for a
 * puzzle of the given size, so a placeholder can reserve it and the layout
 * does not shift when the grid replaces it.
 *
 * Both dimensions count one extra row/column for the wall counts, matching
 * `renderGrid` in `DungeonGame.ts` (`repeat(puzzle.width + 1, auto)`).
 */
export function boardVars({ width, height }: PuzzleSize): string {
    const rows = height + 1;
    const columns = width + 1;

    const base =
        rows * CELL_PX + GRID_BORDER_PX + PANEL_BORDER_PX + PANEL_PADDING_PX + GAP_PX + STATUS_PX;
    const fromSm =
        rows * CELL_PX_SM +
        GRID_BORDER_PX +
        PANEL_BORDER_PX +
        PANEL_PADDING_PX_SM +
        GAP_PX +
        STATUS_PX;

    // Only the `sm` width needs a value: below `sm` the panel is `w-full`, and
    // from `sm` on it shrink-wraps to the grid, so a placeholder with less
    // content than the board would otherwise collapse to its text width.
    const widthFromSm =
        columns * CELL_PX_SM + GRID_BORDER_PX + PANEL_BORDER_PX + PANEL_PADDING_PX_SM;

    return [
        `--board-h: ${base}px`,
        `--board-h-sm: ${fromSm}px`,
        `--board-w-sm: ${widthFromSm}px`,
    ].join('; ');
}
