<script setup lang="ts">
import {
    computed,
    markRaw,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    shallowRef,
} from "vue";
import { stopModeSelectBgm } from "../features/audio/modeSelectBgm";

type GameStatus = "idle" | "running" | "crashed";

type Obstacle = {
    id: number;
    x: number;
    width: number;
    gapTop: number;
    gapHeight: number;
    passed: boolean;
    tone: number;
};

type Pickup = {
    id: number;
    x: number;
    y: number;
    size: number;
    spin: number;
};

type Particle = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    maxLife: number;
    hue: number;
};

const stageWidth = 960;
const stageHeight = 540;
const playerSize = 120;
const playerX = 148;
const ceilingHeight = 28;
const groundHeight = 82;
const playerCenterX = playerX + playerSize / 2;
const baseSpeed = 320;
const gravity = 1780;
const boostPower = 2400;
const maxDownSpeed = 940;
const maxUpSpeed = -680;
const bestStorageKey = "workvue-omake-jetpack-best";
const bgmStorageKey = "workvue-omake-bgm-enabled";
const characterImage = `${import.meta.env.BASE_URL}omake-kceo.png`;
const bgmAudioPath = `${import.meta.env.BASE_URL}omake.mp3`;
const bgmVolume = 0.34;
const maxParticles = 40;
const jetTrailInterval = 0.05;
const crashBurstCount = 14;
const gateBurstCount = 3;
const pickupBurstCount = 5;
const hudUpdateIntervalMs = 80;
const maxRenderScale = 1.25;

const status = ref<GameStatus>("idle");
const isBoosting = ref(false);
const worldOffset = ref(0);
const meters = ref(0);
const coins = ref(0);
const bestMeters = ref(0);
const newBestThisRun = ref(false);
const bgmEnabled = ref(true);
const speed = ref(baseSpeed);
const flash = ref(0);
const stageViewportRef = ref<HTMLElement | null>(null);
const stageRef = ref<HTMLElement | null>(null);
const playerRef = ref<HTMLElement | null>(null);
const altimeterFillRef = ref<HTMLElement | null>(null);
const entityCanvasRef = ref<HTMLCanvasElement | null>(null);
const stageViewportWidth = ref(stageWidth);
const stageViewportHeight = ref(stageHeight);

const player = reactive({
    y: 224,
    vy: 0,
    rotation: -4,
});

const obstacles = shallowRef<Obstacle[]>([]);
const pickups = shallowRef<Pickup[]>([]);
const particles = shallowRef<Particle[]>([]);

let animationFrame = 0;
let lastTimestamp = 0;
let spawnTimer = 0;
let exhaustTimer = 0;
let obstacleId = 0;
let pickupId = 0;
let particleId = 0;
let runMeters = 0;
let lastHudUpdate = 0;
let stageViewportResizeObserver: ResizeObserver | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let canvasCssWidth = 0;
let canvasCssHeight = 0;
let bgmAudio: HTMLAudioElement | null = null;
let bgmWasPlayingBeforeHide = false;

const altitudePercent = computed(() => {
    const usableHeight = stageHeight - groundHeight - ceilingHeight - playerSize;
    return clamp(1 - (player.y - ceilingHeight) / usableHeight, 0, 1);
});

const statusLabel = computed(() => {
    if (status.value === "running") {
        return "Flying";
    }

    if (status.value === "crashed") {
        return "Crashed";
    }

    return "Ready";
});

const actionLabel = computed(() => {
    if (status.value === "running") {
        return isBoosting.value
            ? "Boosting: hold to stay high"
            : "Gliding: tap a little early to stay smooth";
    }

    if (status.value === "crashed") {
        return newBestThisRun.value
            ? "New best distance"
            : "You are close. One more run.";
    }

    return "Press Space / W / Up or hold the screen";
});

const overlayTitle = computed(() => {
    if (status.value === "crashed") {
        return `${meters.value.toLocaleString()} m`;
    }

    return "KCEO Sky Dash";
});

const overlaySubtitle = computed(() => {
    if (status.value === "crashed") {
        return newBestThisRun.value
            ? "Great run. The next one can go even farther."
            : "The rhythm is there. Try one more time.";
    }

    return "Slip through the laser gates and push the score higher.";
});

const overlayButtonLabel = computed(() =>
    status.value === "idle" ? "Start Run" : "Try Again",
);

const bgmButtonLabel = computed(() => (bgmEnabled.value ? "BGM On" : "BGM Off"));

const stageScale = computed(() => {
    const scale = Math.min(
        stageViewportWidth.value / stageWidth,
        stageViewportHeight.value / stageHeight,
    );

    return clamp(roundToThousandths(scale), 0.1, 8);
});

const stageShellStyle = computed(() => ({
    width: `${roundToThousandths(stageWidth * stageScale.value)}px`,
    height: `${roundToThousandths(stageHeight * stageScale.value)}px`,
}));

const stageStyle = computed(() => ({
    width: `${stageWidth}px`,
    height: `${stageHeight}px`,
    transform: `scale(${stageScale.value})`,
    transformOrigin: "top left",
}));

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function roundToThousandths(value: number) {
    return Math.round(value * 1000) / 1000;
}

function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function updateStageViewportSize() {
    const viewport = stageViewportRef.value;

    if (!viewport) {
        return;
    }

    const rect = viewport.getBoundingClientRect();
    stageViewportWidth.value = Math.max(1, Math.round(rect.width));
    stageViewportHeight.value = Math.max(1, Math.round(rect.height));
}

function syncStageSize() {
    window.requestAnimationFrame(() => {
        resizeCanvas();
        renderScene();
    });
}

function handleWindowResize() {
    updateStageViewportSize();
    syncStageSize();
}

function loadBestDistance() {
    try {
        const saved = window.localStorage.getItem(bestStorageKey);
        const parsed = Number(saved ?? 0);

        if (Number.isFinite(parsed) && parsed > 0) {
            bestMeters.value = Math.floor(parsed);
        }
    } catch {
        bestMeters.value = 0;
    }
}

