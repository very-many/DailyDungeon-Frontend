/**
 * `/seed` form: the random button rolls a seed, drops it into the input and
 * submits, so the page reloads straight into the new dungeon.
 */

// Seeds are opaque to the backend, so 6 characters from an alphabet without
// look-alikes (0/O, 1/I/L) are enough and easy to read off a screen.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SEED_LENGTH = 6;

const form = document.getElementById("seed-form") as HTMLFormElement | null;
const input = document.getElementById("seed-input") as HTMLInputElement | null;

document.getElementById("seed-random")?.addEventListener("click", () => {
    if (!form || !input) return;

    input.value = Array.from(
        crypto.getRandomValues(new Uint8Array(SEED_LENGTH)),
        (byte) => ALPHABET[byte % ALPHABET.length],
    ).join("");
    form.requestSubmit();
});
