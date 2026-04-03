import { Router } from "express";
import { db } from "../lib/db";
import {
    applySyahoShogiAction,
    restoreSyahoShogiState,
    type SyahoShogiAction,
    type SyahoShogiHandPieceType,
} from "../lib/syahosyogi";

const router = Router();

function isPositiveInt(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isOptionalPositiveIntOrNull(value: unknown): value is number | null | undefined {
    return value === undefined || value === null || isPositiveInt(value);
}

function isOptionalPositiveInt(value: unknown): value is number | undefined {
    return value === undefined || isPositiveInt(value);
}

function isOptionalStatus(value: unknown): value is "WAITING" | "PLAYING" | "FINISHED" | "ABORTED" | undefined {
    return (
        value === undefined ||
        value === "WAITING" ||
        value === "PLAYING" ||
        value === "FINISHED" ||
        value === "ABORTED"
    );
}

function isSquare(value: unknown): value is { row: number; col: number } {
    return (
        typeof value === "object" &&
        value !== null &&
        "row" in value &&
        "col" in value &&
        typeof (value as { row: unknown }).row === "number" &&
        typeof (value as { col: unknown }).col === "number"
    );
}

function isHandPieceType(value: unknown): value is SyahoShogiHandPieceType {
    return value === "SON" || value === "MIKITANI" || value === "MIZOGUCHI";
}

function isSyahoShogiAction(value: unknown): value is SyahoShogiAction {
    if (!value || typeof value !== "object") return false;

    const action = value as Partial<SyahoShogiAction>;

    if (action.kind === "MOVE") {
        return isSquare(action.from) && isSquare(action.to);
    }

    if (action.kind === "DROP") {
        return isHandPieceType(action.pieceType) && isSquare(action.to);
    }

    return false;
}

/**
 * GET /games/:id
 * ゲーム取得
 */
router.get("/:id", async (req, res) => {
    try {
        const gameId = Number(req.params.id);

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ message: "invalid game id" });
        }

        const game = await db.game.findUnique({
            where: { id: gameId },
            include: {
                player1: { select: { id: true, name: true } },
                player2: { select: { id: true, name: true } },
                winner: { select: { id: true, name: true } },
                room: {
                    select: {
                        id: true,
                        roomCode: true,
                        status: true,
                        hostUserId: true,
                        guestUserId: true,
                    },
                },
            },
        });

        if (!game) {
            return res.status(404).json({ message: "game not found" });
        }

        return res.json(game);
    } catch (error) {
        console.error("GET /games/:id error", error);
        return res.status(500).json({ message: "failed to fetch game" });
    }
});

/**
 * PATCH /games/:id/state
 * 互換用。オンライン対戦では使わないこと
 */
router.patch("/:id/state", async (req, res) => {
    try {
        const gameId = Number(req.params.id);
        const { boardState, currentTurn, status } = req.body as {
            boardState?: unknown;
            currentTurn?: unknown;
            status?: unknown;
        };

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ message: "invalid game id" });
        }

        if (boardState === undefined) {
            return res.status(400).json({ message: "boardState is required" });
        }

        if (!isOptionalPositiveInt(currentTurn)) {
            return res.status(400).json({ message: "currentTurn must be a positive integer" });
        }

        if (!isOptionalStatus(status)) {
            return res.status(400).json({ message: "invalid status" });
        }

        const game = await db.game.findUnique({
            where: { id: gameId },
        });

        if (!game) {
            return res.status(404).json({ message: "game not found" });
        }

        if (game.status === "FINISHED" || game.status === "ABORTED") {
            return res.status(400).json({ message: "game already ended" });
        }

        const updatedGame = await db.game.update({
            where: { id: gameId },
            data: {
                boardState: boardState as any,
                currentTurn: currentTurn ?? game.currentTurn,
                status: status ?? game.status,
            },
            include: {
                player1: { select: { id: true, name: true } },
                player2: { select: { id: true, name: true } },
                winner: { select: { id: true, name: true } },
                room: {
                    select: {
                        id: true,
                        roomCode: true,
                        status: true,
                    },
                },
            },
        });

        return res.json(updatedGame);
    } catch (error) {
        console.error("PATCH /games/:id/state error", error);
        return res.status(500).json({ message: "failed to update game state" });
    }
});

/**
 * PATCH /games/:id/action
 * 正規の1手更新
 * body: {
 *   playerId: number,
 *   action: SyahoShogiAction
 * }
 */