function persistBestDistance() {
    try {
        window.localStorage.setItem(bestStorageKey, String(bestMeters.value));
    } catch {
        // Ignore storage write failures.
    }
}

function loadBgmPreference() {
    try {
        const saved = window.localStorage.getItem(bgmStorageKey);

        if (saved === "0") {
            bgmEnabled.value = false;
        }
    } catch {
        bgmEnabled.value = true;
    }
}

function persistBgmPreference() {
    try {
        window.localStorage.setItem(bgmStorageKey, bgmEnabled.value ? "1" : "0");
    } catch {
        // Ignore storage write failures.
    }
}

function getBgmAudio() {
    if (!bgmAudio) {
        bgmAudio = new Audio(bgmAudioPath);
        bgmAudio.loop = true;
        bgmAudio.volume = bgmVolume;
        bgmAudio.preload = "auto";
    }

    return bgmAudio;
}

async function ensureBgmPlayback() {
    if (!bgmEnabled.value) {
        return;
    }

    const audio = getBgmAudio();

    if (!audio.paused) {
        return;
    }

    try {
        await audio.play();
    } catch {
        // Ignore autoplay blocking and retry after the next user gesture.
    }
}

function pauseBgm(reset = false) {
    if (!bgmAudio) {
        return;
    }

    bgmAudio.pause();

    if (reset) {
        bgmAudio.currentTime = 0;
    }
}

function toggleBgm() {
    bgmEnabled.value = !bgmEnabled.value;
    persistBgmPreference();

    if (bgmEnabled.value) {
        void ensureBgmPlayback();
        return;
    }

    pauseBgm();
}

function syncStageVisuals() {
    const stage = stageRef.value;

    if (!stage) {
        return;
    }

    stage.style.setProperty("--scroll-far", `${(-worldOffset.value * 0.18).toFixed(1)}px`);
    stage.style.setProperty("--scroll-mid", `${(-worldOffset.value * 0.36).toFixed(1)}px`);
    stage.style.setProperty("--scroll-near", `${(-worldOffset.value * 0.72).toFixed(1)}px`);
    stage.style.setProperty("--flash-alpha", flash.value.toFixed(3));
}

function syncPlayerVisuals() {
    playerRef.value?.style.setProperty(
        "transform",
        `translate3d(${playerX}px, ${player.y.toFixed(1)}px, 0) rotate(${player.rotation.toFixed(1)}deg)`,
    );
}

function syncAltimeterVisual() {
    altimeterFillRef.value?.style.setProperty(
        "height",
        `${(altitudePercent.value * 100).toFixed(1)}%`,
    );
}

function syncHud(force = false, timestamp = performance.now()) {
    if (!force && timestamp - lastHudUpdate < hudUpdateIntervalMs) {
        return;
    }

    lastHudUpdate = timestamp;
    meters.value = runMeters;

    if (runMeters > bestMeters.value) {
        bestMeters.value = runMeters;
        newBestThisRun.value = true;
    }
}

function resizeCanvas() {
    const stage = stageRef.value;
    const canvas = entityCanvasRef.value;

    if (!stage || !canvas) {
        return;
    }

    const nextCssWidth = Math.max(1, Math.round(stage.clientWidth));
    const nextCssHeight = Math.max(1, Math.round(stage.clientHeight));
    const scale = Math.min(window.devicePixelRatio || 1, maxRenderScale);

    if (
        canvasCssWidth === nextCssWidth &&
        canvasCssHeight === nextCssHeight &&
        canvasContext
    ) {
        return;
    }

    canvasCssWidth = nextCssWidth;
    canvasCssHeight = nextCssHeight;
    canvas.width = Math.max(1, Math.round(nextCssWidth * scale));
    canvas.height = Math.max(1, Math.round(nextCssHeight * scale));
    canvasContext = canvas.getContext("2d");

    if (!canvasContext) {
        return;
    }

    canvasContext.setTransform(scale, 0, 0, scale, 0, 0);
    canvasContext.imageSmoothingEnabled = true;
}

function traceRoundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
}

function drawObstacleSegment(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    tone: number,
) {
    if (width <= 0 || height <= 0) {
        return;
    }

    const hue = Math.round(18 + tone * 34);

    traceRoundedRect(context, x, y, width, height, 24);
    context.fillStyle = `hsl(${hue} 92% 56%)`;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "rgba(255, 247, 234, 0.2)";
    context.stroke();

    if (width > 24 && height > 18) {
        context.fillStyle = "rgba(255, 255, 255, 0.12)";
        context.fillRect(x + 12, y + 10, width - 24, 4);
    }
}

function drawPickup(context: CanvasRenderingContext2D, pickup: Pickup) {
    const angle = ((worldOffset.value * 0.22 + pickup.spin) * Math.PI) / 180;
    const half = pickup.size / 2;

    context.save();
    context.translate(pickup.x, pickup.y);
    context.rotate(angle);
    traceRoundedRect(context, -half, -half, pickup.size, pickup.size, 10);
    context.fillStyle = "#ffd261";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "rgba(255, 247, 234, 0.72)";
    context.stroke();
    context.fillStyle = "#ff9a3d";
    context.fillRect(-pickup.size * 0.12, -pickup.size * 0.3, pickup.size * 0.24, pickup.size * 0.6);
    context.fillRect(-pickup.size * 0.3, -pickup.size * 0.12, pickup.size * 0.6, pickup.size * 0.24);
    context.restore();
}

