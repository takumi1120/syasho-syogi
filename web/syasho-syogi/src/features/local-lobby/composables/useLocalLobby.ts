import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  CPU_BOSS_IMAGE_SRC,
  CPU_BOSS_NAME,
  CPU_LEVELS,
  CPU_OPPONENT_NAME,
  DEFAULT_CPU_LEVEL,
  type CpuDifficultyLevel,
} from "../../battle/utils/cpuConfig";

const STORAGE_KEYS = {
  p1Name: "localP1Name",
  p2Name: "localP2Name",
  p1Character: "localP1Character",
  p2Character: "localP2Character",
} as const;

const CHARACTER_IMAGE_MAP: Record<string, string> = {
  "ティムクック": "/characters/thim.png",
  "サムアルトマン": "/characters/sum.png",
  "Kプラチナム代表": "/characters/kceo.png",
  "スティーブ・ジョブズ": "/characters/jobs.png",
  "ビル・ゲイツ": "/characters/bil.png",
  "イーロン・マスク": "/characters/elon.png",
};

export const LOCAL_CHARACTER_OPTIONS = [
  { label: "未選択", value: "" },
  { label: "ティムクック", value: "ティムクック" },
  { label: "サムアルトマン", value: "サムアルトマン" },
  { label: "Kプラチナム代表", value: "Kプラチナム代表" },
  { label: "スティーブ・ジョブズ", value: "スティーブ・ジョブズ" },
  { label: "ビル・ゲイツ", value: "ビル・ゲイツ" },
  { label: "イーロン・マスク", value: "イーロン・マスク" },
] as const;

function readStorage(key: string, fallback = "") {
  return localStorage.getItem(key) ?? fallback;
}

function resolveCharacterImage(characterName: string): string {
  const trimmed = characterName.trim();
  if (!trimmed) return "";
  return CHARACTER_IMAGE_MAP[trimmed] ?? "";
}

function randomizeOrder<T>(first: T, second: T): [T, T] {
  return Math.random() < 0.5 ? [first, second] : [second, first];
}

type CpuBattleEntry = {
  role: "human" | "cpu";
  name: string;
  character: string;
  image: string;
};

export function useLocalLobby() {
  const router = useRouter();

  const player1Name = ref(readStorage(STORAGE_KEYS.p1Name, "Player 1"));
  const player2Name = ref(readStorage(STORAGE_KEYS.p2Name, "Player 2"));

  const player1Character = ref(readStorage(STORAGE_KEYS.p1Character, ""));
  const player2Character = ref(readStorage(STORAGE_KEYS.p2Character, ""));
  const selectedCpuLevel = ref<CpuDifficultyLevel>(DEFAULT_CPU_LEVEL);

  const enableNameValidation = ref(false);

  watch(player1Name, (value) => {
    localStorage.setItem(STORAGE_KEYS.p1Name, value);
  });

  watch(player2Name, (value) => {
    localStorage.setItem(STORAGE_KEYS.p2Name, value);
  });

  watch(player1Character, (value) => {
    localStorage.setItem(STORAGE_KEYS.p1Character, value);
  });

  watch(player2Character, (value) => {
    localStorage.setItem(STORAGE_KEYS.p2Character, value);
  });

  const trimmedPlayer1Name = computed(() => player1Name.value.trim());
  const trimmedPlayer2Name = computed(() => player2Name.value.trim());

  const trimmedPlayer1Character = computed(() => player1Character.value.trim());
  const trimmedPlayer2Character = computed(() => player2Character.value.trim());

  const canStart = computed(() => {
    return (
      trimmedPlayer1Name.value.length > 0 &&
      trimmedPlayer2Name.value.length > 0 &&
      trimmedPlayer1Character.value.length > 0 &&
      trimmedPlayer2Character.value.length > 0
    );
  });

  const canStartCpu = computed(() => {
    return trimmedPlayer1Name.value.length > 0 && trimmedPlayer1Character.value.length > 0;
  });

  function swapPlayers() {
    const p1Name = player1Name.value;
    const p2Name = player2Name.value;
    const p1Character = player1Character.value;
    const p2Character = player2Character.value;

    player1Name.value = p2Name;
    player2Name.value = p1Name;
    player1Character.value = p2Character;
    player2Character.value = p1Character;
  }

  function clearInputs() {
    player1Name.value = "Player 1";
    player2Name.value = "Player 2";
    player1Character.value = "";
    player2Character.value = "";
    enableNameValidation.value = false;
  }

  function startLocalBattle() {
    enableNameValidation.value = true;

    if (!canStart.value) return;

    const player1Entry = {
      name: trimmedPlayer1Name.value,
      character: trimmedPlayer1Character.value,
      image: resolveCharacterImage(trimmedPlayer1Character.value),
    };
    const player2Entry = {
      name: trimmedPlayer2Name.value,
      character: trimmedPlayer2Character.value,
      image: resolveCharacterImage(trimmedPlayer2Character.value),
    };
    const [firstPlayer, secondPlayer] = randomizeOrder(player1Entry, player2Entry);

    router.push({
      path: "/battle",
      query: {
        mode: "LOCAL",
        p1Name: firstPlayer.name,
        p2Name: secondPlayer.name,
        p1Character: firstPlayer.character,
        p2Character: secondPlayer.character,
        ...(firstPlayer.image ? { p1CharacterImage: firstPlayer.image } : {}),
        ...(secondPlayer.image ? { p2CharacterImage: secondPlayer.image } : {}),
      },
    });
  }

  function setCpuLevel(level: CpuDifficultyLevel) {
    selectedCpuLevel.value = level;
  }

  function startCpuBattle() {
    enableNameValidation.value = true;

    if (!canStartCpu.value) return;

    const humanEntry: CpuBattleEntry = {
      role: "human" as const,
      name: trimmedPlayer1Name.value,
      character: trimmedPlayer1Character.value,
      image: resolveCharacterImage(trimmedPlayer1Character.value),
    };
    const cpuEntry: CpuBattleEntry = {
      role: "cpu" as const,
      name: CPU_OPPONENT_NAME,
      character: CPU_BOSS_NAME,
      image: CPU_BOSS_IMAGE_SRC,
    };
    const [firstPlayer, secondPlayer] = randomizeOrder(humanEntry, cpuEntry);
    const cpuPlayer = firstPlayer.role === "cpu" ? 1 : 2;

    router.push({
      path: "/battle",
      query: {
        mode: "CPU",
        cpuLevel: String(selectedCpuLevel.value),
        cpuPlayer: String(cpuPlayer),
        p1Name: firstPlayer.name,
        p2Name: secondPlayer.name,
        p1Character: firstPlayer.character,
        p2Character: secondPlayer.character,
        ...(firstPlayer.image ? { p1CharacterImage: firstPlayer.image } : {}),
        ...(secondPlayer.image ? { p2CharacterImage: secondPlayer.image } : {}),
      },
    });
  }

  return {
    player1Name,
    player2Name,
    player1Character,
    player2Character,
    enableNameValidation,

    trimmedPlayer1Name,
    trimmedPlayer2Name,
    trimmedPlayer1Character,
    trimmedPlayer2Character,
    canStart,
    canStartCpu,

    characterOptions: LOCAL_CHARACTER_OPTIONS,
    cpuLevels: CPU_LEVELS,
    selectedCpuLevel,

    swapPlayers,
    clearInputs,
    startLocalBattle,
    startCpuBattle,
    setCpuLevel,
  };
}
