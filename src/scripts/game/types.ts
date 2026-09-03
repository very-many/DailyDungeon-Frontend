export interface Treasure {
  x: number;
  y: number;
}

export interface Monster extends Treasure {
  variant: number;
}

export interface Puzzle {
  seed: string;
  date: string;
  width: number;
  height: number;
  wall_counts: { rows: number[]; cols: number[] };
  treasures: Treasure[];
  monsters: Monster[];
  dead_ends: Treasure[];
  treasure_room_count: number;
  solution: number[][]; // 1 = wall, 0 = empty
  timestamp: string;
}

/** What can occupy a cell that is never a wall. */
export type CellOccupant = 'treasure' | Monster;

export interface PaintAction {
  type: 'wall' | 'mark';
  value: boolean;
}
