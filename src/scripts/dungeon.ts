import { DUNGEON_WIN_EVENT, DungeonGame } from './game/DungeonGame';
import { hasCompleted, markCompleted } from './game/progress';
import type { Puzzle } from './game/types';

type Tool = 'wall' | 'mark';

/** Class tokens for the active/inactive states of the mobile tool buttons. */
const TOOL_ACTIVE = ['border-highlight', 'bg-highlight', 'text-background'];
const TOOL_INACTIVE = ['border-line', 'bg-elevated', 'text-tertiary'];

// The puzzle is fetched server-side and inlined by Dungeon.astro. If the
// backend was unreachable, the server already rendered an error message.
const root: HTMLElement | null = document.getElementById('dungeon');
const inlinePuzzle: string | undefined = root?.dataset.puzzle;
if (root && inlinePuzzle) {
  const puzzle: Puzzle = JSON.parse(inlinePuzzle) as Puzzle;
  const game = new DungeonGame('dungeon', 'dungeon-status');
  game.loadPuzzle(puzzle);
  setupToolbar(game);
  if (puzzle.date) setupDailyProgress(root, puzzle, game);
}

/**
 * The daily dungeon is the only request the backend dates (custom seeds come
 * back with `date: null`), which makes it the only one that keeps progress: a
 * finished day is stored, and a day that is already finished shows its solution
 * right away instead of an empty board.
 */
function setupDailyProgress(
  root: HTMLElement,
  puzzle: Puzzle,
  game: DungeonGame,
): void {
  if (hasCompleted(puzzle.seed)) {
    game.applySolution();
    return;
  }

  root.addEventListener(DUNGEON_WIN_EVENT, (): void =>
    markCompleted(puzzle.seed),
  );
}

/**
 * Wires up the wall/mark tool selector that is only shown on touch screens
 * (via the `pointer-coarse` variant in Dungeon.astro). Right-clicking is
 * impossible on touch, so the toolbar selects the tool there while mouse
 * input keeps its native left/right button mapping.
 */
function setupToolbar(game: DungeonGame): void {
  const toolbar = document.getElementById('dungeon-toolbar');
  if (!toolbar) return;

  const buttons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button[data-tool]'));
  if (buttons.length === 0) return;

  const setActive = (activeTool: Tool): void => {
    for (const button of buttons) {
      const isActive = button.dataset.tool === activeTool;
      for (const token of TOOL_ACTIVE) button.classList.toggle(token, isActive);
      for (const token of TOOL_INACTIVE) button.classList.toggle(token, !isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  };

  setActive('wall');

  for (const button of buttons) {
    button.addEventListener('click', (): void => {
      const tool: Tool = button.dataset.tool === 'mark' ? 'mark' : 'wall';
      game.setTool(tool);
      setActive(tool);
    });
  }

  // DungeonShell.astro renders the toolbar hidden so it can double as the
  // deferred island's placeholder without popping in. The board is on screen
  // and the buttons are wired up, so it can take part in the layout now.
  toolbar.classList.remove('invisible');
}