function renderScene() {
    if (!canvasContext) {
        return;
    }

    canvasContext.clearRect(0, 0, canvasCssWidth, canvasCssHeight);

    for (const obstacle of obstacles.value) {
        const obstacleRight = obstacle.x + obstacle.width;

        if (obstacleRight < -140 || obstacle.x > canvasCssWidth + 140) {
            continue;
        }

        drawObstacleSegment(
            canvasContext,
            obstacle.x,
            ceilingHeight,
            obstacle.width,
            Math.max(obstacle.gapTop - ceilingHeight, 0),
            obstacle.tone,
        );

        const bottomTop = obstacle.gapTop + obstacle.gapHeight;

        drawObstacleSegment(
            canvasContext,
            obstacle.x,
            bottomTop,
            obstacle.width,
            Math.max(stageHeight - groundHeight - bottomTop, 0),
            obstacle.tone,
        );
    }

    for (const pickup of pickups.value) {
        if (pickup.x + pickup.size < -80 || pickup.x - pickup.size > canvasCssWidth + 80) {
            continue;
        }

        drawPickup(canvasContext, pickup);
    }

    for (const particle of particles.value) {
        const alpha = particle.life / particle.maxLife;

        if (alpha <= 0) {
            continue;
        }

        canvasContext.globalAlpha = alpha;
        canvasContext.beginPath();
        canvasContext.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        canvasContext.fillStyle = `hsl(${Math.round(particle.hue)} 95% 66%)`;
        canvasContext.fill();
    }

    canvasContext.globalAlpha = 1;
}

function resetRun() {
    status.value = "idle";
    isBoosting.value = false;
    worldOffset.value = 0;
    meters.value = 0;
    runMeters = 0;
    coins.value = 0;
    speed.value = baseSpeed;
    flash.value = 0;
    newBestThisRun.value = false;
    obstacles.value = [];
    pickups.value = [];
    particles.value = [];
    player.y = 224;
    player.vy = 0;
    player.rotation = -4;
    spawnTimer = 0;
    exhaustTimer = 0;
    lastHudUpdate = 0;
    syncStageVisuals();
    syncPlayerVisuals();
    syncAltimeterVisual();
    renderScene();
}

function launchGame(startBoosting = false) {
    void ensureBgmPlayback();
    resetRun();
    status.value = "running";
    isBoosting.value = startBoosting;
    spawnObstacle(stageWidth + 280);
    spawnTimer = 0.42;
    lastTimestamp = performance.now();
    syncHud(true, lastTimestamp);
}

function trimParticles() {
    const overflow = particles.value.length - maxParticles;

    if (overflow > 0) {
        particles.value.splice(0, overflow);
    }
}

function spawnBurst(
    x: number,
    y: number,
    count: number,
    hueBase: number,
    speedRange: number,
) {
    const particleList = particles.value;

    for (let index = 0; index < count; index += 1) {
        const life = randomBetween(0.18, 0.72);
        const angle = randomBetween(0, Math.PI * 2);
        const force = randomBetween(speedRange * 0.35, speedRange);

        particleList.push(markRaw({
            id: ++particleId,
            x,
            y,
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force,
            size: randomBetween(6, 16),
            life,
            maxLife: life,
            hue: hueBase + randomBetween(-12, 18),
        }));
    }

    trimParticles();
}

function spawnJetTrail(deltaSeconds: number) {
    exhaustTimer += deltaSeconds;
    let spawned = false;
    const particleList = particles.value;

    while (exhaustTimer >= jetTrailInterval) {
        exhaustTimer -= jetTrailInterval;
        spawned = true;

        const life = randomBetween(0.16, 0.28);

        particleList.push(markRaw({
            id: ++particleId,
            x: playerX + 10,
            y: player.y + playerSize * 0.54 + randomBetween(-10, 10),
            vx: randomBetween(-250, -110),
            vy: randomBetween(-40, 60),
            size: randomBetween(6, 12),
            life,
            maxLife: life,
            hue: randomBetween(24, 54),
        }));
    }

    if (spawned) {
        trimParticles();
    }
}

function updateBestIfNeeded() {
    if (runMeters > bestMeters.value) {
        bestMeters.value = runMeters;
        newBestThisRun.value = true;
    }
}

function spawnObstacle(startX = stageWidth + 120) {
    const difficulty = clamp(worldOffset.value / 5000, 0, 1);
    const gapHeight = 220 - difficulty * 78;
    const safeMargin = 78;
    const minTop = ceilingHeight + safeMargin;
    const maxTop = stageHeight - groundHeight - safeMargin - gapHeight;
    const gapTop = randomBetween(minTop, maxTop);
    const width = randomBetween(106, 134);
    const x = startX + randomBetween(-18, 24);

    obstacles.value.push(markRaw({
        id: ++obstacleId,
        x,
        width,
        gapTop,
        gapHeight,
        passed: false,
        tone: Math.random(),
    }));

    const pickupCount = Math.random() > 0.58 ? 2 : 1;

    for (let index = 0; index < pickupCount; index += 1) {
        const verticalOffset = pickupCount === 1 ? 0 : index === 0 ? -38 : 38;
        const pickupY = clamp(
            gapTop + gapHeight / 2 + verticalOffset,
            gapTop + 34,
            gapTop + gapHeight - 34,
        );

        pickups.value.push(markRaw({
            id: ++pickupId,
            x: x + width / 2,
            y: pickupY,
            size: pickupCount === 1 ? 42 : 38,
            spin: randomBetween(0, 360),
        }));
    }

}

function endRun() {
    if (status.value !== "running") {
        return;
    }

    status.value = "crashed";
    isBoosting.value = false;
    flash.value = 1;
    spawnBurst(playerCenterX, player.y + playerSize / 2, crashBurstCount, 14, 320);
    updateBestIfNeeded();
    syncHud(true);

    if (newBestThisRun.value) {
        persistBestDistance();
    }
}

