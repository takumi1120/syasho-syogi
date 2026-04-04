const MOVE_SE_SRC = import.meta.env.BASE_URL + "se/move.mp3";
const CHECK_SE_SRC = import.meta.env.BASE_URL + "se/check.mp3";

let moveSe: HTMLAudioElement | null = null;
let checkSe: HTMLAudioElement | null = null;

function createSe(src: string) {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
}

function ensureMoveSe() {
    if (!moveSe) {
        moveSe = createSe(MOVE_SE_SRC);
        moveSe.volume = 0.9;
    }

    return moveSe;
}

function ensureCheckSe() {
    if (!checkSe) {
        checkSe = createSe(CHECK_SE_SRC);
        checkSe.volume = 0.95;
    }

    return checkSe;
}

function playClonedSe(base: HTMLAudioElement) {
    const audio = base.cloneNode(true) as HTMLAudioElement;
    audio.volume = base.volume;
    audio.currentTime = 0;
    void audio.play().catch(() => { });
}

export function playMoveSe() {
    try {
        playClonedSe(ensureMoveSe());
    } catch {
        // SE失敗でもゲームは止めない
    }
}

export function playCheckSe() {
    try {
        playClonedSe(ensureCheckSe());
    } catch {
        // SE失敗でもゲームは止めない
    }
}