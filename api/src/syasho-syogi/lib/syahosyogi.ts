export const SYAHO_SHOGI_ROWS = 4 as const;
export const SYAHO_SHOGI_COLS = 3 as const;

export type SyahoShogiPlayer = 1 | 2;
export type SyahoShogiPieceType = "BOSS" | "SON" | "MIKITANI" | "MIZOGUCHI" | "MIKURU";
export type SyahoShogiHandPieceType = "SON" | "MIKITANI" | "MIZOGUCHI";
export type SyahoShogiStatus = "PLAYING" | "FINISHED";
export type SyahoShogiWinReason = "CAPTURE_BOSS" | "TRY";

export type SyahoShogiSquare = {
    row: number;
    col: number;
};

export type SyahoShogiPiece = {
    id: string;
    owner: SyahoShogiPlayer;
    type: SyahoShogiPieceType;
    characterName?: string | null;
    characterImage?: string | null;
};

export type SyahoShogiCell = SyahoShogiPiece | null;
export type SyahoShogiBoard = SyahoShogiCell[][];

export type SyahoShogiHand = Record<SyahoShogiHandPieceType, number>;
export type SyahoShogiHands = Record<SyahoShogiPlayer, SyahoShogiHand>;

export type SyahoShogiMoveAction = {
    kind: "MOVE";
    from: SyahoShogiSquare;
    to: SyahoShogiSquare;
};

export type SyahoShogiDropAction = {
    kind: "DROP";
    pieceType: SyahoShogiHandPieceType;
    to: SyahoShogiSquare;
};

export type SyahoShogiAction = SyahoShogiMoveAction | SyahoShogiDropAction;

export type SyahoShogiLastMoveAction = {
    player: SyahoShogiPlayer;
    kind: "MOVE";
    pieceType: SyahoShogiPieceType;
    from: SyahoShogiSquare;
    to: SyahoShogiSquare;
    capturedPieceType?: SyahoShogiPieceType;
    promoted?: boolean;
};

export type SyahoShogiLastDropAction = {
    player: SyahoShogiPlayer;
    kind: "DROP";
    pieceType: SyahoShogiHandPieceType;
    to: SyahoShogiSquare;
};

export type SyahoShogiLastAction =
    | SyahoShogiLastMoveAction
    | SyahoShogiLastDropAction;

export type SyahoShogiState = {
    board: SyahoShogiBoard;
    hands: SyahoShogiHands;
    currentPlayer: SyahoShogiPlayer;
    status: SyahoShogiStatus;
    winner: SyahoShogiPlayer | null;
    winReason: SyahoShogiWinReason | null;
    moveNumber: number;
    pieceSeq: number;
    lastAction: SyahoShogiLastAction | null;
};

export type CreateInitialSyahoShogiOptions = {
    player1BossCharacter?: string | null;
    player2BossCharacter?: string | null;
    player1BossImage?: string | null;
    player2BossImage?: string | null;
};

export type SyahoShogiActionResult =
    | { ok: true; state: SyahoShogiState }
    | { ok: false; error: string };

type UnsafeApplyResult = {
    state: SyahoShogiState;
    movedPieceType: SyahoShogiPieceType | SyahoShogiHandPieceType;
    movedTo: SyahoShogiSquare;
};

const HAND_PIECE_TYPES: SyahoShogiHandPieceType[] = ["MIZOGUCHI", "MIKITANI", "SON"];

function createEmptyHand(): SyahoShogiHand {
    return {
        MIZOGUCHI: 0,
        MIKITANI: 0,
        SON: 0,
    };
}

function createEmptyBoard(): SyahoShogiBoard {
    return Array.from({ length: SYAHO_SHOGI_ROWS }, () =>
        Array.from({ length: SYAHO_SHOGI_COLS }, () => null as SyahoShogiCell),
    );
}

export function createInitialSyahoShogiState(
    options: CreateInitialSyahoShogiOptions = {},
): SyahoShogiState {
    const board = createEmptyBoard();

    board[0][0] = { id: "piece-1", owner: 2, type: "SON" };
    board[0][1] = {
        id: "piece-2",
        owner: 2,
        type: "BOSS",
        characterName: options.player2BossCharacter ?? null,
        characterImage: options.player2BossImage ?? null,
    };
    board[0][2] = { id: "piece-3", owner: 2, type: "MIKITANI" };
    board[1][1] = { id: "piece-4", owner: 2, type: "MIZOGUCHI" };

    board[2][1] = { id: "piece-5", owner: 1, type: "MIZOGUCHI" };
    board[3][0] = { id: "piece-6", owner: 1, type: "MIKITANI" };
    board[3][1] = {
        id: "piece-7",
        owner: 1,
        type: "BOSS",
        characterName: options.player1BossCharacter ?? null,
        characterImage: options.player1BossImage ?? null,
    };
    board[3][2] = { id: "piece-8", owner: 1, type: "SON" };

    return {
        board,
        hands: {
            1: createEmptyHand(),
            2: createEmptyHand(),
        },
        currentPlayer: 1,
        status: "PLAYING",
        winner: null,
        winReason: null,
        moveNumber: 1,
        pieceSeq: 9,
        lastAction: null,
    };
}