function updateObstacles(deltaSeconds: number) {
    const obstacleList = obstacles.value;
    const playerLeft = playerX + 16;
    const playerRight = playerX + playerSize - 16;
    const playerTop = player.y + 18;
    const playerBottom = player.y + playerSize - 18;
    let writeIndex = 0;

    for (const obstacle of obstacleList) {
        obstacle.x -= speed.value * deltaSeconds;

        if (!obstacle.passed && obstacle.x + obstacle.width < playerLeft) {
            obstacle.passed = true;
            spawnBurst(
                obstacle.x + obstacle.width,
                player.y + playerSize / 2,
                gateBurstCount,
                46,
                80,
            );
        }

        if (playerRight > obstacle.x && playerLeft < obstacle.x + obstacle.width) {
            const gapBottom = obstacle.gapTop + obstacle.gapHeight;

            if (playerTop < obstacle.gapTop || playerBottom > gapBottom) {
                endRun();
            }
        }

        if (obstacle.x + obstacle.width > -120) {
            obstacleList[writeIndex] = obstacle;
            writeIndex += 1;
        }
    }

    obstacleList.length = writeIndex;
}

function updatePickups(deltaSeconds: number) {
    const pickupList = pickups.value;
    let writeIndex = 0;

    for (const pickup of pickupList) {
        pickup.x -= speed.value * deltaSeconds;

        const dx = playerCenterX - pickup.x;
        const dy = player.y + playerSize / 2 - pickup.y;
        const hitDistance = playerSize * 0.28 + pickup.size * 0.42;

        if (dx * dx + dy * dy < hitDistance * hitDistance) {
            coins.value += 1;
            spawnBurst(pickup.x, pickup.y, pickupBurstCount, 42, 140);
            continue;
        }

        if (pickup.x + pickup.size > -50) {
            pickupList[writeIndex] = pickup;
            writeIndex += 1;
        }
    }

    pickupList.length = writeIndex;
}

function updateParticles(deltaSeconds: number) {
    const particleList = particles.value;
    let writeIndex = 0;

    for (const particle of particleList) {
        particle.life -= deltaSeconds;

        if (particle.life <= 0) {
            continue;
        }

        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.vy += 420 * deltaSeconds;
        particle.size *= 0.985;
        particleList[writeIndex] = particle;
        writeIndex += 1;
    }

    particleList.length = writeIndex;
}

function updateRunning(deltaSeconds: number) {
    speed.value = baseSpeed + Math.min(worldOffset.value * 0.03, 290);
    worldOffset.value += speed.value * deltaSeconds;
    runMeters = Math.floor(worldOffset.value * 0.052);

    player.vy += gravity * deltaSeconds;

    if (isBoosting.value) {
        player.vy -= boostPower * deltaSeconds;
        spawnJetTrail(deltaSeconds);
    }

    player.vy = clamp(player.vy, maxUpSpeed, maxDownSpeed);
    player.y += player.vy * deltaSeconds;
    player.rotation = clamp(player.vy * 0.05, -22, 28);

    spawnTimer += deltaSeconds;
    const spawnInterval = clamp(1.54 - worldOffset.value * 0.00012, 0.86, 1.54);

    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        spawnObstacle();
    }

    if (
        player.y <= ceilingHeight + 4 ||
        player.y + playerSize >= stageHeight - groundHeight - 4
    ) {
        endRun();
    }

    updateObstacles(deltaSeconds);
    updatePickups(deltaSeconds);
}

function updateAmbient(timestamp: number, deltaSeconds: number) {
    worldOffset.value += deltaSeconds * 36;

    if (status.value === "idle") {
        player.y = 224 + Math.sin(timestamp / 320) * 9;
        player.rotation = Math.sin(timestamp / 280) * 3;
    }
}

function tick(timestamp: number) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }

    const deltaSeconds = clamp((timestamp - lastTimestamp) / 1000, 0.001, 0.033);
    lastTimestamp = timestamp;

    if (status.value === "running") {
        updateRunning(deltaSeconds);
    } else {
        updateAmbient(timestamp, deltaSeconds);
    }

    updateParticles(deltaSeconds);
    flash.value = Math.max(0, flash.value - deltaSeconds * 2.6);
    syncStageVisuals();
    syncPlayerVisuals();
    syncAltimeterVisual();
    renderScene();
    syncHud(false, timestamp);
    animationFrame = window.requestAnimationFrame(tick);
}

function releaseBoost() {
    isBoosting.value = false;
}

function onStagePointerDown(event: PointerEvent) {
    event.preventDefault();
    void ensureBgmPlayback();

    if (status.value !== "running") {
        launchGame(true);
        return;
    }

    isBoosting.value = true;
}

function onKeyDown(event: KeyboardEvent) {
    const flyKeys = ["Space", "ArrowUp", "KeyW"];

    if (event.code === "Enter") {
        if (status.value !== "running") {
            event.preventDefault();
            void ensureBgmPlayback();
            launchGame(false);
        }

        return;
    }

    if (!flyKeys.includes(event.code)) {
        return;
    }

    event.preventDefault();
    void ensureBgmPlayback();

    if (event.repeat) {
        return;
    }

    if (status.value !== "running") {
        launchGame(true);
        return;
    }

    isBoosting.value = true;
}

function onKeyUp(event: KeyboardEvent) {
    const flyKeys = ["Space", "ArrowUp", "KeyW"];

    if (flyKeys.includes(event.code)) {
        event.preventDefault();
        releaseBoost();
    }
}

function onVisibilityChange() {
    if (document.hidden) {
        releaseBoost();
        bgmWasPlayingBeforeHide = Boolean(bgmAudio && !bgmAudio.paused);
        pauseBgm();
        return;
    }

    if (bgmWasPlayingBeforeHide && bgmEnabled.value) {
        void ensureBgmPlayback();
    }
}

