import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const STORAGE_KEYS = {
  p1Name: "localP1Name",
  p2Name: "localP2Name",
  p1Character: "localP1Character",
  p2Character: "localP2Character",
} as const;

function readStorage(key: string, fallback = "") {
  return localStorage.getItem(key) ?? fallback;
}

export function useLocalLobby() {
  const router = useRouter();

  const player1Name = ref(readStorage(STORAGE_KEYS.p1Name, "Player 1"));
  const player2Name = ref(readStorage(STORAGE_KEYS.p2Name, "Player 2"));

  const player1Character = ref(readStorage(STORAGE_KEYS.p1Character, ""));
  const player2Character = ref(readStorage(STORAGE_KEYS.p2Character, ""));

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
    return trimmedPlayer1Name.value.length > 0 && trimmedPlayer2Name.value.length > 0;
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

    router.push({
      path: "/battle",
      query: {
        mode: "LOCAL",
        p1Name: trimmedPlayer1Name.value,
        p2Name: trimmedPlayer2Name.value,
        p1Character: trimmedPlayer1Character.value,
        p2Character: trimmedPlayer2Character.value,
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

    swapPlayers,
    clearInputs,
    startLocalBattle,
  };
}