export function cloneSyahoShogiState(state: SyahoShogiState): SyahoShogiState {
    return {
        ...state,
        board: state.board.map((row) =>
            row.map((cell) =>
                cell
                    ? {
                        ...cell,
                    }
                    : null,
            ),
        ),
        hands: {
            1: { ...state.hands[1] },
            2: { ...state.hands[2] },
        },
        lastAction: state.lastAction
            ? state.lastAction.kind === "MOVE"
                ? {
                    ...state.lastAction,
                    from: { ...state.lastAction.from },
                    to: { ...state.lastAction.to },
                }
                : {
                    ...state.lastAction,
                    to: { ...state.lastAction.to },
                }
            : null,
    };
}

export function isSyahoShogiState(value: unknown): value is SyahoShogiState {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<SyahoShogiState>;
    return (
        Array.isArray(candidate.board) &&
        candidate.board.length === SYAHO_SHOGI_ROWS &&
        typeof candidate.currentPlayer === "number" &&
        (candidate.currentPlayer === 1 || candidate.currentPlayer === 2) &&
        candidate.hands !== undefined
    );
}

export function restoreSyahoShogiState(value: unknown): SyahoShogiState {
    if (!isSyahoShogiState(value)) {
        return createInitialSyahoShogiState();
    }

    return cloneSyahoShogiState(value);
}

export function getPieceAt(
    state: SyahoShogiState,
    square: SyahoShogiSquare,
): SyahoShogiPiece | null {
    if (!isInsideBoard(square)) return null;
    return state.board[square.row][square.col];
}

export function getLegalMovesFrom(
    state: SyahoShogiState,
    from: SyahoShogiSquare,
    player: SyahoShogiPlayer = state.currentPlayer,
): SyahoShogiMoveAction[] {
    const piece = getPieceAt(state, from);
    if (!piece || piece.owner !== player) return [];

    return getPseudoLegalTargets(state, from)
        .map((to) => ({ kind: "MOVE", from, to } as const))
        .filter((action) => isLegalSyahoShogiAction(state, action, player));
}

export function getLegalDropsForPiece(
    state: SyahoShogiState,
    pieceType: SyahoShogiHandPieceType,
    player: SyahoShogiPlayer = state.currentPlayer,
): SyahoShogiDropAction[] {
    if (state.hands[player][pieceType] <= 0) return [];

    const actions: SyahoShogiDropAction[] = [];

    for (let row = 0; row < SYAHO_SHOGI_ROWS; row += 1) {
        for (let col = 0; col < SYAHO_SHOGI_COLS; col += 1) {
            const action: SyahoShogiDropAction = {
                kind: "DROP",
                pieceType,
                to: { row, col },
            };

            if (isLegalSyahoShogiAction(state, action, player)) {
                actions.push(action);
            }
        }
    }

    return actions;
}

export function getAllLegalActions(
    state: SyahoShogiState,
    player: SyahoShogiPlayer = state.currentPlayer,
): SyahoShogiAction[] {
    const actions: SyahoShogiAction[] = [];

    for (let row = 0; row < SYAHO_SHOGI_ROWS; row += 1) {
        for (let col = 0; col < SYAHO_SHOGI_COLS; col += 1) {
            const piece = state.board[row][col];
            if (!piece || piece.owner !== player) continue;
            actions.push(...getLegalMovesFrom(state, { row, col }, player));
        }
    }

    for (const pieceType of HAND_PIECE_TYPES) {
        actions.push(...getLegalDropsForPiece(state, pieceType, player));
    }

    return actions;
}

