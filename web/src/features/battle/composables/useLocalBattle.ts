import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createInitialSyahoShogiState,
  applySyahoShogiAction,
  type SyahoShogiAction,
  type SyahoShogiHandPieceType,
  type SyahoShogiPieceType,
  type SyahoShogiSquare,
} from "../../../lib/syahosyogi";
import { getHandLabel, getPieceLabel } from "../utils/battleLabels";

type BattleHandPieceView = {
  pieceType: SyahoShogiHandPieceType;
  label: string;
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

function getActionPieceLabel(pieceType: SyahoShogiPieceType | SyahoShogiHandPieceType) {
  return getPieceLabel({ type: pieceType });
}

export function useLocalBattle() {
  const route = useRoute();
  const router = useRouter();

  const player1Name = computed(() => readStringQuery(route.query, "p1Name", "Player 1"));
  const player2Name = computed(() => readStringQuery(route.query, "p2Name", "Player 2"));
  const player1Character = computed(() => readStringQuery(route.query, "p1Character", ""));
  const player2Character = computed(() => readStringQuery(route.query, "p2Character", ""));

  const state = ref(
    createInitialSyahoShogiState({
      player1BossCharacter: player1Character.value || null,
      player2BossCharacter: player2Character.value || null,
    }),
  );

  const selectedSquare = ref<SyahoShogiSquare | null>(null);
  const selectedHandPiece = ref<SyahoShogiHandPieceType | null>(null);
  const message = ref("");
  const errorMessage = ref("");

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

  const handPieces = computed<BattleHandPieceView[]>(() => {
    return HAND_PIECE_TYPES.map((pieceType) => {
      const count = currentPlayerHands.value[pieceType] ?? 0;
      return {
        pieceType,
        label: getHandLabel(pieceType),
        count,
        active: selectedHandPiece.value === pieceType,
        disabled: count <= 0 || state.value.status === "FINISHED",
      };
    });
  });

  function clearNotice() {
    message.value = "";
    errorMessage.value = "";
  }

  function clearSelection() {
    selectedSquare.value = null;
    selectedHandPiece.value = null;
  }

  function submitLocalAction(action: SyahoShogiAction) {
    clearNotice();

    const result = applySyahoShogiAction(state.value, action);

    if (!result.ok) {
      errorMessage.value = result.error;
      return false;
    }

    state.value = result.state;

    if (result.state.status === "FINISHED") {
      message.value = `${winnerName.value} の勝ちです`;
    }

    return true;
  }

  function handleHandClick(pieceType: SyahoShogiHandPieceType) {
    if (state.value.status === "FINISHED") return;
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
    if (state.value.status === "FINISHED") return;

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
    state.value = createInitialSyahoShogiState({
      player1BossCharacter: player1Character.value || null,
      player2BossCharacter: player2Character.value || null,
    });

    clearNotice();
    clearSelection();
  }

  function backToLobby() {
    router.back();
  }

  return {
    mode: "LOCAL" as const,
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