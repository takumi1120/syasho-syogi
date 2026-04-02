<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import { stopModeSelectBgm } from "../features/audio/modeSelectBgm";

type TeamId = 1 | 2;
type Winner = TeamId | 0 | null;
type Phase = "draft" | "waiting" | "aiming" | "simulating" | "result";
type Mode = "cpu" | "local";
type CharacterId =
    | "bil"
    | "elon"
    | "jobs"
    | "kceo"
    | "sum"
    | "thim"
    | "mikuru"
    | "mizoguchi"
    | "son";

type CharacterDef = {
    id: CharacterId;
    name: string;
    title: string;
    trait: string;
    description: string;
    image: string;
    accent: string;
    stats: {
        power: number;
        weight: number;
        grip: number;
        obstacle: number;
        radius: number;
        maxCharge: number;
    };
};

type Piece = {
    id: string;
    team: TeamId;
    characterId: CharacterId;
    name: string;
    accent: string;
    image: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    power: number;
    grip: number;
    obstacle: number;
    maxCharge: number;
    fallen: boolean;
};

type Obstacle = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    tone: number;
    fallen: boolean;
};

type AimState = {
    active: boolean;
    pointerId: number | null;
    pieceId: string | null;
    x: number;
    y: number;
};

type StatBar = {
    key: string;
    label: string;
    width: string;
    valueLabel: string;
};

type Body = Piece | Obstacle;

const router = useRouter();

const BASE_WIDTH = 1560;
const BASE_HEIGHT = 900;
const BOARD_SIZE = 680;
const BOARD_CENTER = BOARD_SIZE / 2;
const SPAWN_X = 156;
const CENTER_OBSTACLE_RADIUS = 48;
const MAX_RENDER_SCALE = 2;
const MIN_DRAG = 18;
const BASE_LAUNCH_SPEED = 3.2;
const MAX_SPEED = 1450;
const PIECE_DRAG = 610;
const OBSTACLE_DRAG = 320;
const RESTITUTION = 1;
const OBSTACLE_RESTITUTION = 0.8;
const STOP_SPEED = 11;
const BGM_SRC = "/bgm/kesigomu.mp3";
const BGM_VOLUME = 0.38;

const characters: CharacterDef[] = [
    {
        id: "bil",
        name: "Bill",
        title: "World Builder",
        trait: "重めの万能型",
        description: "重心が安定していて押し負けにくい、扱いやすい基準駒。",
        image: "/characters/bil.png",
        accent: "#6cd3ff",
        stats: { power: 1.03, weight: 1.12, grip: 1.08, obstacle: 1.02, radius: 33, maxCharge: 214 },
    },
    {
        id: "elon",
        name: "Elon",
        title: "Rocket Flick",
        trait: "高速突進型",
        description: "初速が最強クラス。そのぶん滑りやすく、自爆の危険も高い。",
        image: "/characters/elon.png",
        accent: "#ff7859",
        stats: { power: 1.22, weight: 0.9, grip: 0.82, obstacle: 1.05, radius: 31, maxCharge: 232 },
    },
    {
        id: "jobs",
        name: "Jobs",
        title: "Sharp Designer",
        trait: "小型の精密型",
        description: "小さくて狙いが細い。コントロール重視で障害物のすき間を抜きやすい。",
        image: "/characters/jobs.png",
        accent: "#f4d566",
        stats: { power: 1.08, weight: 0.92, grip: 1.18, obstacle: 0.95, radius: 29, maxCharge: 206 },
    },
    {
        id: "kceo",
        name: "KCEO",
        title: "Platinum Drive",
        trait: "高火力の重量型",
        description: "重さと押し込み性能が高く、正面衝突に強いパワー駒。",
        image: "/characters/kceo.png",
        accent: "#59b2ff",
        stats: { power: 1.16, weight: 1.24, grip: 0.96, obstacle: 1.12, radius: 35, maxCharge: 210 },
    },
    {
        id: "sum",
        name: "Sam",
        title: "Prompt Engine",
        trait: "障害物操作型",
        description: "障害物を動かす力が高く、盤面の形を崩して主導権を取れる。",
        image: "/characters/sum.png",
        accent: "#68f0c3",
        stats: { power: 1.01, weight: 1, grip: 1.04, obstacle: 1.28, radius: 32, maxCharge: 212 },
    },
    {
        id: "thim",
        name: "Tim",
        title: "Safe Operator",
        trait: "高グリップ防御型",
        description: "止まりやすく、端際の細かな調整がしやすい守備寄りの駒。",
        image: "/characters/thim.png",
        accent: "#ffe18a",
        stats: { power: 0.96, weight: 1.13, grip: 1.28, obstacle: 0.92, radius: 33, maxCharge: 198 },
    },
    {
        id: "mikuru",
        name: "Mikuru",
        title: "Champion Rush",
        trait: "近距離の押し切り型",
        description: "中距離からの押し出しが強力。やや大きく、ぶつけ合いに強い。",
        image: "/battle/pieces/pin/mikuru.png",
        accent: "#ffb255",
        stats: { power: 1.18, weight: 1.09, grip: 0.91, obstacle: 1.04, radius: 34, maxCharge: 218 },
    },
    {
        id: "mizoguchi",
        name: "Mizoguchi",
        title: "Breakdown Trick",
        trait: "軽快な崩し型",
        description: "軽めで角度がつけやすく、障害物を経由した崩しが得意。",
        image: "/battle/pieces/pin/mizoguchi.png",
        accent: "#ffd164",
        stats: { power: 1, weight: 0.94, grip: 1.11, obstacle: 1.23, radius: 30, maxCharge: 214 },
    },
    {
        id: "son",
        name: "Son",
        title: "Momentum King",
        trait: "慣性特化型",
        description: "止まりにくい大振りの一撃型。端まで流れ込む豪快さが持ち味。",
        image: "/battle/pieces/pin/son.png",
        accent: "#fff36d",
        stats: { power: 1.2, weight: 1.18, grip: 0.86, obstacle: 1.1, radius: 34, maxCharge: 226 },
    },
];

const characterById = Object.fromEntries(characters.map((character) => [character.id, character])) as Record<CharacterId, CharacterDef>;

const viewportWidth = ref(0);
const viewportHeight = ref(0);
const mode = ref<Mode>("cpu");
const phase = ref<Phase>("draft");
const currentTeam = ref<TeamId>(1);
const winner = ref<Winner>(null);
const turnCount = ref(1);
const activeSeat = ref<TeamId>(1);
const lastAction = ref("キャラを選んでボードを生成します");
const battleNote = ref("盤面の外に落ちた駒が負けです");
const isCpuThinking = ref(false);
const isMusicPlaying = ref(false);
const pieces = shallowRef<Piece[]>([]);
const obstacles = shallowRef<Obstacle[]>([]);
const logEntries = shallowRef<string[]>([]);
const boardCanvasRef = ref<HTMLCanvasElement | null>(null);

const selections = reactive<{ 1: CharacterId | null; 2: CharacterId | null }>({ 1: null, 2: null });

const aim = reactive<AimState>({
    active: false,
    pointerId: null,
    pieceId: null,
    x: 0,
    y: 0,
});

let obstacleSerial = 0;
let animationFrame = 0;
let lastTimestamp = 0;
let cpuTimer = 0;
let boardContext: CanvasRenderingContext2D | null = null;
let bgm: HTMLAudioElement | null = null;
const imageCache: Partial<Record<CharacterId, HTMLImageElement>> = {};

const team1Character = computed(() => (selections[1] ? characterById[selections[1]] : null));
const team2Character = computed(() => (selections[2] ? characterById[selections[2]] : null));
const team1Piece = computed(() => pieces.value.find((piece) => piece.team === 1) ?? null);
const team2Piece = computed(() => pieces.value.find((piece) => piece.team === 2) ?? null);