export function validateSyahoShogiAction(
    state: SyahoShogiState,
    action: SyahoShogiAction,
    player: SyahoShogiPlayer = state.currentPlayer,
): string | null {
    if (state.status !== "PLAYING" || state.winner !== null) {
        return "対局はすでに終了しています";
    }

    if (player !== state.currentPlayer) {
        return "相手の手番です";
    }

    if (action.kind === "MOVE") {
        if (!isInsideBoard(action.from) || !isInsideBoard(action.to)) {
            return "盤外には動かせません";
        }

        const piece = getPieceAt(state, action.from);
        if (!piece) {
            return "移動元に駒がありません";
        }

        if (piece.owner !== player) {
            return "自分の駒だけ動かせます";
        }

        const canMove = getPseudoLegalTargets(state, action.from).some((target) =>
            isSameSquare(target, action.to),
        );
        if (!canMove) {
            return "その駒はそのマスへ移動できません";
        }
    } else {
        if (!isInsideBoard(action.to)) {
            return "盤外には打てません";
        }

        if (state.hands[player][action.pieceType] <= 0) {
            return "その持ち駒は持っていません";
        }

        if (getPieceAt(state, action.to)) {
            return "駒があるマスには打てません";
        }

        if (action.pieceType === "MIZOGUCHI" && action.to.row === getGoalRow(player)) {
            return "MIZOGUCHI は最奥段には打てません";
        }
    }

    // const simulated = applyActionUnsafe(state, action, player).state;

    // const isImmediateBossCaptureWin =
    //     simulated.status === "FINISHED" &&
    //     simulated.winner === player &&
    //     simulated.winReason === "CAPTURE_BOSS";

    // if (!isImmediateBossCaptureWin && isPlayerInCheck(simulated, player)) {
    //     return "その手では自分の BOSS が取られてしまいます";
    // }

    return null;
}

export function isLegalSyahoShogiAction(
    state: SyahoShogiState,
    action: SyahoShogiAction,
    player: SyahoShogiPlayer = state.currentPlayer,
): boolean {
    return validateSyahoShogiAction(state, action, player) === null;
}

export function applySyahoShogiAction(
    state: SyahoShogiState,
    action: SyahoShogiAction,
): SyahoShogiActionResult {
    const error = validateSyahoShogiAction(state, action, state.currentPlayer);
    if (error) {
        return { ok: false, error };
    }

    return {
        ok: true,
        state: applyActionUnsafe(state, action, state.currentPlayer).state,
    };
}

export function findBossSquare(
    state: SyahoShogiState,
    player: SyahoShogiPlayer,
): SyahoShogiSquare | null {
    for (let row = 0; row < SYAHO_SHOGI_ROWS; row += 1) {
        for (let col = 0; col < SYAHO_SHOGI_COLS; col += 1) {
            const piece = state.board[row][col];
            if (piece && piece.owner === player && piece.type === "BOSS") {
                return { row, col };
            }
        }
    }

    return null;
}

export function isPlayerInCheck(
    state: SyahoShogiState,
    player: SyahoShogiPlayer,
): boolean {
    const bossSquare = findBossSquare(state, player);
    if (!bossSquare) return true;
    return isSquareAttacked(state, bossSquare, getOpponent(player));
}

function applyActionUnsafe(
    state: SyahoShogiState,
    action: SyahoShogiAction,
    player: SyahoShogiPlayer,
): UnsafeApplyResult {
    const next = cloneSyahoShogiState(state);
    next.moveNumber = state.moveNumber + 1;
    next.lastAction = null;

    if (action.kind === "MOVE") {
        const piece = next.board[action.from.row][action.from.col];
        if (!piece) {
            throw new Error("invalid move: no piece at source");
        }

        const movingPiece: SyahoShogiPiece = { ...piece };
        const originalType = movingPiece.type;
        const targetPiece = next.board[action.to.row][action.to.col];

        next.board[action.from.row][action.from.col] = null;
        next.board[action.to.row][action.to.col] = movingPiece;

        let capturedPieceType: SyahoShogiPieceType | undefined;
        if (targetPiece) {
            capturedPieceType = targetPiece.type;

            if (targetPiece.type === "BOSS") {
                next.status = "FINISHED";
                next.winner = player;
                next.winReason = "CAPTURE_BOSS";
            } else {
                const handPiece = demoteCapturedPiece(targetPiece.type);
                next.hands[player][handPiece] += 1;
            }
        }

        let promoted = false;
        if (originalType === "MIZOGUCHI" && action.to.row === getGoalRow(player)) {
            movingPiece.type = "MIKURU";
            promoted = true;
        }

        next.lastAction = {
            player,
            kind: "MOVE",
            pieceType: originalType,
            from: { ...action.from },
            to: { ...action.to },
            capturedPieceType,
            promoted,
        };

        if (
            next.status !== "FINISHED" &&
            originalType === "BOSS" &&
            action.to.row === getGoalRow(player) &&
            !isSquareAttacked(next, action.to, getOpponent(player))
        ) {
            next.status = "FINISHED";
            next.winner = player;
            next.winReason = "TRY";
        }

        if (next.status !== "FINISHED") {
            next.currentPlayer = getOpponent(player);
            next.winner = null;
            next.winReason = null;
        }

        return {
            state: next,
            movedPieceType: originalType,
            movedTo: action.to,
        };
    }

    next.hands[player][action.pieceType] -= 1;
    next.board[action.to.row][action.to.col] = {
        id: `piece-${next.pieceSeq}`,
        owner: player,
        type: action.pieceType,
    };
    next.pieceSeq += 1;
    next.currentPlayer = getOpponent(player);
    next.winner = null;
    next.winReason = null;
    next.lastAction = {
        player,
        kind: "DROP",
        pieceType: action.pieceType,
        to: { ...action.to },
    };

    return {
        state: next,
        movedPieceType: action.pieceType,
        movedTo: action.to,
    };
}

