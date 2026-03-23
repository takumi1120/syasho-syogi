import { Router } from "express";
import { db } from "../lib/db";

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
 * 盤面更新
 * body: {
 *   boardState: any,
 *   currentTurn?: number,
 *   status?: "WAITING" | "PLAYING" | "FINISHED" | "ABORTED"
 * }
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
 * PATCH /games/:id/finish
 * 対局終了 + 戦績反映
 * body: {
 *   winnerId: number | null,
 *   boardState?: any
 * }
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