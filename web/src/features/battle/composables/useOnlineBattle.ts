import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createInitialSyahoShogiState,
  restoreSyahoShogiState,
  getLegalMovesFrom,
  getLegalDropsForPiece,
  type SyahoShogiAction,
  type SyahoShogiHandPieceType,
  type SyahoShogiPieceType,
  type SyahoShogiPlayer,
  type SyahoShogiSquare,
  type SyahoShogiState,
} from "../../../lib/syahosyogi";
import { getHandLabel, getPieceLabel } from "../utils/battleLabels";
import { getHandPieceImageSrc } from "../utils/pieceImages";
import { gameService, type Game } from "../../../services/gameService";
import { playMoveSe } from "../utils/battleSe";

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

function readNumberQuery(
  query: Record<string, unknown>,
  key: string,
): number | null {
  const value = query[key];
  if (typeof value !== "string") return null;

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getActionPieceLabel(pieceType: SyahoShogiPieceType | SyahoShogiHandPieceType) {
  return getPieceLabel({ type: pieceType });
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "通信に失敗しました";
}

export function useOnlineBattle() {
  const route = useRoute();
  const router = useRouter();

  const game = ref<Game | null>(null);
  const loading = ref(false);
  const pollingId = ref<number | null>(null);

  const state = ref<SyahoShogiState>(createInitialSyahoShogiState());

  const selectedSquare = ref<SyahoShogiSquare | null>(null);
  const selectedHandPiece = ref<SyahoShogiHandPieceType | null>(null);
  const message = ref("");
  const errorMessage = ref("");

  const gameId = computed(() => readNumberQuery(route.query, "gameId"));
  const userId = computed(() => readNumberQuery(route.query, "userId"));
  const roomCode = computed(() => readStringQuery(route.query, "roomCode", ""));

  const player1Name = computed(() => game.value?.player1?.name || "Player 1");
  const player2Name = computed(() => game.value?.player2?.name || "Player 2");
  const player1Character = computed(() => game.value?.player1Character || "");
  const player2Character = computed(() => game.value?.player2Character || "");

  const battleState = computed(() => state.value);
  const boardRows = computed(() => state.value.board);
  const currentPlayer = computed(() => state.value.currentPlayer);

  const myPlayer = computed<1 | 2 | null>(() => {
    if (!game.value || !userId.value) return null;
    if (userId.value === game.value.player1Id) return 1;
    if (userId.value === game.value.player2Id) return 2;
    return null;
  });

  const isMyTurn = computed(() => {
    return myPlayer.value !== null && myPlayer.value === currentPlayer.value;
  });

  const canInteract = computed(() => {
    return (
      !!game.value &&
      game.value.status === "PLAYING" &&
      state.value.status === "PLAYING" &&
      isMyTurn.value
    );
  });

  const currentTurnName = computed(() => {
    return currentPlayer.value === 1 ? player1Name.value : player2Name.value;
  });

  const winnerName = computed(() => {
    if (state.value.winner === 1) return player1Name.value;
    if (state.value.winner === 2) return player2Name.value;
    if (game.value?.winner?.name) return game.value.winner.name;
    return "";
  });

  const resultLabel = computed(() => {
    if (game.value?.status === "ABORTED") return "対局中断";
    if (state.value.status !== "FINISHED" || !winnerName.value) return null;
    return `${winnerName.value} の勝ち`;
  });

  const winReasonLabel = computed(() => {
    if (game.value?.status === "ABORTED") return "ゲーム中断";
    if (state.value.winReason === "CAPTURE_BOSS") return "社長を取って勝利";
    if (state.value.winReason === "TRY") return "トライ成功";
    return null;
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

  function buildHandPieces(player: SyahoShogiPlayer): BattleHandPieceView[] {
    const hands = state.value.hands[player];
    const canSelectThisHand = canInteract.value && myPlayer.value === player;

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
    return currentPlayer.value === 1
      ? player1HandPieces.value
      : player2HandPieces.value;
  });

  const legalTargets = computed<SyahoShogiSquare[]>(() => {
    if (!canInteract.value) return [];
    if (state.value.status === "FINISHED") return [];

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

  function syncFromGame(nextGame: Game) {
    const prevMoveNumber = state.value.moveNumber;

    game.value = nextGame;
    state.value = restoreSyahoShogiState(nextGame.boardState);

    if (state.value.moveNumber !== prevMoveNumber) {
      clearSelection();
    }

    if (nextGame.status === "ABORTED") {
      message.value = "対局は中断されました";
    } else if (state.value.status === "FINISHED" && winnerName.value) {
      message.value = `${winnerName.value} の勝ちです`;
    }
  }

  async function fetchGame() {
    if (!gameId.value) {
      errorMessage.value = "gameId が見つかりません";
      return;
    }

    loading.value = true;

    try {
      const nextGame = await gameService.getGame(gameId.value);
      syncFromGame(nextGame);
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error);
    } finally {
      loading.value = false;
    }
  }
  async function submitOnlineAction(action: SyahoShogiAction) {
    clearNotice();

    if (!gameId.value) {
      errorMessage.value = "gameId が見つかりません";
      return false;
    }

    if (!userId.value) {
      errorMessage.value = "userId が見つかりません";
      return false;
    }

    if (!canInteract.value) {
      errorMessage.value = "今は操作できません";
      return false;
    }

    try {
      const nextGame = await gameService.submitAction({
        gameId: gameId.value,
        playerId: userId.value,
        action,
      });

      syncFromGame(nextGame);

      if (action.kind === "DROP" || action.kind === "MOVE") {
        playMoveSe();
      }

      if (state.value.status !== "FINISHED") {
        message.value = "手を送信しました";
      }

      return true;
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error);
      return false;
    }
  }
  function handleHandClick(pieceType: SyahoShogiHandPieceType) {
    if (!canInteract.value) return;
    if ((currentPlayerHands.value[pieceType] ?? 0) <= 0) return;

    clearNotice();

    if (selectedHandPiece.value === pieceType) {
      selectedHandPiece.value = null;
      return;
    }

    selectedHandPiece.value = pieceType;
    selectedSquare.value = null;
  }

  async function handleCellClick(row: number, col: number) {
    if (!canInteract.value) return;

    clearNotice();

    const clickedSquare = { row, col };
    const cell = state.value.board[row][col];

    if (selectedHandPiece.value) {
      if (cell) return;

      const ok = await submitOnlineAction({
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

      const ok = await submitOnlineAction({
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

  function startPolling() {
    stopPolling();
    pollingId.value = window.setInterval(() => {
      fetchGame();
    }, 2500);
  }

  function stopPolling() {
    if (pollingId.value !== null) {
      window.clearInterval(pollingId.value);
      pollingId.value = null;
    }
  }

  function backToLobby() {
    router.back();
  }

  onMounted(async () => {
    await fetchGame();
    startPolling();
  });

  onBeforeUnmount(() => {
    stopPolling();
  });

  return {
    mode: "ONLINE" as const,
    game,
    loading,
    roomCode,
    gameId,
    userId,
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
    lastActionLabel,
    handPieces,
    player1HandPieces,
    player2HandPieces,
    legalTargets,
    selectedSquare,
    selectedHandPiece,
    message,
    errorMessage,
    canInteract,
    isMyTurn,
    fetchGame,
    handleHandClick,
    handleCellClick,
    backToLobby,
  };
}