function getPseudoLegalTargets(
    state: SyahoShogiState,
    from: SyahoShogiSquare,
): SyahoShogiSquare[] {
    const piece = getPieceAt(state, from);
    if (!piece) return [];

    const offsets = getMoveOffsets(piece.type, piece.owner);
    const result: SyahoShogiSquare[] = [];

    for (const [rowOffset, colOffset] of offsets) {
        const target = {
            row: from.row + rowOffset,
            col: from.col + colOffset,
        };

        if (!isInsideBoard(target)) continue;

        const targetPiece = getPieceAt(state, target);
        if (targetPiece && targetPiece.owner === piece.owner) continue;

        result.push(target);
    }

    return result;
}

function isSquareAttacked(
    state: SyahoShogiState,
    square: SyahoShogiSquare,
    byPlayer: SyahoShogiPlayer,
): boolean {
    for (let row = 0; row < SYAHO_SHOGI_ROWS; row += 1) {
        for (let col = 0; col < SYAHO_SHOGI_COLS; col += 1) {
            const piece = state.board[row][col];
            if (!piece || piece.owner !== byPlayer) continue;

            const attacks = getPseudoLegalTargets(state, { row, col });
            if (attacks.some((target) => isSameSquare(target, square))) {
                return true;
            }
        }
    }

    return false;
}

function getMoveOffsets(
    pieceType: SyahoShogiPieceType,
    owner: SyahoShogiPlayer,
): Array<[number, number]> {
    const forward = owner === 1 ? -1 : 1;

    switch (pieceType) {
        case "BOSS":
            return [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 1],
                [1, -1],
                [1, 0],
                [1, 1],
            ];
        case "SON":
            return [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
            ];
        case "MIKITANI":
            return [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],
            ];
        case "MIZOGUCHI":
            return [[forward, 0]];
        case "MIKURU":
            return [
                [forward, -1],
                [forward, 0],
                [forward, 1],
                [0, -1],
                [0, 1],
                [-forward, 0],
            ];
        default:
            return [];
    }
}

function demoteCapturedPiece(pieceType: SyahoShogiPieceType): SyahoShogiHandPieceType {
    if (pieceType === "MIZOGUCHI" || pieceType === "MIKURU") return "MIZOGUCHI";
    if (pieceType === "MIKITANI") return "MIKITANI";
    if (pieceType === "SON") return "SON";
    throw new Error("boss cannot become a hand piece");
}

function getGoalRow(player: SyahoShogiPlayer): number {
    return player === 1 ? 0 : SYAHO_SHOGI_ROWS - 1;
}

function getOpponent(player: SyahoShogiPlayer): SyahoShogiPlayer {
    return player === 1 ? 2 : 1;
}

function isInsideBoard(square: SyahoShogiSquare): boolean {
    return (
        Number.isInteger(square.row) &&
        Number.isInteger(square.col) &&
        square.row >= 0 &&
        square.row < SYAHO_SHOGI_ROWS &&
        square.col >= 0 &&
        square.col < SYAHO_SHOGI_COLS
    );
}

function isSameSquare(a: SyahoShogiSquare, b: SyahoShogiSquare): boolean {
    return a.row === b.row && a.col === b.col;
}

export function getSyahoShogiPieceLabel(piece: SyahoShogiPiece): string {
    switch (piece.type) {
        case "BOSS":
            return piece.characterName?.trim() || "社長";
        case "SON":
            return "SON";
        case "MIKITANI":
            return "MIKITANI";
        case "MIZOGUCHI":
            return "MIZOGUCHI";
        case "MIKURU":
            return "MIKURU";
        default:
            return piece.type;
    }
}

export function getSyahoShogiHandPieceLabel(pieceType: SyahoShogiHandPieceType): string {
    switch (pieceType) {
        case "SON":
            return "SON";
        case "MIKITANI":
            return "MIKITANI";
        case "MIZOGUCHI":
            return "MIZOGUCHI";
        default:
            return pieceType;
    }
}