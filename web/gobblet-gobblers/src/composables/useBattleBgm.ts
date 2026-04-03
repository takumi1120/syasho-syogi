import { ref } from "vue";

export function useBattleBgm() {
    let audioContext: AudioContext | null = null;
    let masterGain: GainNode | null = null;
    let isPlaying = false;
    let nextLoopTimeout: number | null = null;

    const playing = ref(false);

    const melody = [
        { freq: 329.63, duration: 0.5 },
        { freq: 392.0, duration: 0.5 },
        { freq: 493.88, duration: 0.5 },
        { freq: 440.0, duration: 0.5 },
        { freq: 392.0, duration: 0.5 },
        { freq: 369.99, duration: 0.5 },
        { freq: 329.63, duration: 0.5 },
        { freq: 293.66, duration: 0.5 },
        { freq: 329.63, duration: 0.5 },
        { freq: 392.0, duration: 0.5 },
        { freq: 493.88, duration: 0.5 },
        { freq: 587.33, duration: 0.5 },
        { freq: 493.88, duration: 0.5 },
        { freq: 440.0, duration: 0.5 },
        { freq: 392.0, duration: 0.5 },
        { freq: 329.63, duration: 1.0 },
    ];

    const bassLine = [
        { freq: 164.81, duration: 2.0 },
        { freq: 130.81, duration: 2.0 },
        { freq: 110.0, duration: 2.0 },
        { freq: 123.47, duration: 2.0 },
    ];

    function createAudioContext() {
        if (!audioContext) {
            audioContext = new AudioContext();
            masterGain = audioContext.createGain();
            masterGain.gain.value = 0.12;
            masterGain.connect(audioContext.destination);
        }
    }

    function playTone(
        freq: number,
        startTime: number,
        duration: number,
        type: OscillatorType = "triangle",
        volume = 0.2
    ) {
        if (!audioContext || !masterGain) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    function scheduleLoop() {
        if (!audioContext || !isPlaying) return;

        const now = audioContext.currentTime + 0.05;

        let melodyTime = now;
        for (const note of melody) {
            playTone(note.freq, melodyTime, note.duration * 0.9, "triangle", 0.08);
            melodyTime += note.duration;
        }

        let bassTime = now;
        for (const note of bassLine) {
            playTone(note.freq, bassTime, note.duration * 0.95, "sine", 0.05);
            bassTime += note.duration;
        }

        nextLoopTimeout = window.setTimeout(() => {
            scheduleLoop();
        }, 8000);
    }

    async function startBgm() {
        createAudioContext();

        if (!audioContext) return;

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        if (isPlaying) return;

        isPlaying = true;
        playing.value = true;
        scheduleLoop();
    }

    function stopBgm() {
        isPlaying = false;
        playing.value = false;

        if (nextLoopTimeout !== null) {
            clearTimeout(nextLoopTimeout);
            nextLoopTimeout = null;
        }

        if (audioContext) {
            audioContext.close();
            audioContext = null;
            masterGain = null;
        }
    }

    return {
        playing,
        startBgm,
        stopBgm,
    };
}