const stageScale = computed(() => clamp(Math.min(viewportWidth.value / BASE_WIDTH, viewportHeight.value / BASE_HEIGHT) || 1, 0.24, 1.2));
const stageShellStyle = computed(() => ({ width: `${Math.round(BASE_WIDTH * stageScale.value)}px`, height: `${Math.round(BASE_HEIGHT * stageScale.value)}px` }));
const sceneStyle = computed(() => ({ width: `${BASE_WIDTH}px`, height: `${BASE_HEIGHT}px`, transform: `scale(${stageScale.value})`, transformOrigin: "top left" }));
const canStartBattle = computed(() => Boolean(team1Character.value && team2Character.value));
const livingObstacleCount = computed(() => obstacles.value.filter((obstacle) => !obstacle.fallen).length);
const activePiece = computed(() => (phase.value === "draft" || phase.value === "result" ? null : pieces.value.find((piece) => piece.team === currentTeam.value && !piece.fallen) ?? null));

const aimRatio = computed(() => {
    if (!aim.active || !aim.pieceId) {
        return 0;
    }

    const piece = pieces.value.find((entry) => entry.id === aim.pieceId);
    if (!piece) {
        return 0;
    }

    return clamp(Math.hypot(aim.x - piece.x, aim.y - piece.y) / piece.maxCharge, 0, 1);
});

const currentTurnLabel = computed(() => {
    if (phase.value === "draft") {
        return "DRAFT MODE";
    }

    if (phase.value === "result") {
        if (winner.value === 0) return "DOUBLE RING OUT";
        return winner.value === 1 ? "PLAYER 1 WIN" : mode.value === "cpu" ? "CPU WIN" : "PLAYER 2 WIN";
    }

    return currentTeam.value === 1 ? "PLAYER 1 TURN" : mode.value === "cpu" ? "CPU TURN" : "PLAYER 2 TURN";
});

const boardPrompt = computed(() => {
    if (phase.value === "draft") return "左右どちらを選ぶか決めてからカードを押してください。";
    if (phase.value === "aiming") return `ショットパワー ${Math.round(aimRatio.value * 100)}%`;
    if (phase.value === "simulating") return "全ての駒と障害物が止まるまで待機中です。";
    if (phase.value === "result") return "同キャラで再戦するか、ドラフトに戻って編成を変えられます。";
    if (mode.value === "cpu" && currentTeam.value === 2) return isCpuThinking.value ? "CPU が角度を計算中です。" : "CPU ターンです。盤面が止まるまでお待ちください。";
    return "自分の駒をつかんでドラッグし、離して弾いてください。";
});

const winnerHeadline = computed(() => {
    if (winner.value === 0) return "両者リングアウト";
    if (winner.value === 1) return `${team1Character.value?.name ?? "Player 1"} の勝利`;
    if (winner.value === 2) return `${team2Character.value?.name ?? "Player 2"} の勝利`;
    return "";
});

const winnerSubline = computed(() => {
    if (winner.value === 0) return "同時に盤外へ落ちたため引き分けです。";
    if (winner.value === 1) return `${team1Character.value?.trait ?? "勝者"} が最後まで盤上に残りました。`;
    if (winner.value === 2) return `${team2Character.value?.trait ?? "勝者"} が押し切りました。`;
    return "";
});

const musicButtonLabel = computed(() => (isMusicPlaying.value ? "BGM ON" : "BGM OFF"));

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function teamLabel(team: TeamId) {
    if (team === 1) return "PLAYER 1";
    return mode.value === "cpu" ? "CPU" : "PLAYER 2";
}

function getPieceStatus(team: TeamId) {
    const piece = team === 1 ? team1Piece.value : team2Piece.value;

    if (phase.value === "draft") return activeSeat.value === team ? "SELECTING" : "STANDBY";
    if (winner.value === team) return "WINNER";
    if (piece?.fallen) return "RING OUT";
    if (phase.value === "simulating") return "MOVING";
    if (phase.value === "aiming" && currentTeam.value === team) return "AIMING";
    if (phase.value === "waiting" && currentTeam.value === team) return mode.value === "cpu" && team === 2 ? "CPU READY" : "READY";
    if (phase.value === "result" && winner.value === 0) return "DRAW";
    return "WAIT";
}

function getStatBars(character: CharacterDef | null): StatBar[] {
    if (!character) return [];

    const stats = character.stats;
    return [
        { key: "power", label: "Power", width: `${Math.round((stats.power / 1.25) * 100)}%`, valueLabel: `${Math.round(stats.power * 100)}` },
        { key: "weight", label: "Weight", width: `${Math.round((stats.weight / 1.3) * 100)}%`, valueLabel: `${Math.round(stats.weight * 100)}` },
        { key: "grip", label: "Grip", width: `${Math.round((stats.grip / 1.3) * 100)}%`, valueLabel: `${Math.round(stats.grip * 100)}` },
        { key: "obstacle", label: "Obstacle", width: `${Math.round((stats.obstacle / 1.3) * 100)}%`, valueLabel: `${Math.round(stats.obstacle * 100)}` },
    ];
}

function pushLog(message: string) {
    logEntries.value = [message, ...logEntries.value].slice(0, 5);
}

function resetAim() {
    aim.active = false;
    aim.pointerId = null;
    aim.pieceId = null;
}

function clearCpuTurn() {
    if (cpuTimer) {
        window.clearTimeout(cpuTimer);
        cpuTimer = 0;
    }
}

function updateViewport() {
    viewportWidth.value = Math.max(1, window.innerWidth);
    viewportHeight.value = Math.max(1, window.innerHeight);
}

function preloadImages() {
    for (const character of characters) {
        const image = new Image();
        image.src = character.image;
        image.decoding = "async";
        image.onload = () => drawBoard();
        imageCache[character.id] = image;
    }
}

function ensureBgm() {
    if (!bgm) {
        bgm = new Audio(BGM_SRC);
        bgm.loop = true;
        bgm.volume = BGM_VOLUME;
        bgm.preload = "auto";
    }

    return bgm;
}

async function playBgm() {
    try {
        const audio = ensureBgm();
        await audio.play();
        isMusicPlaying.value = true;
    } catch {
        isMusicPlaying.value = false;
    }
}

function stopBgm(reset = false) {
    if (!bgm) {
        isMusicPlaying.value = false;
        return;
    }

    bgm.pause();

    if (reset) {
        bgm.currentTime = 0;
    }

    isMusicPlaying.value = false;
}

function handleFirstPointerDown() {
    if (!isMusicPlaying.value) {
        void playBgm();
    }
}

function handleToggleMusic() {
    if (isMusicPlaying.value) {
        stopBgm(false);
        return;
    }

    void playBgm();
}

