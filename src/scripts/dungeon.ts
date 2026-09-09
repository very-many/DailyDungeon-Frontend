import { DungeonGame } from './game/DungeonGame';
import type { Puzzle } from './game/types';

// The puzzle is fetched server-side and inlined by Dungeon.astro. If the
// backend was unreachable, the server already rendered an error message.
const root: HTMLElement = document.getElementById('dungeon')!;
const inlinePuzzle: string | undefined = root.dataset.puzzle;
if (inlinePuzzle) {
  const game = new DungeonGame('dungeon', 'dungeon-status');
  game.loadPuzzle(JSON.parse(inlinePuzzle) as Puzzle);
}
