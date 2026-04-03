import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { api } from "../lib/api";
import type {
    Cell,
    Line,
    Piece,
    PieceSize,
    Player,
    SelectedSource,
} from "../types/battle.types";

type RoomStatus = "waiting" | "playing" | "finished";
type CoinFace = "heads" | "tails";

type OnlinePlayerInfo = {
    userId: number | null;
    userName: string;
    characterName: string;
    characterImage: string;
    connected: boolean;
};

type OnlineRoom = {
    roomId: string;
    players: Record<Player, OnlinePlayerInfo | null>;
    board: Cell[][];
    reserveP1: Piece[];
    reserveP2: Piece[];
    currentPlayer: Player;
    winner: Player | null;
    winningLine: Line | null;
    message: string;
    status: RoomStatus;
    updatedAt: number;
};

type Params = {
    roomId: string;
    localPlayer: Player;
};

const SIZE_LABEL: Record<PieceSize, string> = {
    1: "S",
    2: "M",
    3: "L",
};

function createEmptyBoard(): Cell[][] {
    return Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => [] as Piece[])
    );
}

function isBoardEmpty(board: Cell[][]): boolean {
    return board.every((row) => row.every((cell) => cell.length === 0));
}

function coinFaceFromPlayer(player: Player): CoinFace {
    return player === 1 ? "heads" : "tails";
}