function resizeCanvas() {
    const canvas = boardCanvasRef.value;

    if (!canvas) {
        boardContext = null;
        return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_RENDER_SCALE);
    canvas.width = Math.round(BOARD_SIZE * dpr);
    canvas.height = Math.round(BOARD_SIZE * dpr);
    canvas.style.width = `${BOARD_SIZE}px`;
    canvas.style.height = `${BOARD_SIZE}px`;

    const context = canvas.getContext("2d");
    if (!context) {
        boardContext = null;
        return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    boardContext = context;
}

function handleResize() {
    updateViewport();
    resizeCanvas();
    drawBoard();
}

function randomizeSelections() {
    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    selections[1] = shuffled[0]?.id ?? "kceo";
    selections[2] = shuffled[1]?.id ?? "elon";
    activeSeat.value = 1;
    lastAction.value = "ランダムでマッチアップを組みました";
    battleNote.value = "必要なら左右を入れ替えてから開始できます";
    pushLog("ランダム編成を生成");
}

function swapSelections() {
    const left = selections[1];
    selections[1] = selections[2];
    selections[2] = left;
    lastAction.value = "左右のキャラクターを入れ替えました";
    pushLog("左右の編成を交換");
}

function assignCharacter(id: CharacterId) {
    const seat = activeSeat.value;
    selections[seat] = id;
    activeSeat.value = seat === 1 ? 2 : 1;
    lastAction.value = `${teamLabel(seat)} に ${characterById[id].name} をセット`;
    battleNote.value = "もう片側も選ぶとすぐに開始できます";
    pushLog(`${teamLabel(seat)} selected ${characterById[id].name}`);
}

function selectSeat(team: TeamId) {
    activeSeat.value = team;
}

function goModeSelect() {
    router.push({ name: "mode-select" });
}

function createPiece(team: TeamId, character: CharacterDef): Piece {
    return {
        id: `piece-${team}`,
        team,
        characterId: character.id,
        name: character.name,
        accent: character.accent,
        image: character.image,
        x: team === 1 ? SPAWN_X : BOARD_SIZE - SPAWN_X,
        y: BOARD_CENTER,
        vx: 0,
        vy: 0,
        radius: character.stats.radius,
        mass: 72 * character.stats.weight,
        power: character.stats.power,
        grip: character.stats.grip,
        obstacle: character.stats.obstacle,
        maxCharge: character.stats.maxCharge,
        fallen: false,
    };
}

function createCenterObstacle(): Obstacle {
    return {
        id: ++obstacleSerial,
        x: BOARD_CENTER,
        y: BOARD_CENTER,
        vx: 0,
        vy: 0,
        radius: CENTER_OBSTACLE_RADIUS,
        mass: CENTER_OBSTACLE_RADIUS * 5.4,
        tone: 0.42,
        fallen: false,
    };
}

function createObstacles() {
    const created: Obstacle[] = [createCenterObstacle()];
    const count = Math.floor(randomBetween(2, 5));
    const spawnExclusion = [
        { x: SPAWN_X, y: BOARD_CENTER, radius: 92 },
        { x: BOARD_SIZE - SPAWN_X, y: BOARD_CENTER, radius: 92 },
        { x: BOARD_CENTER, y: BOARD_CENTER, radius: CENTER_OBSTACLE_RADIUS + 18 },
    ];

    for (let attempts = 0; created.length < count + 1 && attempts < 260; attempts += 1) {
        const radius = randomBetween(32, 56);
        const obstacle: Obstacle = {
            id: ++obstacleSerial,
            x: randomBetween(BOARD_SIZE * 0.28, BOARD_SIZE * 0.72),
            y: randomBetween(BOARD_SIZE * 0.16, BOARD_SIZE * 0.84),
            vx: 0,
            vy: 0,
            radius,
            mass: radius * 4,
            tone: randomBetween(0, 1),
            fallen: false,
        };

        const overlapsSpawn = spawnExclusion.some((zone) => {
            const distance = Math.hypot(obstacle.x - zone.x, obstacle.y - zone.y);
            return distance < obstacle.radius + zone.radius;
        });

        const overlapsObstacle = created.some((existing) => {
            const distance = Math.hypot(obstacle.x - existing.x, obstacle.y - existing.y);
            return distance < obstacle.radius + existing.radius + 18;
        });

        if (overlapsSpawn || overlapsObstacle) {
            continue;
        }

        created.push(obstacle);
    }

    return created;
}

function startBattle() {
    const left = team1Character.value;
    const right = team2Character.value;

    if (!left || !right) {
        return;
    }

    clearCpuTurn();
    resetAim();
    winner.value = null;
    isCpuThinking.value = false;
    currentTeam.value = 1;
    turnCount.value = 1;
    phase.value = "waiting";
    pieces.value = [createPiece(1, left), createPiece(2, right)];
    obstacles.value = createObstacles();
    lastAction.value = "盤面を生成しました。Player 1 から開始です";
    battleNote.value = "障害物も押せます。強い角度でぶつけると盤外へ飛ばせます";
    pushLog("新しい試合を開始");

    window.requestAnimationFrame(() => {
        resizeCanvas();
        drawBoard();
    });
}

function openDraft() {
    clearCpuTurn();
    resetAim();
    isCpuThinking.value = false;
    phase.value = "draft";
    winner.value = null;
    pieces.value = [];
    obstacles.value = [];
    lastAction.value = "ドラフト画面に戻りました";
    battleNote.value = "強さの違う駒を選び直せます";
    pushLog("ドラフトに戻る");
}

function rematch() {
    startBattle();
}

function isPiece(body: Body): body is Piece {
    return "team" in body;
}

function getBodies() {
    return [
        ...pieces.value.filter((piece) => !piece.fallen),
        ...obstacles.value.filter((obstacle) => !obstacle.fallen),
    ];
}

function applyDrag(body: Body, deltaSeconds: number) {
    const speed = Math.hypot(body.vx, body.vy);

    if (speed === 0) {
        return;
    }

    const drag = isPiece(body) ? PIECE_DRAG * body.grip : OBSTACLE_DRAG;
    const nextSpeed = Math.max(0, speed - drag * deltaSeconds);

    if (nextSpeed === 0) {
        body.vx = 0;
        body.vy = 0;
        return;
    }

    const factor = nextSpeed / speed;
    body.vx *= factor;
    body.vy *= factor;
}

function moveBody(body: Body, deltaSeconds: number) {
    body.x += body.vx * deltaSeconds;
    body.y += body.vy * deltaSeconds;

    const speed = Math.hypot(body.vx, body.vy);

    if (speed > MAX_SPEED) {
        const factor = MAX_SPEED / speed;
        body.vx *= factor;
        body.vy *= factor;
    }
}

function collideBodies(a: Body, b: Body) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy) || 0.0001;
    const minDistance = a.radius + b.radius;

    if (distance >= minDistance) {
        return;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const overlap = minDistance - distance;
    const totalMass = a.mass + b.mass;

    a.x -= nx * overlap * (b.mass / totalMass);
    a.y -= ny * overlap * (b.mass / totalMass);
    b.x += nx * overlap * (a.mass / totalMass);
    b.y += ny * overlap * (a.mass / totalMass);

    const relativeVelocityX = b.vx - a.vx;
    const relativeVelocityY = b.vy - a.vy;
    const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

    if (velocityAlongNormal > 0) {
        return;
    }

    const effectiveMassA = isPiece(a) && !isPiece(b) ? a.mass * a.obstacle : a.mass;
    const effectiveMassB = isPiece(b) && !isPiece(a) ? b.mass * b.obstacle : b.mass;
    const inverseMassA = 1 / effectiveMassA;
    const inverseMassB = 1 / effectiveMassB;
    const restitution = !isPiece(a) || !isPiece(b) ? OBSTACLE_RESTITUTION : RESTITUTION;
    const impulseMagnitude =
        (-(1 + restitution) * velocityAlongNormal) /
        (inverseMassA + inverseMassB);
    const impulseX = impulseMagnitude * nx;
    const impulseY = impulseMagnitude * ny;

    a.vx -= impulseX * inverseMassA;
    a.vy -= impulseY * inverseMassA;
    b.vx += impulseX * inverseMassB;
    b.vy += impulseY * inverseMassB;
}

function isOutOfBoard(body: Body) {
    return (
        body.x < -body.radius * 0.3 ||
        body.x > BOARD_SIZE + body.radius * 0.3 ||
        body.y < -body.radius * 0.3 ||
        body.y > BOARD_SIZE + body.radius * 0.3
    );
}

function finishBattle(nextWinner: Winner, reason: string) {
    winner.value = nextWinner;
    phase.value = "result";
    isCpuThinking.value = false;
    resetAim();
    lastAction.value = reason;
    battleNote.value = nextWinner === 0 ? "両者落下で引き分けです" : "盤面から落ちた側が敗北です";
    pushLog(reason);
}