onMounted(() => {
    stopModeSelectBgm(true);
    loadBestDistance();
    loadBgmPreference();
    updateStageViewportSize();
    syncStageVisuals();
    syncPlayerVisuals();
    syncAltimeterVisual();
    void ensureBgmPlayback();
    lastTimestamp = performance.now();
    animationFrame = window.requestAnimationFrame(tick);

    if (typeof ResizeObserver !== "undefined" && stageViewportRef.value) {
        stageViewportResizeObserver = new ResizeObserver(() => {
            updateStageViewportSize();
            syncStageSize();
        });
        stageViewportResizeObserver.observe(stageViewportRef.value);
    } else {
        window.addEventListener("resize", handleWindowResize);
    }

    syncStageSize();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerup", releaseBoost);
    window.addEventListener("blur", releaseBoost);
    document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
    window.cancelAnimationFrame(animationFrame);
    pauseBgm(true);
    bgmAudio = null;
    stageViewportResizeObserver?.disconnect();
    window.removeEventListener("resize", handleWindowResize);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("pointerup", releaseBoost);
    window.removeEventListener("blur", releaseBoost);
    document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>

<template>
    <main class="omake-page">
        <section class="omake-frame">
            <section class="game-shell">
                <div class="stage-frame">
                    <header class="stage-frame__top">
                        <div class="stage-frame__intro">
                            <div class="stage-frame__copy">
                                <p class="stage-frame__eyebrow">OMAKE ARCADE</p>
                                <h1>KCEO Sky Dash</h1>
                                <p class="stage-frame__lead">
                                    A one-page jetpack-style mini game with KCEO as the pilot.
                                </p>
                            </div>

                            <div class="stage-frame__status">
                                <p class="game-shell__label">{{ statusLabel }}</p>
                                <p class="game-shell__message">{{ actionLabel }}</p>
                            </div>
                        </div>

                        <div class="stage-frame__meta">
                            <div class="game-shell__actions">
                                <button
                                    class="game-shell__button game-shell__button--secondary"
                                    type="button"
                                    @click="toggleBgm"
                                >
                                    {{ bgmButtonLabel }}
                                </button>

                                <button
                                    class="game-shell__button"
                                    type="button"
                                    @click="launchGame(false)"
                                >
                                    {{ status === "running" ? "Restart" : "Start" }}
                                </button>
                            </div>

                            <div class="stage-frame__stats">
                                <div class="stat-card">
                                    <span>Distance</span>
                                    <strong>{{ meters.toLocaleString() }}m</strong>
                                </div>
                                <div class="stat-card">
                                    <span>Coins</span>
                                    <strong>{{ coins }}</strong>
                                </div>
                                <div class="stat-card">
                                    <span>Best</span>
                                    <strong>{{ bestMeters.toLocaleString() }}m</strong>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div ref="stageViewportRef" class="stage-frame__viewport">
                        <div class="stage-scale-shell" :style="stageShellStyle">
                            <div
                                ref="stageRef"
                                class="stage"
                                :style="stageStyle"
                                tabindex="0"
                                @pointerdown="onStagePointerDown"
                                @pointerleave="releaseBoost"
                                @pointercancel="releaseBoost"
                            >
                                <div class="stage__sun"></div>
                                <div class="stage__stars"></div>
                                <div class="stage__haze"></div>
                                <div class="stage__skyline stage__skyline--far"></div>
                                <div class="stage__skyline stage__skyline--mid"></div>
                                <div class="stage__grid"></div>
                                <div class="stage__ceiling"></div>
                                <div class="stage__ground"></div>
                                <div class="stage__scanline"></div>

                                <div class="altimeter">
                                    <span>ALT</span>
                                    <div class="altimeter__track">
                                        <div ref="altimeterFillRef" class="altimeter__fill"></div>
                                    </div>
                                </div>

                                <canvas ref="entityCanvasRef" class="entity-layer"></canvas>

                                <div
                                    ref="playerRef"
                                    class="player"
                                    :class="{
                                        'player--boosting': isBoosting && status === 'running',
                                        'player--crashed': status === 'crashed',
                                    }"
                                >
                                    <div class="player__shadow"></div>
                                    <div class="player__flame">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <img
                                        class="player__avatar"
                                        :src="characterImage"
                                        alt="KCEO"
                                        draggable="false"
                                    />
                                </div>

                                <div v-if="status === 'running'" class="live-badge">
                                    HOLD TO FLY
                                </div>

                                <div v-if="status !== 'running'" class="overlay">
                                    <p class="overlay__eyebrow">
                                        {{ status === "idle" ? "Press To Launch" : "Run Complete" }}
                                    </p>
                                    <h2>{{ overlayTitle }}</h2>
                                    <p class="overlay__text">{{ overlaySubtitle }}</p>
                                    <button
                                        class="overlay__button"
                                        type="button"
                                        @pointerdown.stop
                                        @click.stop="launchGame(false)"
                                    >
                                        {{ overlayButtonLabel }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="game-shell__footer">
                    <p>Controls: Space / W / Up / press and hold</p>
                    <p>Touch a wall or obstacle and the run ends</p>
                </footer>
            </section>
        </section>
    </main>
</template>

<style scoped>
.omake-page {
    --ink: #fff7ea;
    --gold: #ffbf5a;
    --orange: #ff7b3d;
    --orange-deep: #dd4d28;
    --teal: #19d6c1;
    --sky-top: #34155f;
    --sky-mid: #161733;
    --sky-bottom: #070912;
    position: fixed;
    inset: 0;
    min-height: 100dvh;
    width: 100vw;
    padding: clamp(0.6rem, 1.5vw, 1.1rem);
    box-sizing: border-box;
    display: block;
    overflow: hidden;
    color: var(--ink);
    background:
        radial-gradient(circle at 12% 8%, rgb(255 175 86 / 0.28), transparent 32%),
        radial-gradient(circle at 84% 12%, rgb(25 214 193 / 0.16), transparent 24%),
        linear-gradient(180deg, #2b144e 0%, #130d2c 46%, #060713 100%);
    font-family: "Avenir Next", "Trebuchet MS", "Hiragino Sans", sans-serif;
}

.omake-frame {
    height: 100%;
    min-height: 0;
}

.omake-frame::before {
    content: none;
}

.stage-frame__top {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(18rem, 0.92fr);
    gap: 0.45rem 0.7rem;
    align-items: start;
}

.stage-frame__intro {
    display: grid;
    gap: 0.32rem;
    min-width: 0;
}

.stage-frame__copy {
    max-width: 28rem;
    display: grid;
    gap: 0.16rem;
}

.stage-frame__eyebrow,
.game-shell__label,
.overlay__eyebrow {
    margin: 0;
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgb(255 241 210 / 0.72);
}

.stage-frame__copy h1 {
    margin: 0;
    font-size: clamp(1.28rem, 1.65vw, 1.76rem);
    line-height: 0.94;
    letter-spacing: -0.07em;
}

.stage-frame__lead,
.game-shell__message,
.overlay__text,
.game-shell__footer p {
    margin: 0;
    color: rgb(255 247 234 / 0.78);
}

.stage-frame__lead {
    font-size: clamp(0.72rem, 0.78vw, 0.84rem);
    line-height: 1.16;
}

.stage-frame__status {
    display: grid;
    gap: 0.08rem;
    justify-items: start;
}

.game-shell__message {
    font-size: 0.83rem;
    line-height: 1.16;
    min-block-size: calc(1.16em * 2);
}

.stage-frame__meta {
    display: grid;
    gap: 0.34rem;
    align-content: start;
    min-width: 0;
}

.stage-frame__stats {
    display: grid;
    gap: 0.35rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
}

.stat-card {
    min-height: 0;
    padding: 0.38rem 0.44rem 0.42rem;
    border-radius: 12px;
    text-align: center;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.05)),
        linear-gradient(180deg, rgb(53 45 78 / 0.8), rgb(25 21 43 / 0.78));
    border: 1px solid rgb(255 255 255 / 0.08);
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.06),
        0 12px 24px rgb(0 0 0 / 0.14);
}

