import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  applySyahoShogiAction,
  createInitialSyahoShogiState,
  getLegalDropsForPiece,
  getLegalMovesFrom,
  isPlayerInCheck,
  type SyahoShogiAction,
  type SyahoShogiHandPieceType,
  type SyahoShogiPieceType,
  type SyahoShogiPlayer,
  type SyahoShogiSquare,
} from "../../../lib/syahosyogi";
import { playCheckSe, playMoveSe } from "../utils/battleSe";
import { getHandLabel, getPieceLabel } from "../utils/battleLabels";
import { clampCpuLevel } from "../utils/cpuConfig";
import { pickCpuAction } from "../utils/cpuEngine";
import { getHandPieceImageSrc } from "../utils/pieceImages";

type BattleHandPieceView = {
  pieceType: SyahoShogiHandPieceType;
  label: string;
  imageSrc: string;
  count: number;
  active: boolean;
  disabled: boolean;
};

const HAND_PIECE_TYPES: SyahoShogiHandPieceType[] = ["SON", "MIKITANI", "MIZOGUCHI"];

function readStringQuery(
  query: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = query[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

function readPlayerQuery(
  query: Record<string, unknown>,
  key: string,
  fallback: SyahoShogiPlayer,
): SyahoShogiPlayer {
  const value = query[key];
  if (value === 1 || value === "1") return 1;
  if (value === 2 || value === "2") return 2;
  return fallback;
}

function getActionPieceLabel(pieceType: SyahoShogiPieceType | SyahoShogiHandPieceType) {
  return getPieceLabel({ type: pieceType });
}

export function useLocalBattle() {
  const route = useRoute();
  const router = useRouter();

  const mode = readStringQuery(route.query, "mode", "LOCAL").toUpperCase() === "CPU"
    ? ("CPU" as const)
    : ("LOCAL" as const);

  const player1Name = computed(() => readStringQuery(route.query, "p1Name", "Player 1"));
  const player2Name = computed(() => readStringQuery(route.query, "p2Name", "Player 2"));
  const player1Character = computed(() => readStringQuery(route.query, "p1Character", ""));
  const player2Character = computed(() => readStringQuery(route.query, "p2Character", ""));
  const player1CharacterImage = computed(() =>
    readStringQuery(route.query, "p1CharacterImage", ""),
  );
  const player2CharacterImage = computed(() =>
    readStringQuery(route.query, "p2CharacterImage", ""),
  );
  const cpuBattleEnabled = computed(() => mode === "CPU");
  const cpuPlayer = computed<SyahoShogiPlayer>(() => readPlayerQuery(route.query, "cpuPlayer", 2));
  const cpuLevel = computed(() => clampCpuLevel(readStringQuery(route.query, "cpuLevel", "")));

  const state = ref(
    createInitialSyahoShogiState({
      player1BossCharacter: player1Character.value || null,
      player2BossCharacter: player2Character.value || null,
      player1BossImage: player1CharacterImage.value || null,
      player2BossImage: player2CharacterImage.value || null,
    }),
  );

  const selectedSquare = ref<SyahoShogiSquare | null>(null);
  const selectedHandPiece = ref<SyahoShogiHandPieceType | null>(null);
  const message = ref("");
  const errorMessage = ref("");
  const cpuThinking = ref(false);
  let cpuMoveTimer: number | null = null;

  const battleState = computed(() => state.value);
  const boardRows = computed(() => state.value.board);
  const currentPlayer = computed(() => state.value.currentPlayer);

  const currentTurnName = computed(() => {
    return currentPlayer.value === 1 ? player1Name.value : player2Name.value;
  });

  const winnerName = computed(() => {
    if (state.value.winner === 1) return player1Name.value;
    if (state.value.winner === 2) return player2Name.value;
    return "";
  });

  const resultLabel = computed(() => {
    if (state.value.status !== "FINISHED" || !winnerName.value) return null;
    return `${winnerName.value} の勝ち`;
  });

  const winReasonLabel = computed(() => {
    if (state.value.winReason === "CAPTURE_BOSS") return "社長を取って勝利";
    if (state.value.winReason === "TRY") return "トライ成功";
    return null;
  });

  const checkLabel = computed(() => {
    if (state.value.status !== "PLAYING") return null;
    return isPlayerInCheck(state.value, state.value.currentPlayer) ? "王手" : null;
  });

  const lastActionLabel = computed(() => {
    const action = state.value.lastAction;
    if (!action) return null;

    const actorName = action.player === 1 ? player1Name.value : player2Name.value;

    if (action.kind === "MOVE") {
      const from = `${action.from.row + 1}-${action.from.col + 1}`;
      const to = `${action.to.row + 1}-${action.to.col + 1}`;
      const captured = action.capturedPieceType
        ? ` / 取得: ${getActionPieceLabel(action.capturedPieceType)}`
        : "";
      const promoted = action.promoted ? " / 成り" : "";

      return `${actorName}: ${getActionPieceLabel(action.pieceType)} ${from} → ${to}${captured}${promoted}`;
    }

    return `${actorName}: ${getHandLabel(action.pieceType)} を ${action.to.row + 1}-${action.to.col + 1} に打つ`;
  });

  const currentPlayerHands = computed(() => {
    return state.value.hands[currentPlayer.value];
  });

  function isCpuControlledPlayer(player: SyahoShogiPlayer): boolean {
    return cpuBattleEnabled.value && player === cpuPlayer.value;
  }

  function isInteractionLocked(): boolean {
    return (
      state.value.status === "FINISHED" ||
      cpuThinking.value ||
      isCpuControlledPlayer(currentPlayer.value)
    );
  }

  function buildHandPieces(player: SyahoShogiPlayer): BattleHandPieceView[] {
    const hands = state.value.hands[player];
    const isTurnPlayer = currentPlayer.value === player;
    const canSelectThisHand =
      isTurnPlayer &&
      state.value.status !== "FINISHED" &&
      !cpuThinking.value &&
      !isCpuControlledPlayer(player);

    return HAND_PIECE_TYPES.map((pieceType) => {
      const count = hands[pieceType] ?? 0;

      return {
        pieceType,
        label: getHandLabel(pieceType),
        imageSrc: getHandPieceImageSrc(pieceType),
        count,
        active: canSelectThisHand && selectedHandPiece.value === pieceType,
        disabled: count <= 0 || !canSelectThisHand,
      };
    });
  }

  const player1HandPieces = computed<BattleHandPieceView[]>(() => buildHandPieces(1));
  const player2HandPieces = computed<BattleHandPieceView[]>(() => buildHandPieces(2));

  const handPieces = computed<BattleHandPieceView[]>(() => {
    return currentPlayer.value === 1 ? player1HandPieces.value : player2HandPieces.value;
  });

  const legalTargets = computed<SyahoShogiSquare[]>(() => {
    if (
      state.value.status === "FINISHED" ||
      cpuThinking.value ||
      isCpuControlledPlayer(currentPlayer.value)
    ) {
      return [];
    }

    if (selectedHandPiece.value) {
      return getLegalDropsForPiece(
        state.value,
        selectedHandPiece.value,
        currentPlayer.value,
      ).map((action) => action.to);
    }

    if (selectedSquare.value) {
      return getLegalMovesFrom(
        state.value,
        selectedSquare.value,
        currentPlayer.value,
      ).map((action) => action.to);
    }

    return [];
  });

  function clearNotice() {
    message.value = "";
    errorMessage.value = "";
  }

  function clearSelection() {
    selectedSquare.value = null;
    selectedHandPiece.value = null;
  }

  function clearCpuMoveTimer() {
    if (cpuMoveTimer !== null) {
      window.clearTimeout(cpuMoveTimer);
      cpuMoveTimer = null;
    }
  }

  function playActionSe(nextState: typeof state.value) {
    playMoveSe();

    if (nextState.status !== "FINISHED" && isPlayerInCheck(nextState, nextState.currentPlayer)) {
      window.setTimeout(() => {
        playCheckSe();
      }, 120);
    }
  }

  function submitLocalAction(action: SyahoShogiAction) {
    clearNotice();

    const result = applySyahoShogiAction(state.value, action);

    if (!result.ok) {
      errorMessage.value = result.error;
      return false;
    }

    state.value = result.state;

    if (action.kind === "DROP" || action.kind === "MOVE") {
      playActionSe(result.state);
    }

    if (result.state.status === "FINISHED") {
      message.value = `${winnerName.value} の勝ちです`;
    }

    return true;
  }

  function executeCpuTurn() {
    cpuMoveTimer = null;

    if (
      !cpuBattleEnabled.value ||
      state.value.status !== "PLAYING" ||
      state.value.currentPlayer !== cpuPlayer.value
    ) {
      cpuThinking.value = false;
      return;
    }

    clearSelection();

    const action = pickCpuAction(state.value, cpuLevel.value);
    cpuThinking.value = false;

    if (!action) {
      errorMessage.value = "CPUが指せる手がありません";
      return;
    }

    submitLocalAction(action);
  }

  function getCpuDelayMs(level: number): number {
    return Math.min(260 + level * 35, 640);
  }

  function queueCpuTurnIfNeeded() {
    clearCpuMoveTimer();

    if (
      !cpuBattleEnabled.value ||
      state.value.status !== "PLAYING" ||
      state.value.currentPlayer !== cpuPlayer.value
    ) {
      cpuThinking.value = false;
      return;
    }

    clearSelection();
    cpuThinking.value = true;
    cpuMoveTimer = window.setTimeout(() => {
      executeCpuTurn();
    }, getCpuDelayMs(cpuLevel.value));
  }

  function handleHandClick(pieceType: SyahoShogiHandPieceType) {
    if (isInteractionLocked()) return;
    if ((currentPlayerHands.value[pieceType] ?? 0) <= 0) return;

    clearNotice();

    if (selectedHandPiece.value === pieceType) {
      selectedHandPiece.value = null;
      return;
    }

    selectedHandPiece.value = pieceType;
    selectedSquare.value = null;
  }

  function handleCellClick(row: number, col: number) {
    if (isInteractionLocked()) return;

    clearNotice();

    const clickedSquare = { row, col };
    const cell = state.value.board[row][col];

    if (selectedHandPiece.value) {
      if (cell) return;

      const ok = submitLocalAction({
        kind: "DROP",
        pieceType: selectedHandPiece.value,
        to: clickedSquare,
      });

      if (ok) {
        clearSelection();
      }

      return;
    }

    if (selectedSquare.value) {
      if (selectedSquare.value.row === row && selectedSquare.value.col === col) {
        selectedSquare.value = null;
        return;
      }

      if (cell && cell.owner === currentPlayer.value) {
        selectedSquare.value = clickedSquare;
        selectedHandPiece.value = null;
        return;
      }

      const ok = submitLocalAction({
        kind: "MOVE",
        from: selectedSquare.value,
        to: clickedSquare,
      });

      if (ok) {
        clearSelection();
      }

      return;
    }

    if (cell && cell.owner === currentPlayer.value) {
      selectedSquare.value = clickedSquare;
      selectedHandPiece.value = null;
    }
  }

  function resetBattle() {
    clearCpuMoveTimer();
    cpuThinking.value = false;

    state.value = createInitialSyahoShogiState({
      player1BossCharacter: player1Character.value || null,
      player2BossCharacter: player2Character.value || null,
      player1BossImage: player1CharacterImage.value || null,
      player2BossImage: player2CharacterImage.value || null,
    });

    clearNotice();
    clearSelection();
  }

  function backToLobby() {
    clearCpuMoveTimer();
    router.back();
  }

  watch(
    () => [
      state.value.currentPlayer,
      state.value.status,
      cpuBattleEnabled.value,
      cpuPlayer.value,
      cpuLevel.value,
    ],
    () => {
      queueCpuTurnIfNeeded();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearCpuMoveTimer();
  });

  return {
    mode,
    player1Name,
    player2Name,
    player1Character,
    player2Character,
    battleState,
    boardRows,
    currentPlayer,
    currentTurnName,
    winnerName,
    resultLabel,
    winReasonLabel,
    checkLabel,
    lastActionLabel,
    handPieces,
    player1HandPieces,
    player2HandPieces,
    legalTargets,
    selectedSquare,
    selectedHandPiece,
    message,
    errorMessage,
    handleHandClick,
    handleCellClick,
    resetBattle,
    backToLobby,
  };
}
