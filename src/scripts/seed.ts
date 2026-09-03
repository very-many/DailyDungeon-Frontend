import { DungeonGame } from './game/DungeonGame';

const API_URL = 'https://daily-dungeon-backend.vercel.app/api/v1/dungeon';

const form: HTMLFormElement = document.getElementById('seed-form')!;
const input: HTMLInputElement = document.getElementById('seed-input')!;
const game = new DungeonGame('dungeon', 'dungeon-status');

form.addEventListener('submit', (event: SubmitEvent): void => {
  event.preventDefault();
  const seed: string = input.value.trim();
  if (!seed) {
    input.focus();
    return;
  }
  const url: string = `${API_URL}?seed=${encodeURIComponent(seed)}`;
  void game.load(url);
});