function checkFallenBodies() {
    let player1Out = false;
    let player2Out = false;

    for (const piece of pieces.value) {
        if (!piece.fallen && isOutOfBoard(piece)) {
            piece.fallen = true;
            piece.vx = 0;
            piece.vy = 0;
            pushLog(`${piece.name} が盤外へ落下`);

            if (piece.team === 1) {
                player1Out = true;
            } else {
                player2Out = true;
            }
        }
    }

    for (const obstacle of obstacles.value) {
        if (!obstacle.fallen && isOutOfBoard(obstacle)) {
            obstacle.fallen = true;
            obstacle.vx = 0;
            obstacle.vy = 0;
            pushLog("障害物が盤外へ転落");
        }
    }

    if (player1Out && player2Out) {
        finishBattle(0, "両者が同時に落下しました");
    } else if (player1Out) {
        finishBattle(2, `${team1Character.value?.name ?? "Player 1"} が落下`);
    } else if (player2Out) {
        finishBattle(1, `${team2Character.value?.name ?? "Player 2"} が落下`);
    }
}

function bodiesAreSettled() {
    return getBodies().every((body) => Math.hypot(body.vx, body.vy) < STOP_SPEED);
}

function settleBodies() {
    for (const body of getBodies()) {
        body.vx = 0;
        body.vy = 0;
    }
}

function updateSimulation(deltaSeconds: number) {
    if (phase.value !== "simulating") {
        return;
    }

    for (const body of getBodies()) {
        moveBody(body, deltaSeconds);
        applyDrag(body, deltaSeconds);
    }

    const bodies = getBodies();

    for (let pass = 0; pass < 2; pass += 1) {
        for (let index = 0; index < bodies.length; index += 1) {
            for (let nextIndex = index + 1; nextIndex < bodies.length; nextIndex += 1) {
                collideBodies(bodies[index], bodies[nextIndex]);
            }
        }
    }

    checkFallenBodies();

    if (winner.value !== null) {
        return;
    }

    if (bodiesAreSettled()) {
        settleBodies();
        currentTeam.value = currentTeam.value === 1 ? 2 : 1;
        turnCount.value += 1;
        phase.value = "waiting";
        lastAction.value = "すべて停止。次のターンです";
        battleNote.value = "次は別の角度や障害物経由を狙えます";
        pushLog(currentTurnLabel.value);
    }
}

function getBoardPoint(event: PointerEvent) {
    const canvas = boardCanvasRef.value;

    if (!canvas) {
        return null;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_SIZE / rect.width;
    const scaleY = BOARD_SIZE / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
}

function launchPiece(piece: Piece, dragX: number, dragY: number, byCpu = false) {
    const distance = Math.hypot(dragX, dragY);

    if (distance < MIN_DRAG) {
        phase.value = "waiting";
        lastAction.value = "ショットをキャンセルしました";
        battleNote.value = "もっと大きくドラッグすると発射されます";
        resetAim();
        return;
    }

    const limitedDistance = Math.min(distance, piece.maxCharge);
    const normalizedX = dragX / distance;
    const normalizedY = dragY / distance;
    const scatter = (1.16 - piece.grip) * 0.08;
    const angle = Math.atan2(normalizedY, normalizedX) + randomBetween(-scatter, scatter);
    const speed = limitedDistance * BASE_LAUNCH_SPEED * piece.power;

    piece.vx = Math.cos(angle) * speed;
    piece.vy = Math.sin(angle) * speed;
    phase.value = "simulating";
    lastAction.value = `${piece.name} を ${Math.round(speed)} で発射`;
    battleNote.value = byCpu ? "CPU のショット結果を確認中です" : "障害物も一緒に動くので、その後の流れまで見てください";
    pushLog(`${teamLabel(piece.team)} launched ${piece.name}`);
    resetAim();
}

function runCpuTurn() {
    clearCpuTurn();

    if (mode.value !== "cpu" || phase.value !== "waiting" || currentTeam.value !== 2) {
        isCpuThinking.value = false;
        return;
    }

    const cpuPiece = team2Piece.value;
    const enemyPiece = team1Piece.value;

    if (!cpuPiece || !enemyPiece || cpuPiece.fallen || enemyPiece.fallen) {
        isCpuThinking.value = false;
        return;
    }

    const toEnemyX = enemyPiece.x - cpuPiece.x;
    const toEnemyY = enemyPiece.y - cpuPiece.y;
    const enemyDistance = Math.hypot(toEnemyX, toEnemyY) || 1;
    let aimX = toEnemyX / enemyDistance;
    let aimY = toEnemyY / enemyDistance;

    const edgeDistance = Math.min(cpuPiece.x, BOARD_SIZE - cpuPiece.x, cpuPiece.y, BOARD_SIZE - cpuPiece.y);

    if (edgeDistance < 90) {
        const toCenterX = BOARD_CENTER - cpuPiece.x;
        const toCenterY = BOARD_CENTER - cpuPiece.y;
        const centerLength = Math.hypot(toCenterX, toCenterY) || 1;
        aimX = aimX * 0.72 + (toCenterX / centerLength) * 0.28;
        aimY = aimY * 0.72 + (toCenterY / centerLength) * 0.28;
        const mergedLength = Math.hypot(aimX, aimY) || 1;
        aimX /= mergedLength;
        aimY /= mergedLength;
    }

    const enemyEdgeDistance = Math.min(enemyPiece.x, BOARD_SIZE - enemyPiece.x, enemyPiece.y, BOARD_SIZE - enemyPiece.y);
    let charge = clamp(enemyDistance * randomBetween(0.58, 0.82), 120, cpuPiece.maxCharge);

    if (enemyEdgeDistance < 110) {
        charge = Math.min(cpuPiece.maxCharge, charge + 26);
    }

    isCpuThinking.value = false;
    launchPiece(cpuPiece, aimX * charge, aimY * charge, true);
}

function handleBoardPointerDown(event: PointerEvent) {
    if (phase.value !== "waiting" || (mode.value === "cpu" && currentTeam.value === 2)) {
        return;
    }

    const point = getBoardPoint(event);
    const piece = activePiece.value;

    if (!point || !piece || piece.fallen) {
        return;
    }

    if (Math.hypot(point.x - piece.x, point.y - piece.y) > piece.radius + 18) {
        return;
    }

    boardCanvasRef.value?.setPointerCapture(event.pointerId);
    aim.active = true;
    aim.pointerId = event.pointerId;
    aim.pieceId = piece.id;
    aim.x = point.x;
    aim.y = point.y;
    phase.value = "aiming";
    lastAction.value = `${piece.name} のショット角度を調整中`;
}

function handleBoardPointerMove(event: PointerEvent) {
    if (!aim.active || aim.pointerId !== event.pointerId) {
        return;
    }

    const point = getBoardPoint(event);
    if (!point) {
        return;
    }

    aim.x = point.x;
    aim.y = point.y;
}

function handleBoardPointerUp(event: PointerEvent) {
    if (!aim.active || aim.pointerId !== event.pointerId) {
        return;
    }

    const point = getBoardPoint(event);
    const piece = pieces.value.find((entry) => entry.id === aim.pieceId);
    boardCanvasRef.value?.releasePointerCapture(event.pointerId);

    if (!piece || !point) {
        resetAim();
        phase.value = "waiting";
        return;
    }

    launchPiece(piece, point.x - piece.x, point.y - piece.y, false);
}

function handleBoardPointerCancel() {
    if (phase.value === "aiming") {
        phase.value = "waiting";
    }

    resetAim();
}

function drawBackground(context: CanvasRenderingContext2D) {
    const gradient = context.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
    gradient.addColorStop(0, "#0f1a22");
    gradient.addColorStop(0.55, "#142833");
    gradient.addColorStop(1, "#081218");
    context.fillStyle = gradient;
    context.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    context.save();
    context.strokeStyle = "rgba(133, 214, 255, 0.08)";
    context.lineWidth = 1;

    for (let offset = 24; offset < BOARD_SIZE; offset += 36) {
        context.beginPath();
        context.moveTo(offset, 0);
        context.lineTo(offset, BOARD_SIZE);
        context.stroke();

        context.beginPath();
        context.moveTo(0, offset);
        context.lineTo(BOARD_SIZE, offset);
        context.stroke();
    }

    context.restore();

    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.18)";
    context.lineWidth = 4;
    context.strokeRect(2, 2, BOARD_SIZE - 4, BOARD_SIZE - 4);
    context.restore();

    context.save();
    const centerGlow = context.createRadialGradient(BOARD_CENTER, BOARD_CENTER, 0, BOARD_CENTER, BOARD_CENTER, BOARD_SIZE * 0.48);
    centerGlow.addColorStop(0, "rgba(255, 216, 119, 0.16)");
    centerGlow.addColorStop(1, "rgba(255, 216, 119, 0)");
    context.fillStyle = centerGlow;
    context.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    context.restore();
}

