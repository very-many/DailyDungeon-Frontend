import type { CellOccupant, PaintAction, Puzzle } from './types';

/**
 * Tailwind class tokens are kept as literal strings so Tailwind's scanner
 * picks them up. Cell appearance is composed by joining a shared base with a
 * state-specific suffix.
 */
const BASE_CELL = [
  'flex',
  'h-10',
  'w-10',
  'items-center',
  'justify-center',
  'select-none',
  'border',
  'border-slate-700/60',
  'text-sm',
  'sm:h-17',
  'sm:w-17',
  'sm:text-base',
].join(' ');

const CORNER_CELL = `${BASE_CELL} cursor-default bg-slate-800`;
const HEADER_CELL = `${BASE_CELL} cursor-default bg-slate-800 font-bold text-cyan-200`;
const OCCUPIED_CELL = `${BASE_CELL} cursor-default bg-amber-50`;
const EMPTY_CELL = `${BASE_CELL} cursor-pointer bg-amber-50 hover:bg-amber-100`;
const WALL_CELL = `${BASE_CELL} cursor-pointer bg-slate-900`;

const STATUS_IDLE = 'font-primary min-h-6 text-center text-sm text-slate-400';
const STATUS_WON = 'font-primary min-h-6 text-center text-sm text-emerald-400';
const STATUS_ERROR = 'font-primary min-h-6 text-center text-sm text-red-400';

/** States for the row/column count labels. */
const COUNT_SATISFIED = 'opacity-40';
const COUNT_OVER = 'text-red-400';

export class DungeonGame {
  private readonly root: HTMLElement;
  private readonly statusEl: HTMLElement;

  private puzzle: Puzzle | null = null;
  private walls: boolean[][] = []; // true = wall
  private marks: boolean[][] = []; // true = "not a wall" marker
  private won = false;

  private dragging = false;
  private paint: PaintAction | null = null;

  private readonly occupied = new Map<string, CellOccupant>();

  // DOM references so cells can be repainted in place while dragging.
  private readonly cells: HTMLDivElement[][] = [];
  private readonly colCounts: HTMLSpanElement[] = [];
  private readonly rowCounts: HTMLSpanElement[] = [];

  constructor(rootId: string, statusId: string) {
    this.root = document.getElementById(rootId)!;
    this.statusEl = document.getElementById(statusId)!;
    document.addEventListener('mouseup', () => this.stopDrag());
  }

  async load(puzzleUrl: string): Promise<void> {
    this.statusEl.className = STATUS_IDLE;
    this.statusEl.textContent = 'Loading puzzle…';

    try {
      const response: Response = await fetch(puzzleUrl);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      this.puzzle = (await response.json()) as Puzzle;
    } catch {
      this.puzzle = null;
      this.statusEl.className = STATUS_ERROR;
      this.statusEl.textContent = 'Failed to load puzzle.';
      return;
    }

    this.reset();
    this.indexOccupants();
    this.walls = this.emptyGrid();
    this.marks = this.emptyGrid();

    this.renderGrid();
    this.statusEl.className = STATUS_IDLE;
    this.statusEl.textContent = 'Fill in the walls!';
  }

  private reset(): void {
    this.won = false;
    this.dragging = false;
    this.paint = null;
    this.occupied.clear();
    this.cells.length = 0;
    this.colCounts.length = 0;
    this.rowCounts.length = 0;
    this.walls = [];
    this.marks = [];
  }

  // ---- Setup ------------------------------------------------------------

  private emptyGrid(): boolean[][] {
    if (!this.puzzle) return [];
    return this.puzzle.solution.map((row: number[]): boolean[] => row.map(() => false));
  }

  private indexOccupants(): void {
    if (!this.puzzle) return;
    for (const treasure of this.puzzle.treasures) {
      this.occupied.set(this.cellKey(treasure), 'treasure');
    }
    for (const monster of this.puzzle.monsters) {
      this.occupied.set(this.cellKey(monster), monster);
    }
  }

  private cellKey(pos: { x: number; y: number }): string {
    return `${pos.x},${pos.y}`;
  }

  // ---- Rendering --------------------------------------------------------

  private renderGrid(): void {
    const puzzle = this.puzzle;
    if (!puzzle) return;

    const grid: HTMLDivElement = document.createElement('div');
    grid.className = 'grid border-2 border-slate-900';
    grid.style.gridTemplateColumns = `repeat(${puzzle.width + 1}, auto)`;

    for (let row = 0; row <= puzzle.height; row++) {
      for (let col = 0; col <= puzzle.width; col++) {
        grid.appendChild(this.buildCell(puzzle, row, col));
      }
    }

    this.applyInitialCellStates();

    grid.addEventListener('contextmenu', (event: Event): void => event.preventDefault());
    this.root.replaceChildren(grid, this.statusEl);
    this.updateCounts();
  }

  private buildCell(puzzle: Puzzle, row: number, col: number): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement('div');

    if (row === 0 && col === 0) {
      cell.className = CORNER_CELL;
    } else if (row === 0) {
      const x = col - 1;
      cell.className = HEADER_CELL;
      this.colCounts[x] = this.buildCountLabel(puzzle.wall_counts.cols[x]);
      cell.appendChild(this.colCounts[x]);
    } else if (col === 0) {
      const y = row - 1;
      cell.className = HEADER_CELL;
      this.rowCounts[y] = this.buildCountLabel(puzzle.wall_counts.rows[y]);
      cell.appendChild(this.rowCounts[y]);
    } else {
      this.buildPlayCell(cell, col - 1, row - 1);
    }