.stat-card span {
    display: block;
    font-size: 0.56rem;
    color: rgb(255 240 211 / 0.68);
}

.stat-card strong {
    display: block;
    margin-top: 0.04rem;
    font-size: clamp(0.74rem, 0.84vw, 0.94rem);
    letter-spacing: -0.04em;
}

.game-shell {
    position: relative;
    min-height: 0;
    height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 0.55rem;
    padding: clamp(0.58rem, 0.82vw, 0.78rem);
    border-radius: 26px;
    background:
        linear-gradient(180deg, rgb(12 10 31 / 0.92), rgb(5 7 18 / 0.96)),
        linear-gradient(135deg, rgb(255 255 255 / 0.03), rgb(255 255 255 / 0.01));
    border: 1px solid rgb(255 255 255 / 0.08);
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.06),
        0 20px 70px rgb(0 0 0 / 0.24);
    overflow: hidden;
}

.game-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
        radial-gradient(circle at 24% 10%, rgb(104 67 255 / 0.12), transparent 24%),
        radial-gradient(circle at 88% 0%, rgb(255 170 83 / 0.09), transparent 22%);
    pointer-events: none;
}

.game-shell__footer {
    display: flex;
    justify-content: space-between;
    gap: 0.65rem;
    align-items: center;
    flex-wrap: wrap;
}

.game-shell__actions {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.game-shell__button,
.overlay__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    padding: 0.48rem 0.8rem;
    color: #2d1203;
    font: inherit;
    font-weight: 700;
    font-size: 0.84rem;
    letter-spacing: 0.02em;
    cursor: pointer;
    background: linear-gradient(135deg, #ffe1a6, var(--gold) 42%, var(--orange) 100%);
    box-shadow:
        0 10px 24px rgb(255 123 61 / 0.34),
        inset 0 1px 0 rgb(255 255 255 / 0.5);
    transition:
        transform 0.16s ease,
        box-shadow 0.16s ease;
}

.game-shell__button:hover,
.overlay__button:hover {
    transform: translateY(-1px);
    box-shadow:
        0 14px 28px rgb(255 123 61 / 0.4),
        inset 0 1px 0 rgb(255 255 255 / 0.55);
}

.game-shell__button--secondary {
    color: var(--ink);
    background: linear-gradient(180deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.05));
    box-shadow:
        0 10px 22px rgb(0 0 0 / 0.2),
        inset 0 1px 0 rgb(255 255 255 / 0.18);
}

.game-shell__button--secondary:hover {
    box-shadow:
        0 12px 24px rgb(0 0 0 / 0.24),
        inset 0 1px 0 rgb(255 255 255 / 0.24);
}

.stage-frame {
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.45rem;
    overflow: hidden;
    padding: clamp(0.3rem, 0.55vw, 0.45rem);
    border-radius: 28px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(26 21 45 / 0.8), rgb(11 11 24 / 0.86));
    border: 1px solid rgb(255 255 255 / 0.06);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
}

.stage-frame__viewport {
    min-height: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
}

.stage-scale-shell {
    position: relative;
}

.stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 24px;
    outline: none;
    user-select: none;
    touch-action: none;
    isolation: isolate;
    contain: layout paint;
    background:
        radial-gradient(circle at 52% 22%, rgb(255 192 84 / 0.18), transparent 24%),
        linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 52%, var(--sky-bottom) 100%);
    box-shadow:
        inset 0 0 0 1px rgb(255 255 255 / 0.08),
        0 20px 60px rgb(0 0 0 / 0.35);
}

.stage::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.18), transparent 22%),
        radial-gradient(circle at center, rgb(255 138 56 / 0.32), transparent 35%);
    opacity: var(--flash-alpha);
    pointer-events: none;
    mix-blend-mode: screen;
}

.stage__sun,
.stage__stars,
.stage__haze,
.stage__skyline,
.stage__grid,
.stage__ceiling,
.stage__ground,
.stage__scanline,
.entity-layer,
.player,
.overlay,
.live-badge,
.altimeter {
    position: absolute;
}