function drawSpawnZone(context: CanvasRenderingContext2D, x: number, color: string, label: string) {
    const glow = context.createRadialGradient(x, BOARD_CENTER, 0, x, BOARD_CENTER, 96);
    glow.addColorStop(0, `${color}55`);
    glow.addColorStop(1, `${color}00`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, BOARD_CENTER, 98, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.strokeStyle = `${color}88`;
    context.setLineDash([10, 10]);
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, BOARD_CENTER, 74, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    context.fillStyle = "rgba(255, 247, 226, 0.74)";
    context.font = "700 12px 'Avenir Next', 'Trebuchet MS', sans-serif";
    context.textAlign = "center";
    context.fillText(label, x, BOARD_CENTER - 92);
}

function drawObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
    const hue = 34 + obstacle.tone * 42;

    context.save();
    context.translate(obstacle.x, obstacle.y);

    context.fillStyle = "rgba(0, 0, 0, 0.28)";
    context.beginPath();
    context.ellipse(0, obstacle.radius + 8, obstacle.radius * 0.9, obstacle.radius * 0.36, 0, 0, Math.PI * 2);
    context.fill();

    const fill = context.createRadialGradient(-obstacle.radius * 0.35, -obstacle.radius * 0.4, obstacle.radius * 0.2, 0, 0, obstacle.radius);
    fill.addColorStop(0, `hsla(${hue}, 100%, 82%, 0.95)`);
    fill.addColorStop(0.48, `hsla(${hue}, 95%, 58%, 0.98)`);
    fill.addColorStop(1, `hsla(${hue}, 88%, 30%, 1)`);
    context.fillStyle = fill;
    context.beginPath();
    context.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(255, 255, 255, 0.28)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, 0, obstacle.radius - 2, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(25, 25, 25, 0.4)";
    context.beginPath();
    context.arc(0, 0, obstacle.radius * 0.4, 0, Math.PI * 2);
    context.fill();

    context.restore();
}

