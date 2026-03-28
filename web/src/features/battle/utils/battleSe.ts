const MOVE_SE_SRC = "/se/move.mp3";

let moveSe: HTMLAudioElement | null = null;

function ensureMoveSe() {
    if (!moveSe) {
        moveSe = new Audio(MOVE_SE_SRC);
        moveSe.preload = "auto";
        moveSe.volume = 0.9;
    }

    return moveSe;
}

export function playMoveSe() {
    try {
        const base = ensureMoveSe();
        const audio = base.cloneNode(true) as HTMLAudioElement;
        audio.volume = base.volume;
        void audio.play().catch(() => { });
    } catch {
        // SE失敗でもゲームは止めない
    }
}