.entity-layer {
    inset: 0;
    z-index: 12;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.stage__sun {
    width: 24%;
    aspect-ratio: 1;
    left: 54%;
    top: 10%;
    border-radius: 50%;
    background:
        radial-gradient(circle at 30% 30%, #fff2c4, #ffc463 36%, rgb(255 123 61 / 0.2) 68%, transparent 74%);
    filter: blur(2px);
    opacity: 0.92;
}

.stage__stars {
    inset: 0;
    background:
        radial-gradient(circle at 12% 20%, rgb(255 255 255 / 0.8) 0 1.2px, transparent 1.6px),
        radial-gradient(circle at 28% 11%, rgb(255 255 255 / 0.58) 0 1px, transparent 1.5px),
        radial-gradient(circle at 74% 18%, rgb(255 255 255 / 0.74) 0 1.2px, transparent 1.6px),
        radial-gradient(circle at 90% 10%, rgb(255 255 255 / 0.65) 0 1px, transparent 1.4px),
        radial-gradient(circle at 67% 30%, rgb(255 255 255 / 0.52) 0 0.9px, transparent 1.4px);
    opacity: 0.65;
}

.stage__haze {
    inset: 0;
    background:
        radial-gradient(circle at 20% 65%, rgb(25 214 193 / 0.12), transparent 28%),
        radial-gradient(circle at 80% 52%, rgb(255 174 65 / 0.15), transparent 26%);
}

.stage__skyline {
    left: -12%;
    right: -12%;
    bottom: 0;
    background-repeat: repeat-x;
    opacity: 0.9;
}

.stage__skyline--far {
    height: 43%;
    background:
        linear-gradient(180deg, transparent, rgb(10 14 28 / 0.22)),
        linear-gradient(180deg, rgb(37 66 88 / 0.4), rgb(5 14 28 / 0.92)),
        repeating-linear-gradient(
            90deg,
            rgb(10 18 35 / 0.78) 0 60px,
            rgb(18 36 58 / 0.72) 60px 95px,
            rgb(9 13 25 / 0.78) 95px 142px,
            transparent 142px 180px
        );
    clip-path: polygon(0 100%, 0 42%, 8% 54%, 14% 35%, 21% 60%, 30% 30%, 37% 56%, 46% 38%, 52% 62%, 60% 28%, 67% 55%, 74% 41%, 82% 64%, 88% 33%, 94% 52%, 100% 44%, 100% 100%);
    transform: translateX(var(--scroll-far));
}

.stage__skyline--mid {
    height: 32%;
    background:
        linear-gradient(180deg, rgb(29 235 211 / 0.14), transparent 30%),
        linear-gradient(180deg, rgb(20 36 66 / 0.86), rgb(4 10 22 / 0.98)),
        repeating-linear-gradient(
            90deg,
            rgb(28 56 74 / 0.92) 0 32px,
            rgb(38 80 104 / 0.88) 32px 58px,
            rgb(22 45 66 / 0.9) 58px 94px,
            transparent 94px 112px
        );
    clip-path: polygon(0 100%, 0 44%, 6% 56%, 12% 46%, 20% 62%, 27% 36%, 34% 59%, 42% 38%, 48% 66%, 56% 43%, 63% 60%, 70% 40%, 77% 66%, 84% 34%, 91% 56%, 100% 48%, 100% 100%);
    transform: translateX(var(--scroll-mid));
    box-shadow: 0 -10px 40px rgb(25 214 193 / 0.06);
}

.stage__grid {
    left: -12%;
    right: -12%;
    bottom: 70px;
    height: 34%;
    background:
        linear-gradient(180deg, rgb(25 214 193 / 0.12), transparent 38%),
        repeating-linear-gradient(
            90deg,
            rgb(25 214 193 / 0.3) 0 2px,
            transparent 2px 74px
        ),
        repeating-linear-gradient(
            180deg,
            rgb(25 214 193 / 0.18) 0 2px,
            transparent 2px 38px
        );
    transform:
        perspective(520px)
        rotateX(72deg)
        translateX(var(--scroll-near))
        translateY(22px);
    opacity: 0.72;
}

.stage__ceiling {
    inset: 0 0 auto;
    height: 28px;
    background:
        linear-gradient(180deg, rgb(255 228 177 / 0.72), rgb(255 123 61 / 0.65)),
        repeating-linear-gradient(
            90deg,
            rgb(255 255 255 / 0.42) 0 14px,
            transparent 14px 28px
        );
    box-shadow: 0 0 20px rgb(255 123 61 / 0.42);
}

.stage__ground {
    inset: auto 0 0;
    height: 82px;
    background:
        linear-gradient(180deg, rgb(255 186 84 / 0.32), transparent 18%),
        linear-gradient(180deg, #0f1a25, #07090f 100%);
    box-shadow: 0 -20px 50px rgb(255 123 61 / 0.08);
}

.stage__ground::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
        repeating-linear-gradient(
            90deg,
            rgb(255 191 90 / 0.26) 0 38px,
            transparent 38px 64px
        ),
        repeating-linear-gradient(
            0deg,
            rgb(255 255 255 / 0.05) 0 2px,
            transparent 2px 14px
        );
    transform: translateX(var(--scroll-near));
}

.stage__scanline {
    inset: 0;
    background: repeating-linear-gradient(
        180deg,
        rgb(255 255 255 / 0.02) 0 2px,
        transparent 2px 6px
    );
    opacity: 0.38;
    pointer-events: none;
}

.altimeter {
    top: 22px;
    right: 22px;
    z-index: 18;
    display: grid;
    gap: 0.45rem;
    justify-items: center;
    padding: 0.75rem 0.65rem;
    border-radius: 18px;
    background: rgb(7 11 22 / 0.72);
    border: 1px solid rgb(255 255 255 / 0.08);
}

.altimeter span {
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    color: rgb(255 240 210 / 0.68);
}

.altimeter__track {
    width: 8px;
    height: 140px;
    display: flex;
    align-items: end;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.08);
    overflow: hidden;
}

.altimeter__fill {
    width: 100%;
    border-radius: inherit;
    background: linear-gradient(180deg, #8ff8ee, #16d4bf 62%, #0b7f74);
    box-shadow: 0 0 18px rgb(25 214 193 / 0.48);
}

.obstacle {
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    z-index: 12;
    will-change: transform;
}

.obstacle__segment {
    position: absolute;
    left: 0;
    border-radius: 24px;
    border: 2px solid rgb(255 247 234 / 0.18);
    background:
        linear-gradient(
            180deg,
            hsl(var(--tone) 96% 64%),
            hsl(calc(var(--tone) + 16) 92% 48%)
        ),
        repeating-linear-gradient(
            180deg,
            rgb(255 255 255 / 0.16) 0 10px,
            transparent 10px 22px
        );
    box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.06),
        0 0 28px hsl(var(--tone) 90% 56% / 0.45),
        inset 0 0 24px rgb(255 255 255 / 0.14);
}

.obstacle__segment::before,
.obstacle__segment::after {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    height: 12px;
    border-radius: 999px;
    background: linear-gradient(90deg, #fff0c5, #ff9b52);
    box-shadow: 0 0 24px rgb(255 123 61 / 0.55);
}

.obstacle__segment--top::after {
    bottom: -6px;
}

.obstacle__segment--top::before {
    top: -6px;
}

.obstacle__segment--bottom::before {
    top: -6px;
}

.obstacle__segment--bottom::after {
    bottom: -6px;
}

.pickup {
    z-index: 14;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #fff5d0, #ffd261 52%, #ff9334);
    color: #462005;
    font-weight: 900;
    box-shadow:
        0 0 0 3px rgb(255 255 255 / 0.12),
        0 10px 22px rgb(255 191 90 / 0.42),
        inset 0 1px 0 rgb(255 255 255 / 0.52);
    will-change: transform;
}

.pickup::before {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: 16px;
    border: 1px solid rgb(255 229 173 / 0.6);
    opacity: 0.7;
}

.pickup span {
    transform: translateY(-1px);
}

.particle {
    z-index: 16;
    border-radius: 999px;
    pointer-events: none;
    will-change: transform, opacity;
}

.player {
    top: 0;
    left: 0;
    width: 120px;
    height: 120px;
    z-index: 20;
    will-change: transform;
}

.player__shadow {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: -18px;
    height: 18px;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.24);
    filter: blur(4px);
}

.player__avatar {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 14px 24px rgb(0 0 0 / 0.28));
}

