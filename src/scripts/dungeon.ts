import { DungeonGame } from './game/DungeonGame';

const root: HTMLElement = document.getElementById('dungeon')!;
const puzzleUrl: string = root.dataset.puzzleUrl!;

const game = new DungeonGame('dungeon', 'dungeon-status');
void game.load(puzzleUrl);