function drawPiece(context: CanvasRenderingContext2D, piece: Piece) {
    const image = imageCache[piece.characterId];
    const speed = Math.hypot(piece.vx, piece.vy);
    const ringColor = piece.team === 1 ? "#72d1ff" : "#ffd671";

    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(clamp(piece.vx / 1800, -0.22, 0.22));

    context.fillStyle = "rgba(0, 0, 0, 0.28)";
    context.beginPath();
    context.ellipse(0, piece.radius + 10, piece.radius * 0.96, piece.radius * 0.34, 0, 0, Math.PI * 2);
    context.fill();

    if (currentTeam.value === piece.team && phase.value !== "result") {
        context.strokeStyle = `${ringColor}77`;
        context.lineWidth = 8;
        context.beginPath();
        context.arc(0, 0, piece.radius + 8 + Math.sin(performance.now() / 180) * 1.5, 0, Math.PI * 2);
        context.stroke();
    }

    context.fillStyle = ringColor;
    context.beginPath();
    context.arc(0, 0, piece.radius + 5, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(0, 0, piece.radius, 0, Math.PI * 2);
    context.clip();

    if (image?.complete) {
        context.drawImage(image, -piece.radius, -piece.radius, piece.radius * 2, piece.radius * 2);
    } else {
        const fallback = context.createLinearGradient(-piece.radius, -piece.radius, piece.radius, piece.radius);
        fallback.addColorStop(0, piece.accent);
        fallback.addColorStop(1, "#1e2935");
        context.fillStyle = fallback;
        context.fillRect(-piece.radius, -piece.radius, piece.radius * 2, piece.radius * 2);
    }

    context.restore();

    context.save();
    context.translate(piece.x, piece.y);
    context.strokeStyle = "rgba(255, 255, 255, 0.72)";
    context.lineWidth = 2.5;
    context.beginPath();
    context.arc(0, 0, piece.radius, 0, Math.PI * 2);
    context.stroke();

    if (speed > 40) {
        context.strokeStyle = `${piece.accent}88`;
        context.lineWidth = 5;
        context.beginPath();
        context.arc(0, 0, piece.radius + 10, 0, Math.PI * 2);
        context.stroke();
    }

    context.restore();
}

function drawAimGuide(context: CanvasRenderingContext2D) {
    if (!aim.active || !aim.pieceId) {
        return;
    }

    const piece = pieces.value.find((entry) => entry.id === aim.pieceId);
    if (!piece) {
        return;
    }

    const dx = aim.x - piece.x;
    const dy = aim.y - piece.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 1) {
        return;
    }

    const clampedDistance = Math.min(distance, piece.maxCharge);
    const ratio = clamp(clampedDistance / piece.maxCharge, 0, 1);
    const nx = dx / distance;
    const ny = dy / distance;
    const endX = piece.x + nx * clampedDistance;
    const endY = piece.y + ny * clampedDistance;

    context.save();
    context.strokeStyle = `rgba(255, 255, 255, ${0.3 + ratio * 0.55})`;
    context.lineWidth = 4;
    context.setLineDash([16, 10]);
    context.beginPath();
    context.moveTo(piece.x, piece.y);
    context.lineTo(endX, endY);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = `rgba(255, 214, 113, ${0.3 + ratio * 0.55})`;
    context.beginPath();
    context.arc(endX, endY, 9 + ratio * 10, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#ffd56a";
    context.lineWidth = 6;
    context.beginPath();
    context.arc(piece.x, piece.y, piece.radius + 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    context.stroke();
    context.restore();
}

function drawBoard() {
    const context = boardContext;

    if (!context || !boardCanvasRef.value || phase.value === "draft") {
        return;
    }

    context.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    drawBackground(context);
    drawSpawnZone(context, SPAWN_X, "#72d1ff", "P1 LAUNCH");
    drawSpawnZone(context, BOARD_SIZE - SPAWN_X, "#ffd56a", mode.value === "cpu" ? "CPU LAUNCH" : "P2 LAUNCH");

    for (const obstacle of obstacles.value) {
        if (!obstacle.fallen) {
            drawObstacle(context, obstacle);
        }
    }

    drawAimGuide(context);

    for (const piece of pieces.value) {
        if (!piece.fallen) {
            drawPiece(context, piece);
        }
    }

    context.save();
    context.fillStyle = "rgba(255, 247, 226, 0.65)";
    context.font = "700 14px 'Avenir Next', 'Trebuchet MS', sans-serif";
    context.textAlign = "center";
    context.fillText("DROP ZONE", BOARD_CENTER, 26);
    context.fillText("DROP ZONE", BOARD_CENTER, BOARD_SIZE - 14);
    context.restore();
}

function frame(timestamp: number) {
    const deltaSeconds = lastTimestamp ? Math.min(0.032, (timestamp - lastTimestamp) / 1000) : 0;
    lastTimestamp = timestamp;
    updateSimulation(deltaSeconds);
    drawBoard();
    animationFrame = window.requestAnimationFrame(frame);
}

watch(phase, (nextPhase) => {
    if (nextPhase === "draft") {
        boardContext = null;
        return;
    }

    window.requestAnimationFrame(() => {
        resizeCanvas();
        drawBoard();
    });
});

watch([phase, currentTeam, mode], ([nextPhase, nextTeam, nextMode]) => {
    clearCpuTurn();

    if (nextMode === "cpu" && nextPhase === "waiting" && nextTeam === 2 && winner.value === null) {
        isCpuThinking.value = true;
        cpuTimer = window.setTimeout(() => {
            runCpuTurn();
        }, 720);
        return;
    }

    isCpuThinking.value = false;
});

onMounted(() => {
    stopModeSelectBgm(true);
    randomizeSelections();
    preloadImages();
    updateViewport();
    void playBgm();
    animationFrame = window.requestAnimationFrame(frame);
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    clearCpuTurn();
    stopBgm(true);
    bgm = null;
    window.removeEventListener("resize", handleResize);
    window.cancelAnimationFrame(animationFrame);
});
</script>

<template>
    <section class="omake2-page" @pointerdown.once="handleFirstPointerDown">
        <div class="stage-shell" :style="stageShellStyle">
            <div class="scene" :style="sceneStyle">
                <div class="scene-glow scene-glow--left" />
                <div class="scene-glow scene-glow--right" />

                <header class="topbar">
                    <div class="topbar__title">
                        <p class="eyebrow">Single File Bonus Battle</p>
                        <h1>CEO Eraser Clash</h1>
                        <p class="lede">
                            消しゴムバトル風の押し出し対戦。駒ごとに
                            <strong>打ち出し力 / 重さ / 止まりやすさ / 障害物操作力</strong>
                            が変わります。
                        </p>
                    </div>

                    <div class="topbar__status">
                        <div class="mode-switch">
                            <button
                                class="mode-switch__button"
                                :class="{ 'mode-switch__button--active': mode === 'cpu' }"
                                type="button"
                                @click="mode = 'cpu'"
                            >
                                1P vs CPU
                            </button>
                            <button
                                class="mode-switch__button"
                                :class="{ 'mode-switch__button--active': mode === 'local' }"
                                type="button"
                                @click="mode = 'local'"
                            >
                                2P Local
                            </button>
                        </div>

                        <div class="status-panel">
                            <span class="status-panel__label">{{ currentTurnLabel }}</span>
                            <p class="status-panel__text">{{ boardPrompt }}</p>
                        </div>

                        <button class="music-toggle-button" type="button" @click="handleToggleMusic">
                            {{ musicButtonLabel }}
                        </button>
                    </div>
                </header>

                <main class="scene-body">
                    <aside
                        class="team-panel team-panel--left"
                        :class="{
                            'team-panel--active': phase === 'draft' ? activeSeat === 1 : currentTeam === 1 && phase !== 'result',
                            'team-panel--winner': winner === 1,
                            'team-panel--fallen': team1Piece?.fallen,
                        }"
                    >
                        <div class="team-panel__head">
                            <div>
                                <p class="team-panel__label">PLAYER 1</p>
                                <p class="team-panel__state">{{ getPieceStatus(1) }}</p>
                            </div>

                            <button
                                v-if="phase === 'draft'"
                                class="seat-button"
                                :class="{ 'seat-button--active': activeSeat === 1 }"
                                type="button"
                                @click="selectSeat(1)"
                            >
                                ここを選択
                            </button>
                        </div>

                        <div v-if="team1Character" class="captain-card">
                            <div class="captain-card__art">
                                <img :src="team1Character.image" :alt="team1Character.name" />
                            </div>

                            <div class="captain-card__body">
                                <p class="captain-card__name">{{ team1Character.name }}</p>
                                <p class="captain-card__title">{{ team1Character.title }}</p>
                                <p class="captain-card__trait">{{ team1Character.trait }}</p>
                                <p class="captain-card__desc">{{ team1Character.description }}</p>
                            </div>
                        </div>

                        <div v-else class="captain-placeholder">
                            左側の駒を選んでください
                        </div>

                        <div v-if="team1Character" class="stat-list">
                            <div
                                v-for="stat in getStatBars(team1Character)"
                                :key="stat.key"
                                class="stat-row"
                            >
                                <span>{{ stat.label }}</span>
                                <div class="stat-meter">
                                    <i :style="{ width: stat.width }" />
                                </div>
                                <strong>{{ stat.valueLabel }}</strong>
                            </div>
                        </div>
                    </aside>

                    <section class="center-panel">
                        <div v-if="phase === 'draft'" class="draft-panel">
                            <div class="draft-header">
                                <div>
                                    <p class="eyebrow">Character Draft</p>
                                    <h2>{{ teamLabel(activeSeat) }} に割り当てる駒を選択</h2>
                                </div>

                                <div class="draft-header__notes">
                                    <span>重い駒は押し出しに強い</span>
                                    <span>Grip が高いほど止まりやすい</span>
                                    <span>Obstacle が高いほど障害物を動かしやすい</span>
                                </div>
                            </div>

                            <div class="roster-grid">
                                <button
                                    v-for="character in characters"
                                    :key="character.id"
                                    class="roster-card"
                                    :style="{ '--accent': character.accent }"
                                    type="button"
                                    @click="assignCharacter(character.id)"
                                >
                                    <div class="roster-card__art">
                                        <img :src="character.image" :alt="character.name" />
                                    </div>

                                    <div class="roster-card__body">
                                        <p class="roster-card__name">{{ character.name }}</p>
                                        <p class="roster-card__title">{{ character.title }}</p>
                                        <p class="roster-card__trait">{{ character.trait }}</p>
                                        <div class="roster-mini-stats">
                                            <span>P {{ Math.round(character.stats.power * 100) }}</span>
                                            <span>W {{ Math.round(character.stats.weight * 100) }}</span>
                                            <span>G {{ Math.round(character.stats.grip * 100) }}</span>
                                            <span>O {{ Math.round(character.stats.obstacle * 100) }}</span>
                                        </div>
                                    </div>

                                    <div v-if="selections[1] === character.id" class="pick-badge pick-badge--left">
                                        P1
                                    </div>
                                    <div v-if="selections[2] === character.id" class="pick-badge pick-badge--right">
                                        {{ mode === "cpu" ? "CPU" : "P2" }}
                                    </div>
                                </button>
                            </div>

                            <div class="draft-actions">
                                <button class="action-button action-button--ghost" type="button" @click="goModeSelect">
                                    モードセレクトへ
                                </button>
                                <button class="action-button action-button--ghost" type="button" @click="randomizeSelections">
                                    ランダム編成
                                </button>
                                <button class="action-button action-button--ghost" type="button" @click="swapSelections">
                                    左右入れ替え
                                </button>
                                <button
                                    class="action-button"
                                    type="button"
                                    :disabled="!canStartBattle"
                                    @click="startBattle"
                                >
                                    バトル開始
                                </button>
                            </div>
                        </div>

                        <div v-else class="battle-panel">
                            <div class="battle-stage">
                                <canvas
                                    ref="boardCanvasRef"
                                    class="battle-canvas"
                                    @contextmenu.prevent
                                    @pointerdown.prevent="handleBoardPointerDown"
                                    @pointermove.prevent="handleBoardPointerMove"
                                    @pointerup.prevent="handleBoardPointerUp"
                                    @pointercancel.prevent="handleBoardPointerCancel"
                                />

                                <div v-if="isCpuThinking && phase === 'waiting'" class="overlay overlay--mini">
                                    <p class="eyebrow">CPU Thinking</p>
                                    <h3>角度を調整中</h3>
                                </div>

                                <div v-if="phase === 'result'" class="overlay overlay--result">
                                    <p class="eyebrow">Match Result</p>
                                    <h2>{{ winnerHeadline }}</h2>
                                    <p>{{ winnerSubline }}</p>

                                    <div class="overlay__actions">
                                        <button class="action-button" type="button" @click="rematch">
                                            同じキャラで再戦
                                        </button>
                                        <button class="action-button action-button--ghost" type="button" @click="openDraft">
                                            ドラフトに戻る
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="battle-hud">
                                <div class="battle-hud__chips">
                                    <span class="hud-chip">Turn {{ turnCount }}</span>
                                    <span class="hud-chip">障害物 {{ livingObstacleCount }}</span>
                                    <span class="hud-chip">
                                        {{ phase === "aiming" ? `Power ${Math.round(aimRatio * 100)}%` : currentTurnLabel }}
                                    </span>
                                </div>
                                <p class="battle-hud__main">{{ lastAction }}</p>
                                <p class="battle-hud__sub">{{ battleNote }}</p>
                            </div>
                        </div>
                    </section>

                    <aside
                        class="team-panel team-panel--right"
                        :class="{
                            'team-panel--active': phase === 'draft' ? activeSeat === 2 : currentTeam === 2 && phase !== 'result',
                            'team-panel--winner': winner === 2,
                            'team-panel--fallen': team2Piece?.fallen,
                        }"
                    >
                        <div class="team-panel__head">
                            <div>
                                <p class="team-panel__label">{{ mode === "cpu" ? "CPU" : "PLAYER 2" }}</p>
                                <p class="team-panel__state">{{ getPieceStatus(2) }}</p>
                            </div>

                            <button
                                v-if="phase === 'draft'"
                                class="seat-button"
                                :class="{ 'seat-button--active': activeSeat === 2 }"
                                type="button"
                                @click="selectSeat(2)"
                            >
                                ここを選択
                            </button>
                        </div>

                        <div v-if="team2Character" class="captain-card">
                            <div class="captain-card__art">
                                <img :src="team2Character.image" :alt="team2Character.name" />
                            </div>

                            <div class="captain-card__body">
                                <p class="captain-card__name">{{ team2Character.name }}</p>
                                <p class="captain-card__title">{{ team2Character.title }}</p>
                                <p class="captain-card__trait">{{ team2Character.trait }}</p>
                                <p class="captain-card__desc">{{ team2Character.description }}</p>
                            </div>
                        </div>

                        <div v-else class="captain-placeholder">
                            {{ mode === "cpu" ? "CPU 側の駒を選んでください" : "右側の駒を選んでください" }}
                        </div>

                        <div v-if="team2Character" class="stat-list">
                            <div
                                v-for="stat in getStatBars(team2Character)"
                                :key="stat.key"
                                class="stat-row"
                            >
                                <span>{{ stat.label }}</span>
                                <div class="stat-meter">
                                    <i :style="{ width: stat.width }" />
                                </div>
                                <strong>{{ stat.valueLabel }}</strong>
                            </div>
                        </div>

                        <div class="log-box">
                            <p class="log-box__title">Battle Log</p>
                            <ul>
                                <li v-for="(entry, index) in logEntries" :key="`${index}-${entry}`">{{ entry }}</li>
                            </ul>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    </section>