    return cell;
  }

  private buildCountLabel(value: number): HTMLSpanElement {
    const label: HTMLSpanElement = document.createElement('span');
    label.className = 'transition-opacity duration-200';
    label.textContent = String(value);
    return label;
  }

  private buildPlayCell(cell: HTMLDivElement, x: number, y: number): void {
    const occupant = this.occupied.get(this.cellKey({ x, y }));

    if (occupant) {
      cell.className = OCCUPIED_CELL;
      cell.appendChild(this.buildSprite(occupant));
      return;
    }

    this.cells[y] ??= [];
    this.cells[y][x] = cell;
    cell.addEventListener('mousedown', (event: MouseEvent): void => this.onCellMouseDown(event, x, y));
    cell.addEventListener('mouseenter', (): void => this.onCellMouseEnter(x, y));
  }

  private buildSprite(occupant: CellOccupant): HTMLSpanElement {
    const sprite: HTMLSpanElement = document.createElement('span');
    if (occupant === 'treasure') {
      sprite.textContent = '💰';
    } else {
      sprite.className = 'monster scale-100 sm:scale-200';
      sprite.dataset.variant = String(occupant.variant); // sprite animation hook
    }
    return sprite;
  }

  private applyInitialCellStates(): void {
    if (!this.puzzle) return;
    for (let y = 0; y < this.puzzle.height; y++) {
      for (let x = 0; x < this.puzzle.width; x++) {
        if (this.cells[y]?.[x]) this.applyCellState(this.cells[y][x], x, y);
      }
    }
  }

  private applyCellState(cell: HTMLDivElement, x: number, y: number): void {
    if (this.walls[y][x]) {
      cell.className = WALL_CELL;
      cell.replaceChildren();
      return;
    }

    cell.className = EMPTY_CELL;
    if (this.marks[y][x]) {
      const marker: HTMLSpanElement = document.createElement('span');
      marker.className = 'text-slate-400';
      marker.textContent = '✕';
      cell.replaceChildren(marker);
    } else {
      cell.replaceChildren();
    }
  }

  // ---- Count labels -----------------------------------------------------

  private updateCounts(): void {
    const puzzle = this.puzzle;
    if (!puzzle) return;

    for (let y = 0; y < puzzle.height; y++) {
      this.updateCountLabel(this.rowCounts[y], this.wallsPlacedInRow(y), puzzle.wall_counts.rows[y]);
    }
    for (let x = 0; x < puzzle.width; x++) {
      this.updateCountLabel(
        this.colCounts[x],
        this.wallsPlacedInColumn(x, puzzle.height),
        puzzle.wall_counts.cols[x]
      );
    }
  }

  private updateCountLabel(label: HTMLSpanElement, placed: number, required: number): void {
    label.classList.remove(COUNT_SATISFIED, COUNT_OVER);
    if (placed > required) {
      label.classList.add(COUNT_OVER);
    } else if (placed === required) {
      label.classList.add(COUNT_SATISFIED);
    }
  }

  private wallsPlacedInRow(y: number): number {
    return this.walls[y].filter((isWall: boolean): boolean => isWall).length;
  }

  private wallsPlacedInColumn(x: number, height: number): number {
    let count = 0;
    for (let y = 0; y < height; y++) {
      if (this.walls[y][x]) count++;
    }
    return count;
  }

  // ---- Interaction ------------------------------------------------------

  private onCellMouseDown(event: MouseEvent, x: number, y: number): void {
    if (this.won) return;
    event.preventDefault(); // avoid text selection while dragging

    if (event.button === 0) {
      const value = !this.walls[y][x];
      this.walls[y][x] = value;
      this.marks[y][x] = false;
      this.paint = { type: 'wall', value };
    } else if (event.button === 2) {
      const value = !this.marks[y][x];
      this.marks[y][x] = value;
      this.walls[y][x] = false;
      this.paint = { type: 'mark', value };
    } else {
      return;
    }

    this.dragging = true;
    this.applyCellState(this.cells[y][x], x, y);
    this.updateCounts();
    this.checkWin();
  }

  private onCellMouseEnter(x: number, y: number): void {
    if (!this.dragging || !this.paint) return;

    if (this.paint.type === 'wall') {
      this.walls[y][x] = this.paint.value;
      this.marks[y][x] = false;
    } else {
      this.marks[y][x] = this.paint.value;
      this.walls[y][x] = false;
    }

    this.applyCellState(this.cells[y][x], x, y);
    this.updateCounts();
    this.checkWin();
  }

  private stopDrag(): void {
    this.dragging = false;
    this.paint = null;
  }

  // ---- Win condition ----------------------------------------------------

  private checkWin(): void {
    if (this.won || !this.isSolved()) return;
    this.won = true;
    this.statusEl.textContent = 'You win! 🎉';
    this.statusEl.className = STATUS_WON;
  }

  private isSolved(): boolean {
    if (!this.puzzle) return false;
    const solution: number[][] = this.puzzle.solution;
    return this.walls.every((row: boolean[], y: number): boolean =>
      row.every((isWall: boolean, x: number): boolean => (isWall ? 1 : 0) === solution[y][x])
    );
  }
}