router.patch("/:id/action", async (req, res) => {
    try {
        const gameId = Number(req.params.id);
        const { playerId, action } = req.body as {
            playerId?: unknown;
            action?: unknown;
        };

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ message: "invalid game id" });
        }

        if (!isPositiveInt(playerId)) {
            return res.status(400).json({ message: "playerId must be a positive integer" });
        }

        if (!isSyahoShogiAction(action)) {
            return res.status(400).json({ message: "invalid action" });
        }

        const game = await db.game.findUnique({
            where: { id: gameId },
            include: { room: true },
        });

        if (!game) {
            return res.status(404).json({ message: "game not found" });
        }

        if (game.status === "FINISHED" || game.status === "ABORTED") {
            return res.status(400).json({ message: "game already ended" });
        }

        const currentState = restoreSyahoShogiState(game.boardState);
        const expectedPlayerId =
            currentState.currentPlayer === 1 ? game.player1Id : game.player2Id;

        if (playerId !== expectedPlayerId) {
            return res.status(403).json({ message: "it is not your turn" });
        }

        const actionResult = applySyahoShogiAction(currentState, action);

        if (!actionResult.ok) {
            return res.status(400).json({ message: actionResult.error });
        }

        const nextState = actionResult.state;
        const winnerId =
            nextState.status === "FINISHED"
                ? nextState.winner === 1
                    ? game.player1Id
                    : nextState.winner === 2
                        ? game.player2Id
                        : null
                : null;

        const loserId =
            winnerId == null
                ? null
                : winnerId === game.player1Id
                    ? game.player2Id
                    : game.player1Id;

        const updatedGame = await db.$transaction(async (tx) => {
            const gameData: Record<string, unknown> = {
                boardState: nextState as any,
                currentTurn: nextState.currentPlayer,
                status: nextState.status === "FINISHED" ? "FINISHED" : "PLAYING",
                winnerId: winnerId ?? null,
            };

            if (nextState.status === "FINISHED") {
                gameData.endedAt = new Date();
            }

            const savedGame = await tx.game.update({
                where: { id: gameId },
                data: gameData,
                include: {
                    player1: { select: { id: true, name: true } },
                    player2: { select: { id: true, name: true } },
                    winner: { select: { id: true, name: true } },
                    room: {
                        select: {
                            id: true,
                            roomCode: true,
                            status: true,
                        },
                    },
                },
            });

            if (nextState.status === "FINISHED" && game.room) {
                await tx.room.update({
                    where: { id: game.room.id },
                    data: {
                        status: "CLOSED",
                    },
                });
            }

            if (nextState.status === "FINISHED" && winnerId != null && loserId != null) {
                await tx.result.createMany({
                    data: [
                        {
                            userId: winnerId,
                            win: 1,
                            lose: 0,
                        },
                        {
                            userId: loserId,
                            win: 0,
                            lose: 1,
                        },
                    ],
                });
            }

            return savedGame;
        });

        return res.json(updatedGame);
    } catch (error) {
        console.error("PATCH /games/:id/action error", error);
        return res.status(500).json({ message: "failed to apply game action" });
    }
});

/**
 * PATCH /games/:id/finish
 * 対局終了 + 戦績反映
 */
router.patch("/:id/finish", async (req, res) => {
    try {
        const gameId = Number(req.params.id);
        const { winnerId, boardState } = req.body as {
            winnerId?: unknown;
            boardState?: unknown;
        };

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ message: "invalid game id" });
        }

        if (!isOptionalPositiveIntOrNull(winnerId)) {
            return res.status(400).json({ message: "winnerId must be a positive integer or null" });
        }

        const game = await db.game.findUnique({
            where: { id: gameId },
            include: {
                room: true,
            },
        });

        if (!game) {
            return res.status(404).json({ message: "game not found" });
        }

        if (game.status === "FINISHED") {
            return res.status(400).json({ message: "game already finished" });
        }

        if (game.status === "ABORTED") {
            return res.status(400).json({ message: "game already aborted" });
        }

        if (
            winnerId != null &&
            winnerId !== game.player1Id &&
            winnerId !== game.player2Id
        ) {
            return res.status(400).json({ message: "winnerId must be one of the players" });
        }

        const loserId =
            winnerId == null
                ? null
                : winnerId === game.player1Id
                    ? game.player2Id
                    : game.player1Id;

        const result = await db.$transaction(async (tx) => {
            const updatedGame = await tx.game.update({
                where: { id: gameId },
                data: {
                    winnerId: winnerId ?? null,
                    boardState: boardState !== undefined ? (boardState as any) : game.boardState,
                    status: "FINISHED",
                    endedAt: new Date(),
                },
                include: {
                    player1: { select: { id: true, name: true } },
                    player2: { select: { id: true, name: true } },
                    winner: { select: { id: true, name: true } },
                    room: {
                        select: {
                            id: true,
                            roomCode: true,
                            status: true,
                        },
                    },
                },
            });

            if (game.room) {
                await tx.room.update({
                    where: { id: game.room.id },
                    data: {
                        status: "CLOSED",
                    },
                });
            }

            if (winnerId != null && loserId != null) {
                await tx.result.createMany({
                    data: [
                        {
                            userId: winnerId,
                            win: 1,
                            lose: 0,
                        },
                        {
                            userId: loserId,
                            win: 0,
                            lose: 1,
                        },
                    ],
                });
            }

            return updatedGame;
        });

        return res.json(result);
    } catch (error) {
        console.error("PATCH /games/:id/finish error", error);
        return res.status(500).json({ message: "failed to finish game" });
    }
});

/**
 * PATCH /games/:id/abort
 * 対局中断
 */
router.patch("/:id/abort", async (req, res) => {
    try {
        const gameId = Number(req.params.id);

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({ message: "invalid game id" });
        }

        const game = await db.game.findUnique({
            where: { id: gameId },
            include: { room: true },
        });

        if (!game) {
            return res.status(404).json({ message: "game not found" });
        }

        if (game.status === "FINISHED") {
            return res.status(400).json({ message: "finished game cannot be aborted" });
        }

        const result = await db.$transaction(async (tx) => {
            const updatedGame = await tx.game.update({
                where: { id: gameId },
                data: {
                    status: "ABORTED",
                    endedAt: new Date(),
                },
                include: {
                    player1: { select: { id: true, name: true } },
                    player2: { select: { id: true, name: true } },
                    winner: { select: { id: true, name: true } },
                    room: {
                        select: {
                            id: true,
                            roomCode: true,
                            status: true,
                        },
                    },
                },
            });

            if (game.room) {
                await tx.room.update({
                    where: { id: game.room.id },
                    data: {
                        status: "CLOSED",
                    },
                });
            }

            return updatedGame;
        });

        return res.json(result);
    } catch (error) {
        console.error("PATCH /games/:id/abort error", error);
        return res.status(500).json({ message: "failed to abort game" });
    }
});

export default router;