</template>

<style scoped>
.omake2-page {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background:
        radial-gradient(circle at 12% 16%, rgb(102 200 255 / 0.18), transparent 32%),
        radial-gradient(circle at 86% 14%, rgb(255 210 98 / 0.18), transparent 28%),
        linear-gradient(180deg, #0a1016 0%, #111c24 52%, #06090d 100%);
    color: #fff6e4;
    font-family: "Avenir Next", "Trebuchet MS", "Hiragino Sans", sans-serif;
}

.stage-shell {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 34px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02)),
        linear-gradient(135deg, rgb(12 18 24 / 0.96), rgb(17 29 36 / 0.98));
    border: 1px solid rgb(255 255 255 / 0.08);
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.06),
        0 30px 90px rgb(0 0 0 / 0.38);
}

.scene-glow {
    position: absolute;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    filter: blur(24px);
    pointer-events: none;
}

.scene-glow--left {
    left: -80px;
    top: 280px;
    background: rgb(93 193 255 / 0.16);
}

.scene-glow--right {
    right: -80px;
    top: 180px;
    background: rgb(255 197 82 / 0.15);
}

.topbar {
    position: absolute;
    inset: 28px 28px auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 22px;
    align-items: start;
    z-index: 2;
}

.eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgb(255 244 216 / 0.7);
}

.topbar__title h1 {
    margin: 8px 0 10px;
    font-size: 52px;
    line-height: 0.94;
    letter-spacing: -0.06em;
}

.lede {
    margin: 0;
    max-width: 760px;
    font-size: 15px;
    line-height: 1.45;
    color: rgb(255 245 222 / 0.78);
}

.topbar__status {
    display: grid;
    gap: 16px;
    justify-items: end;
}

.mode-switch {
    display: inline-flex;
    padding: 5px;
    gap: 6px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.05);
    border: 1px solid rgb(255 255 255 / 0.08);
}

.mode-switch__button,
.seat-button,
.action-button {
    border: none;
    cursor: pointer;
    font: inherit;
}

.mode-switch__button {
    min-width: 126px;
    padding: 10px 16px;
    border-radius: 999px;
    color: rgb(255 244 216 / 0.72);
    background: transparent;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;
}

.mode-switch__button--active {
    color: #281606;
    background: linear-gradient(135deg, #fff0c1, #ffc65b 58%, #ff9856 100%);
    box-shadow:
        0 10px 20px rgb(255 165 84 / 0.2),
        inset 0 1px 0 rgb(255 255 255 / 0.6);
}

.status-panel {
    min-width: 360px;
    padding: 16px 18px 17px;
    border-radius: 24px;
    text-align: right;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(14 20 28 / 0.9), rgb(9 14 18 / 0.94));
    border: 1px solid rgb(255 255 255 / 0.08);
}

.status-panel__label {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0.16em;
    color: #ffe4a7;
    background: rgb(255 197 88 / 0.12);
}

.status-panel__text {
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.45;
    color: rgb(255 245 222 / 0.78);
}

.music-toggle-button {
    min-width: 148px;
    padding: 12px 16px;
    border: 1px solid rgb(255 255 255 / 0.1);
    border-radius: 999px;
    color: rgb(255 245 222 / 0.82);
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.14em;
    cursor: pointer;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(14 20 28 / 0.9), rgb(9 14 18 / 0.94));
    box-shadow:
        0 10px 20px rgb(0 0 0 / 0.18),
        inset 0 1px 0 rgb(255 255 255 / 0.08);
    transition:
        transform 0.18s ease,
        filter 0.18s ease;
}

.music-toggle-button:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
}

.music-toggle-button:active {
    transform: scale(0.98);
}

.scene-body {
    position: absolute;
    inset: 150px 28px 28px;
    display: grid;
    grid-template-columns: 292px minmax(0, 1fr) 292px;
    gap: 18px;
}

.team-panel,
.center-panel {
    min-height: 0;
}

.team-panel {
    display: grid;
    grid-template-rows: auto auto auto minmax(0, 1fr);
    gap: 14px;
    padding: 18px;
    border-radius: 28px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(9 13 18 / 0.95), rgb(13 19 24 / 0.98));
    border: 1px solid rgb(255 255 255 / 0.08);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
    overflow: hidden;
}

.team-panel--active {
    border-color: rgb(255 213 106 / 0.34);
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.08),
        0 0 0 1px rgb(255 213 106 / 0.18);
}

.team-panel--winner {
    background:
        linear-gradient(180deg, rgb(255 226 148 / 0.12), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(9 13 18 / 0.95), rgb(13 19 24 / 0.98));
}

.team-panel--fallen {
    opacity: 0.72;
}

.team-panel__head {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
}

.team-panel__label,
.team-panel__state,
.captain-card__name,
.captain-card__title,
.captain-card__trait,
.captain-card__desc {
    margin: 0;
}

.team-panel__label {
    font-size: 12px;
    letter-spacing: 0.2em;
    color: rgb(255 244 216 / 0.68);
}

.team-panel__state {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 800;
}

