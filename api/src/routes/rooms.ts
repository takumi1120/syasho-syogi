import { Router } from "express";
import { db } from "../lib/db";
import { createInitialSyahoShogiState } from "../lib/syahosyogi";

const router = Router();

const CHARACTER_IMAGE_MAP: Record<string, string> = {
    "ティムクック": "/characters/thim.png",
    "サムアルトマン": "/characters/sum.png",
    "Kプラチナム代表": "/characters/kceo.png",
    "スティーブ・ジョブズ": "/characters/jobs.png",
    "ビル・ゲイツ": "/characters/bil.png",
    "イーロン・マスク": "/characters/elon.png",
};

function resolveBossImage(characterName: string | null | undefined): string | null {
    const trimmed = characterName?.trim();
    console.log(trimmed, characterName)
    if (!trimmed) return null;
    return CHARACTER_IMAGE_MAP[trimmed] ?? null;
}

function isPositiveInt(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || typeof value === "string";
}

function createRoomCode(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i += 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

async function generateUniqueRoomCode(): Promise<string> {
    for (let i = 0; i < 20; i += 1) {
        const roomCode = createRoomCode();
        const exists = await db.room.findUnique({
            where: { roomCode },
            select: { id: true },
        });
        if (!exists) return roomCode;
    }

    throw new Error("room code generation failed");
}

/**
 * POST /rooms
 * 部屋作成
 * body: { hostUserId: number, hostCharacter?: string }
 */
router.post("/", async (req, res) => {
    try {
        const { hostUserId, hostCharacter } = req.body as {
            hostUserId?: unknown;
            hostCharacter?: unknown;
        };

        if (!isPositiveInt(hostUserId)) {
            return res.status(400).json({ message: "hostUserId must be a positive integer" });
        }

        if (!isOptionalString(hostCharacter)) {
            return res.status(400).json({ message: "hostCharacter must be a string" });
        }

        const hostUser = await db.user.findUnique({
            where: { id: hostUserId },
            select: { id: true, name: true },
        });

        if (!hostUser) {
            return res.status(404).json({ message: "host user not found" });
        }

        const roomCode = await generateUniqueRoomCode();

        const room = await db.room.create({
            data: {
                roomCode,
                hostUserId,
                hostCharacter: hostCharacter?.trim() ? hostCharacter.trim() : null,
                status: "OPEN",
            },
            include: {
                hostUser: { select: { id: true, name: true } },
                guestUser: { select: { id: true, name: true } },
                game: true,
            },
        });

        return res.status(201).json(room);
    } catch (error) {
        console.error("POST /rooms error", error);
        return res.status(500).json({ message: "failed to create room" });
    }
});

/**
 * GET /rooms/:roomCode
 * 部屋情報取得
 */
router.get("/:roomCode", async (req, res) => {
    try {
        const roomCode = req.params.roomCode?.trim().toUpperCase();

        if (!roomCode) {
            return res.status(400).json({ message: "roomCode is required" });
        }

        const room = await db.room.findUnique({
            where: { roomCode },
            include: {
                hostUser: { select: { id: true, name: true } },
                guestUser: { select: { id: true, name: true } },
                game: true,
            },
        });

        if (!room) {
            return res.status(404).json({ message: "room not found" });
        }

        return res.json(room);
    } catch (error) {
        console.error("GET /rooms/:roomCode error", error);
        return res.status(500).json({ message: "failed to fetch room" });
    }
});

/**
 * POST /rooms/:roomCode/join
 * 部屋参加
 * body: { guestUserId: number, guestCharacter?: string }
 */
router.post("/:roomCode/join", async (req, res) => {
    try {
        const roomCode = req.params.roomCode?.trim().toUpperCase();
        const { guestUserId, guestCharacter } = req.body as {
            guestUserId?: unknown;
            guestCharacter?: unknown;
        };

        if (!roomCode) {
            return res.status(400).json({ message: "roomCode is required" });
        }

        if (!isPositiveInt(guestUserId)) {
            return res.status(400).json({ message: "guestUserId must be a positive integer" });
        }

        if (!isOptionalString(guestCharacter)) {
            return res.status(400).json({ message: "guestCharacter must be a string" });
        }

        const room = await db.room.findUnique({
            where: { roomCode },
        });

        if (!room) {
            return res.status(404).json({ message: "room not found" });
        }

        if (room.status === "CLOSED") {
            return res.status(400).json({ message: "room is closed" });
        }

        if (room.status === "PLAYING") {
            return res.status(400).json({ message: "game already started" });
        }

        if (room.hostUserId === guestUserId) {
            return res.status(400).json({ message: "host user cannot join as guest" });
        }

        const guestUser = await db.user.findUnique({
            where: { id: guestUserId },
            select: { id: true, name: true },
        });

        if (!guestUser) {
            return res.status(404).json({ message: "guest user not found" });
        }

        if (room.guestUserId && room.guestUserId !== guestUserId) {
            return res.status(409).json({ message: "room is already full" });
        }

        const updatedRoom = await db.room.update({
            where: { roomCode },
            data: {
                guestUserId,
                guestCharacter: guestCharacter?.trim() ? guestCharacter.trim() : null,
                guestReady: false,
                status: "MATCHED",
            },
            include: {
                hostUser: { select: { id: true, name: true } },
                guestUser: { select: { id: true, name: true } },
                game: true,
            },
        });

        return res.json(updatedRoom);
    } catch (error) {
        console.error("POST /rooms/:roomCode/join error", error);
        return res.status(500).json({ message: "failed to join room" });
    }
});

/**
 * PATCH /rooms/:roomCode/ready
 * ready 更新
 * body: { userId: number, ready: boolean }
 */
router.patch("/:roomCode/ready", async (req, res) => {
    try {
        const roomCode = req.params.roomCode?.trim().toUpperCase();
        const { userId, ready } = req.body as {
            userId?: unknown;
            ready?: unknown;
        };

        if (!roomCode) {
            return res.status(400).json({ message: "roomCode is required" });
        }

        if (!isPositiveInt(userId)) {
            return res.status(400).json({ message: "userId must be a positive integer" });
        }

        if (!isBoolean(ready)) {
            return res.status(400).json({ message: "ready must be a boolean" });
        }

        const room = await db.room.findUnique({
            where: { roomCode },
        });

        if (!room) {
            return res.status(404).json({ message: "room not found" });
        }

        if (room.status === "PLAYING" || room.status === "CLOSED") {
            return res.status(400).json({ message: "room is not accepting ready changes" });
        }

        let data: {
            hostReady?: boolean;
            guestReady?: boolean;
            status?: "OPEN" | "MATCHED";
        } = {};

        if (room.hostUserId === userId) {
            data.hostReady = ready;
        } else if (room.guestUserId === userId) {
            data.guestReady = ready;
        } else {
            return res.status(403).json({ message: "user does not belong to this room" });
        }

        data.status = room.guestUserId ? "MATCHED" : "OPEN";

        const updatedRoom = await db.room.update({
            where: { roomCode },
            data,
            include: {
                hostUser: { select: { id: true, name: true } },
                guestUser: { select: { id: true, name: true } },
                game: true,
            },
        });

        return res.json(updatedRoom);
    } catch (error) {
        console.error("PATCH /rooms/:roomCode/ready error", error);
        return res.status(500).json({ message: "failed to update ready status" });
    }
});

/**
 * POST /rooms/:roomCode/start
 * ゲーム開始
 */
router.post("/:roomCode/start", async (req, res) => {
    try {
        const roomCode = req.params.roomCode?.trim().toUpperCase();

        if (!roomCode) {
            return res.status(400).json({ message: "roomCode is required" });
        }

        const room = await db.room.findUnique({
            where: { roomCode },
            include: {
                hostUser: { select: { id: true, name: true } },
                guestUser: { select: { id: true, name: true } },
                game: true,
            },
        });

        if (!room) {
            return res.status(404).json({ message: "room not found" });
        }

        if (!room.guestUserId) {
            return res.status(400).json({ message: "guest user has not joined yet" });
        }

        if (!room.hostReady || !room.guestReady) {
            return res.status(400).json({ message: "both players must be ready" });
        }

        if (room.gameId && room.game) {
            return res.json({
                message: "game already exists",
                room,
                game: room.game,
            });
        }

        const hostFirst = Math.random() < 0.5;

        const player1Id = hostFirst ? room.hostUserId : room.guestUserId;
        const player2Id = hostFirst ? room.guestUserId : room.hostUserId;

        const player1Character = hostFirst ? room.hostCharacter : room.guestCharacter;
        const player2Character = hostFirst ? room.guestCharacter : room.hostCharacter;

        const player1BossImage = resolveBossImage(player1Character);
        const player2BossImage = resolveBossImage(player2Character);
        console.log(player1Character, player2Character, player1BossImage, player2BossImage)
        const initialBoardState = createInitialSyahoShogiState({
            player1BossCharacter: player1Character ?? null,
            player2BossCharacter: player2Character ?? null,
            player1BossImage,
            player2BossImage,
        });

        const result = await db.$transaction(async (tx) => {
            const game = await tx.game.create({
                data: {
                    player1Id,
                    player2Id,
                    player1Character: player1Character ?? null,
                    player2Character: player2Character ?? null,
                    mode: "ONLINE",
                    status: "PLAYING",
                    currentTurn: 1,
                    startedAt: new Date(),
                    boardState: initialBoardState as any,
                },
            });

            const updatedRoom = await tx.room.update({
                where: { roomCode },
                data: {
                    gameId: game.id,
                    status: "PLAYING",
                },
                include: {
                    hostUser: { select: { id: true, name: true } },
                    guestUser: { select: { id: true, name: true } },
                    game: true,
                },
            });

            return {
                room: updatedRoom,
                game,
            };
        });

        return res.json(result);
    } catch (error) {
        console.error("POST /rooms/:roomCode/start error", error);
        return res.status(500).json({ message: "failed to start game" });
    }
});

/**
 * POST /rooms/:roomCode/leave
 * 部屋離脱
 * body: { userId: number }
 */
router.post("/:roomCode/leave", async (req, res) => {
    try {
        const roomCode = req.params.roomCode?.trim().toUpperCase();
        const { userId } = req.body as {
            userId?: unknown;
        };

        if (!roomCode) {
            return res.status(400).json({ message: "roomCode is required" });
        }

        if (!isPositiveInt(userId)) {
            return res.status(400).json({ message: "userId must be a positive integer" });
        }

        const room = await db.room.findUnique({
            where: { roomCode },
            include: {
                game: true,
            },
        });

        if (!room) {
            return res.status(404).json({ message: "room not found" });
        }

        if (room.hostUserId === userId) {
            const updatedRoom = await db.room.update({
                where: { roomCode },
                data: {
                    status: "CLOSED",
                },
                include: {
                    hostUser: { select: { id: true, name: true } },
                    guestUser: { select: { id: true, name: true } },
                    game: true,
                },
            });

            return res.json(updatedRoom);
        }

        if (room.guestUserId === userId) {
            const updatedRoom = await db.room.update({
                where: { roomCode },
                data: {
                    guestUserId: null,
                    guestCharacter: null,
                    guestReady: false,
                    status: "OPEN",
                    gameId: null,
                },
                include: {
                    hostUser: { select: { id: true, name: true } },
                    guestUser: { select: { id: true, name: true } },
                    game: true,
                },
            });

            return res.json(updatedRoom);
        }

        return res.status(403).json({ message: "user does not belong to this room" });
    } catch (error) {
        console.error("POST /rooms/:roomCode/leave error", error);
        return res.status(500).json({ message: "failed to leave room" });
    }
});

export default router;