export function useOnlineBattleGame(params: Params) {
    const room = ref<OnlineRoom | null>(null);
    const loading = ref(true);
    const submitting = ref(false);
    const error = ref<string | null>(null);
    const selectedSource = ref<SelectedSource>(null);
    const localHint = ref<string | null>(null);

    const coinTossVisible = ref(false);
    const coinTossSpinning = ref(false);
    const coinTossFace = ref<CoinFace | null>(null);
    const coinTossStarter = ref<Player | null>(null);

    let pollingTimer: number | null = null;
    let coinRevealTimer: number | null = null;
    let coinHideTimer: number | null = null;
    let lastCoinTossKey = "";

    function getErrorMessage(e: any, fallback: string): string {
        return (
            e?.response?.data?.message ??
            e?.response?.data?.error?.message ??
            e?.message ??
            fallback
        );
    }

    function clearCoinTossTimers() {
        if (coinRevealTimer !== null) {
            window.clearTimeout(coinRevealTimer);
            coinRevealTimer = null;
        }

        if (coinHideTimer !== null) {
            window.clearTimeout(coinHideTimer);
            coinHideTimer = null;
        }
    }

    function playCoinToss(starter: Player) {
        clearCoinTossTimers();

        coinTossVisible.value = true;
        coinTossSpinning.value = true;
        coinTossFace.value = null;
        coinTossStarter.value = null;

        coinRevealTimer = window.setTimeout(() => {
            coinRevealTimer = null;
            coinTossSpinning.value = false;
            coinTossFace.value = coinFaceFromPlayer(starter);
            coinTossStarter.value = starter;

            coinHideTimer = window.setTimeout(() => {
                coinHideTimer = null;
                coinTossVisible.value = false;
            }, 900);
        }, 1200);
    }

    function getTopPiece(cell: Cell): Piece | null {
        if (!cell.length) return null;
        return cell[cell.length - 1];
    }

    function playerDisplayName(player: Player): string {
        return room.value?.players[player]?.userName ?? `Player ${player}`;
    }

    function playerCharacterName(player: Player): string {
        return room.value?.players[player]?.characterName ?? "";
    }

    function playerImage(player: Player): string {
        return room.value?.players[player]?.characterImage ?? "";
    }

    const board = computed<Cell[][]>(() => room.value?.board ?? createEmptyBoard());
    const reserveP1 = computed<Piece[]>(() => room.value?.reserveP1 ?? []);
    const reserveP2 = computed<Piece[]>(() => room.value?.reserveP2 ?? []);
    const currentPlayer = computed<Player>(() => room.value?.currentPlayer ?? 1);
    const winner = computed<Player | null>(() => room.value?.winner ?? null);
    const winningLine = computed<Line | null>(() => room.value?.winningLine ?? null);

    const player1Name = computed(() => playerDisplayName(1));
    const player2Name = computed(() => playerDisplayName(2));
    const player1CharacterName = computed(() => playerCharacterName(1));
    const player2CharacterName = computed(() => playerCharacterName(2));
    const player1CharacterImage = computed(() => playerImage(1));
    const player2CharacterImage = computed(() => playerImage(2));

    const waitingForOpponent = computed(() => {
        return room.value?.status === "waiting" || !room.value?.players[2];
    });

    const isMyTurn = computed(() => {
        return (
            room.value?.status === "playing" &&
            room.value.currentPlayer === params.localPlayer &&
            room.value.winner === null
        );
    });

    const message = computed(() => {
        return localHint.value ?? room.value?.message ?? "ルーム情報を取得中です";
    });

    const coinTossResultText = computed(() => {
        if (coinTossSpinning.value) {
            return "コイントス中...";
        }

        if (!coinTossFace.value || coinTossStarter.value === null) {
            return "";
        }

        const faceLabel = coinTossFace.value === "heads" ? "表" : "裏";
        return `${faceLabel}！ ${playerDisplayName(coinTossStarter.value)} が先手です`;
    });

    function reserveListFor(player: Player): Piece[] {
        return player === 1 ? reserveP1.value : reserveP2.value;
    }

    function topPiece(row: number, col: number): Piece | null {
        return getTopPiece(board.value[row][col]);
    }

    function boardPieceAt(index: number): Piece | null {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return topPiece(row, col);
    }

    function canPlaceOnCell(piece: Piece, row: number, col: number): boolean {
        const top = topPiece(row, col);
        if (!top) return true;
        return piece.size > top.size;
    }

    function getSelectedPiece(): Piece | null {
        if (!selectedSource.value || !room.value) return null;

        if (selectedSource.value.type === "reserve") {
            return (
                reserveListFor(params.localPlayer).find(
                    (p) => p.id === selectedSource.value?.pieceId
                ) ?? null
            );
        }

        const source = selectedSource.value;
        const top = topPiece(source.row, source.col);

        if (!top) return null;
        if (top.id !== source.pieceId) return null;
        if (top.owner !== params.localPlayer) return null;

        return top;
    }

    const selectedPiece = computed(() => getSelectedPiece());

    function applyRoomSnapshot(nextRoom: OnlineRoom) {
        room.value = nextRoom;

        if (selectedSource.value && !getSelectedPiece()) {
            selectedSource.value = null;
        }

        if (!isMyTurn.value) {
            selectedSource.value = null;
        }

        error.value = null;
        localHint.value = null;

        if (
            nextRoom.status !== "playing" ||
            nextRoom.winner !== null ||
            !isBoardEmpty(nextRoom.board)
        ) {
            clearCoinTossTimers();
            coinTossVisible.value = false;
        }

        const coinTossKey = `${nextRoom.updatedAt}-${nextRoom.currentPlayer}-${nextRoom.status}`;

        if (
            nextRoom.status === "playing" &&
            nextRoom.winner === null &&
            isBoardEmpty(nextRoom.board) &&
            lastCoinTossKey !== coinTossKey
        ) {
            lastCoinTossKey = coinTossKey;
            playCoinToss(nextRoom.currentPlayer);
        }
    }

    async function refreshRoom(silent = false) {
        if (!silent) {
            loading.value = true;
        }

        try {
            const res = await api.get(`/online/rooms/${params.roomId}`);
            applyRoomSnapshot(res.data.item);
        } catch (e: any) {
            error.value = getErrorMessage(e, "ルーム情報の取得に失敗しました");
        } finally {
            if (!silent) {
                loading.value = false;
            }
        }
    }

    function isSelectedReservePiece(pieceId: string): boolean {
        return (
            selectedSource.value?.type === "reserve" &&
            selectedSource.value.pieceId === pieceId
        );
    }

    function isSelectedBoardPiece(row: number, col: number): boolean {
        return (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        );
    }

    function isWinningCell(row: number, col: number): boolean {
        if (!winningLine.value) return false;
        return winningLine.value.some(([r, c]) => r === row && c === col);
    }

    function isPlayableCell(row: number, col: number): boolean {
        const piece = selectedPiece.value;
        if (!piece || !isMyTurn.value || winner.value || coinTossVisible.value) return false;

        if (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        ) {
            return false;
        }

        return canPlaceOnCell(piece, row, col);
    }

    function reserveText(piece: Piece): string {
        return `${playerDisplayName(piece.owner)} ${SIZE_LABEL[piece.size]}`;
    }

    function selectReservePiece(pieceId: string) {
        if (coinTossVisible.value) return;

        if (waitingForOpponent.value) {
            localHint.value = "対戦相手の参加を待っています";
            return;
        }

        if (!isMyTurn.value) {
            localHint.value = "あなたの手番ではありません";
            return;
        }

        const piece = reserveListFor(params.localPlayer).find((p) => p.id === pieceId);
        if (!piece) return;

        selectedSource.value = {
            type: "reserve",
            pieceId,
        };

        localHint.value = `${playerDisplayName(params.localPlayer)}：${SIZE_LABEL[piece.size]
            } を置くマスを選んでください`;
    }

    async function submitMove(row: number, col: number) {
        if (!selectedSource.value) return;

        submitting.value = true;

        try {
            const res = await api.post(`/online/rooms/${params.roomId}/moves`, {
                player: params.localPlayer,
                source: selectedSource.value,
                to: { row, col },
            });

            selectedSource.value = null;
            applyRoomSnapshot(res.data.item);
        } catch (e: any) {
            localHint.value = getErrorMessage(e, "着手に失敗しました");
            await refreshRoom(true);
        } finally {
            submitting.value = false;
        }
    }

    function handleCellClick(row: number, col: number) {
        if (coinTossVisible.value) return;
        if (!room.value) return;

        if (waitingForOpponent.value) {
            localHint.value = "対戦相手の参加を待っています";
            return;
        }

        if (winner.value) return;

        if (!isMyTurn.value) {
            localHint.value = "あなたの手番ではありません";
            return;
        }

        const top = topPiece(row, col);
        const piece = selectedPiece.value;

        if (!piece) {
            if (top && top.owner === params.localPlayer) {
                selectedSource.value = {
                    type: "board",
                    row,
                    col,
                    pieceId: top.id,
                };

                localHint.value = `${playerDisplayName(params.localPlayer)}：${SIZE_LABEL[top.size]
                    } を移動する先を選んでください`;
                return;
            }

            localHint.value = "自分の駒を選んでください";
            return;
        }

        if (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        ) {
            selectedSource.value = null;
            localHint.value = `${playerDisplayName(params.localPlayer)} の手番です`;
            return;
        }

        if (!canPlaceOnCell(piece, row, col)) {
            localHint.value = "そのマスには置けません";
            return;
        }

        void submitMove(row, col);
    }

    async function resetRoom() {
        try {
            const res = await api.post(`/online/rooms/${params.roomId}/reset`, {
                player: params.localPlayer,
            });

            selectedSource.value = null;
            applyRoomSnapshot(res.data.item);
        } catch (e: any) {
            error.value = getErrorMessage(e, "ルームのリセットに失敗しました");
        }
    }

    onMounted(async () => {
        await refreshRoom();

        pollingTimer = window.setInterval(() => {
            void refreshRoom(true);
        }, 1000);
    });

    onBeforeUnmount(() => {
        if (pollingTimer !== null) {
            window.clearInterval(pollingTimer);
            pollingTimer = null;
        }

        clearCoinTossTimers();
    });

    return {
        room,
        loading,
        submitting,
        error,
        selectedSource,

        board,
        reserveP1,
        reserveP2,
        currentPlayer,
        winner,
        winningLine,
        message,

        player1Name,
        player2Name,
        player1CharacterName,
        player2CharacterName,
        player1CharacterImage,
        player2CharacterImage,

        waitingForOpponent,
        isMyTurn,

        coinTossVisible,
        coinTossSpinning,
        coinTossFace,
        coinTossResultText,

        playerDisplayName,
        playerImage,
        selectReservePiece,
        handleCellClick,
        resetRoom,
        refreshRoom,

        isSelectedReservePiece,
        isSelectedBoardPiece,
        isWinningCell,
        isPlayableCell,
        reserveText,
        topPiece,
        boardPieceAt,
    };
}