.seat-button {
    padding: 10px 14px;
    border-radius: 999px;
    color: rgb(255 246 226 / 0.8);
    background: rgb(255 255 255 / 0.06);
}

.seat-button--active {
    color: #241200;
    background: linear-gradient(135deg, #fff0c5, #ffcb67 60%, #ff9958 100%);
}

.captain-card {
    display: grid;
    gap: 12px;
}

.captain-card__art {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 24px;
    background:
        radial-gradient(circle at 30% 20%, rgb(255 224 128 / 0.22), transparent 30%),
        linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02));
    border: 1px solid rgb(255 255 255 / 0.08);
}

.captain-card__art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.captain-card__body {
    display: grid;
    gap: 4px;
}

.captain-card__name {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.04em;
}

.captain-card__title {
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgb(255 236 189 / 0.66);
}

.captain-card__trait {
    font-size: 15px;
    font-weight: 700;
    color: #ffd98f;
}

.captain-card__desc {
    font-size: 13px;
    line-height: 1.45;
    color: rgb(255 245 222 / 0.74);
}

.captain-placeholder {
    display: grid;
    place-items: center;
    min-height: 268px;
    text-align: center;
    border-radius: 24px;
    border: 1px dashed rgb(255 255 255 / 0.16);
    color: rgb(255 245 222 / 0.54);
    background: rgb(255 255 255 / 0.03);
}

.stat-list {
    display: grid;
    gap: 8px;
}

.stat-row {
    display: grid;
    grid-template-columns: 52px 1fr 46px;
    align-items: center;
    gap: 10px;
    font-size: 13px;
}

.stat-row strong {
    justify-self: end;
    font-size: 12px;
    color: rgb(255 228 160 / 0.86);
}

.stat-meter {
    height: 10px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.08);
    overflow: hidden;
}

.stat-meter i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #70d8ff, #ffe183 60%, #ff9d59 100%);
}

.log-box {
    align-self: end;
    min-height: 0;
    padding: 16px;
    border-radius: 22px;
    background: rgb(255 255 255 / 0.04);
    border: 1px solid rgb(255 255 255 / 0.06);
}

.log-box__title {
    margin: 0 0 12px;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgb(255 239 194 / 0.68);
}

.log-box ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
}

.log-box li {
    font-size: 13px;
    line-height: 1.4;
    color: rgb(255 245 222 / 0.74);
}

.center-panel {
    min-width: 0;
    border-radius: 30px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02)),
        linear-gradient(180deg, rgb(10 16 21 / 0.92), rgb(14 21 28 / 0.98));
    border: 1px solid rgb(255 255 255 / 0.08);
    overflow: hidden;
}

.draft-panel,
.battle-panel {
    height: 100%;
    padding: 22px;
    box-sizing: border-box;
}

.draft-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 18px;
}

.draft-header {
    display: grid;
    gap: 12px;
}

.draft-header h2 {
    margin: 8px 0 0;
    font-size: 28px;
    letter-spacing: -0.04em;
}

.draft-header__notes {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.draft-header__notes span {
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    color: rgb(255 244 216 / 0.78);
    background: rgb(255 255 255 / 0.05);
    border: 1px solid rgb(255 255 255 / 0.08);
}

.roster-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.roster-card {
    position: relative;
    min-width: 0;
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    text-align: left;
    color: inherit;
    border: 1px solid rgb(255 255 255 / 0.08);
    border-radius: 22px;
    background:
        radial-gradient(circle at 18% 10%, var(--accent), transparent 34%),
        linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.02));
    overflow: hidden;
    cursor: pointer;
    transition:
        transform 0.18s ease,
        border-color 0.18s ease,
        box-shadow 0.18s ease;
}

.roster-card:hover {
    transform: translateY(-2px);
    border-color: rgb(255 213 106 / 0.28);
    box-shadow: 0 14px 24px rgb(0 0 0 / 0.16);
}

.roster-card__art {
    border-radius: 16px;
    overflow: hidden;
    background: rgb(255 255 255 / 0.05);
}

.roster-card__art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.roster-card__body {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: 4px;
}

.roster-card__name,
.roster-card__title,
.roster-card__trait {
    margin: 0;
}

.roster-card__name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.04em;
}

.roster-card__title {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgb(255 240 206 / 0.64);
}

.roster-card__trait {
    font-size: 13px;
    color: #ffd98b;
}

.roster-mini-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
    font-size: 11px;
    color: rgb(255 244 216 / 0.7);
}

.pick-badge {
    position: absolute;
    top: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #201000;
    background: linear-gradient(135deg, #fff0c1, #ffc65b 60%, #ff9956 100%);
}

.pick-badge--left {
    left: 10px;
}

.pick-badge--right {
    right: 10px;
}

.draft-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 164px;
    padding: 14px 20px;
    border-radius: 999px;
    color: #241200;
    font-size: 15px;
    font-weight: 800;
    background: linear-gradient(135deg, #fff0c1, #ffca63 58%, #ff9856 100%);
    box-shadow:
        0 14px 24px rgb(255 166 84 / 0.22),
        inset 0 1px 0 rgb(255 255 255 / 0.58);
}

.action-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.action-button--ghost {
    color: rgb(255 244 216 / 0.78);
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(17 26 33 / 0.9), rgb(10 16 21 / 0.95));
    box-shadow:
        0 12px 20px rgb(0 0 0 / 0.14),
        inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.battle-panel {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 18px;
}

.battle-stage {
    position: relative;
    display: grid;
    place-items: center;
    padding: 14px;
    border-radius: 28px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.02)),
        linear-gradient(180deg, rgb(9 14 18 / 0.92), rgb(6 10 14 / 0.98));
    border: 1px solid rgb(255 255 255 / 0.06);
}

.battle-canvas {
    width: 680px;
    height: 680px;
    border-radius: 26px;
    display: block;
    touch-action: none;
    user-select: none;
    cursor: grab;
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.08),
        0 24px 46px rgb(0 0 0 / 0.24);
}

.overlay {
    position: absolute;
    display: grid;
    place-items: center;
    text-align: center;
    z-index: 3;
}

.overlay--mini {
    right: 32px;
    top: 28px;
    gap: 8px;
    padding: 18px 20px;
    border-radius: 22px;
    background: rgb(8 12 16 / 0.72);
    border: 1px solid rgb(255 255 255 / 0.08);
    backdrop-filter: blur(8px);
}

.overlay--mini h3 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.03em;
}

.overlay--result {
    inset: 0;
    align-content: center;
    gap: 16px;
    padding: 32px;
    background:
        radial-gradient(circle at center, rgb(9 14 18 / 0.2), rgb(6 10 14 / 0.76) 70%),
        linear-gradient(180deg, rgb(6 10 14 / 0.38), rgb(6 10 14 / 0.64));
    backdrop-filter: blur(8px);
}

.overlay--result h2,
.overlay--result p {
    margin: 0;
}

.overlay--result h2 {
    font-size: 58px;
    line-height: 0.92;
    letter-spacing: -0.06em;
}

.overlay--result p {
    max-width: 520px;
    font-size: 16px;
    line-height: 1.5;
    color: rgb(255 245 222 / 0.76);
}

.overlay__actions {
    display: flex;
    gap: 12px;
}

.battle-hud {
    padding: 18px 20px 20px;
    border-radius: 24px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.03)),
        linear-gradient(180deg, rgb(12 19 24 / 0.94), rgb(9 14 18 / 0.98));
    border: 1px solid rgb(255 255 255 / 0.08);
}

.battle-hud__chips {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.hud-chip {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0.14em;
    color: #fff0c2;
    background: rgb(255 210 107 / 0.12);
}

.battle-hud__main,
.battle-hud__sub {
    margin: 12px 0 0;
}

.battle-hud__main {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.03em;
}

.battle-hud__sub {
    font-size: 14px;
    line-height: 1.45;
    color: rgb(255 245 222 / 0.74);
}
</style>