.player__flame {
    position: absolute;
    left: -32px;
    top: 52%;
    width: 52px;
    height: 34px;
    opacity: 0.2;
    transform: translateY(-50%) scaleX(0.66);
    transform-origin: right center;
    transition:
        opacity 0.12s ease,
        transform 0.12s ease;
}

.player__flame span {
    position: absolute;
    inset: 0;
    border-radius: 999px 18px 18px 999px;
    background: linear-gradient(90deg, #fff6ce, #ffb84b 46%, #ff6d32 80%, transparent);
    filter: blur(2px);
}

.player__flame span:nth-child(2) {
    inset: 5px 0 5px 12px;
    opacity: 0.8;
}

.player__flame span:nth-child(3) {
    inset: 10px 0 10px 20px;
    opacity: 0.7;
}

.player--boosting .player__flame {
    opacity: 1;
    transform: translateY(-50%) scaleX(1.22);
}

.player--crashed .player__avatar {
    filter:
        saturate(0.6)
        contrast(1.05)
        drop-shadow(0 14px 24px rgb(0 0 0 / 0.28));
}

.live-badge {
    top: 22px;
    left: 22px;
    z-index: 19;
    padding: 0.55rem 0.8rem;
    border-radius: 999px;
    background: rgb(7 11 22 / 0.55);
    border: 1px solid rgb(255 255 255 / 0.08);
    color: rgb(255 247 234 / 0.82);
    font-size: 0.8rem;
    letter-spacing: 0.16em;
}

.overlay {
    inset: 0;
    z-index: 24;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.8rem;
    padding: 2rem;
    text-align: center;
    background:
        radial-gradient(circle at center, rgb(9 14 28 / 0.18), rgb(4 7 14 / 0.72) 65%),
        linear-gradient(180deg, rgb(3 6 14 / 0.2), rgb(3 6 14 / 0.6));
    backdrop-filter: blur(6px);
}

.overlay h2 {
    margin: 0;
    font-size: clamp(2.2rem, 7vw, 4.4rem);
    line-height: 0.9;
    letter-spacing: -0.06em;
}

.overlay__text {
    max-width: 28rem;
}

.game-shell__footer {
    font-size: 0.84rem;
    padding-inline: 0.2rem;
}

@media (max-width: 980px) {
    .omake-page {
        padding: 0.7rem;
    }

    .stage-frame__top {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}

@media (max-width: 860px) {
    .stage-frame__stats {
        width: 100%;
    }
}

@media (max-width: 680px) {
    .omake-page {
        padding: 0.5rem;
    }

    .game-shell {
        border-radius: 22px;
    }

    .stage-frame {
        padding: 0.3rem;
    }

    .stage-frame__top,
    .game-shell__footer {
        align-items: stretch;
    }

    .stage-frame__stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .stage-frame__copy h1 {
        font-size: clamp(1.18rem, 5vw, 1.46rem);
    }

    .game-shell__actions {
        width: 100%;
    }

    .game-shell__button {
        flex: 1 1 0;
        justify-content: center;
    }

    .stage,
    .overlay {
        border-radius: 18px;
    }

    .altimeter {
        right: 14px;
        top: 14px;
        padding: 0.65rem 0.55rem;
    }

    .altimeter__track {
        height: 108px;
    }

    .live-badge {
        left: 14px;
        top: 14px;
        font-size: 0.72rem;
    }
}
</style>
