const MODE_SELECT_BGM_SRC = "/bgm/mode-select-bgm.mp3";

let modeSelectBgm: HTMLAudioElement | null = null;
let modeSelectBgmStarted = false;

function ensureModeSelectBgm() {
    if (!modeSelectBgm) {
        modeSelectBgm = new Audio(MODE_SELECT_BGM_SRC);
        modeSelectBgm.loop = true;
        modeSelectBgm.volume = 0.35;
        modeSelectBgm.preload = "auto";
    }

    return modeSelectBgm;
}

export async function playModeSelectBgm() {
    try {
        const audio = ensureModeSelectBgm();
        await audio.play();
        modeSelectBgmStarted = true;
        console.log("mode select bgm started:", MODE_SELECT_BGM_SRC);
    } catch (error) {
        console.log("mode select bgm blocked or failed:", error);
    }
}

export function unlockModeSelectBgm() {
    if (modeSelectBgmStarted) return;
    void playModeSelectBgm();
}

export function stopModeSelectBgm(reset = false) {
    if (!modeSelectBgm) return;

    modeSelectBgm.pause();

    if (reset) {
        modeSelectBgm.currentTime = 0;
    }

    modeSelectBgmStarted = false;
}

export function setModeSelectBgmVolume(volume: number) {
    const audio = ensureModeSelectBgm();
    audio.volume = Math.max(0, Math.min(1, volume));
}