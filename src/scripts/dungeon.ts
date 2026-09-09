import { DungeonGame } from './game/DungeonGame';
import type { Puzzle } from './game/types';

type Tool = 'wall' | 'mark';

/** Class tokens for the active/inactive states of the mobile tool buttons. */
const TOOL_ACTIVE = ['border-cyan-400', 'bg-cyan-600', 'text-white'];
const TOOL_INACTIVE = ['border-slate-700', 'bg-slate-900', 'text-slate-300'];

// The puzzle is fetched server-side and inlined by Dungeon.astro. If the
// backend was unreachable, the server already rendered an error message.
const root: HTMLElement = document.getElementById('dungeon')!;
const inlinePuzzle: string | undefined = root.dataset.puzzle;
if (inlinePuzzle) {
  const game = new DungeonGame('dungeon', 'dungeon-status');
  game.loadPuzzle(JSON.parse(inlinePuzzle) as Puzzle);
  setupToolbar(game);
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
}
