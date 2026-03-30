import { Router } from "express";

const router = Router();

type Player = 1 | 2;
type PieceSize = 1 | 2 | 3;

type Piece = {
    id: string;
    owner: Player;
    size: PieceSize;
};

type Cell = Piece[];
type Line = [number, number][];

type SelectedSource =
    | {
        type: "reserve";
        pieceId: string;
    }
    | {
        type: "board";
        row: number;
        col: number;
        pieceId: string;
    };

type RoomStatus = "waiting" | "playing" | "finished";

type RoomPlayerInfo = {
    userId: number | null;
    userName: string;
    characterName: string;
    characterImage: string;
    connected: boolean;
};

type OnlineRoom = {
    roomId: string;
    players: Record<Player, RoomPlayerInfo | null>;
    board: Cell[][];
    reserveP1: Piece[];
    reserveP2: Piece[];
    currentPlayer: Player;
    winner: Player | null;
    winningLine: Line | null;
    message: string;
    status: RoomStatus;
    createdAt: number;
    updatedAt: number;
};

const rooms = new Map<string, OnlineRoom>();
const ROOM_TTL_MS = 1000 * 60 * 60 * 24;

const WIN_LINES: Line[] = [
    [
        [0, 0],
        [0, 1],
        [0, 2],
    ],
    [
        [1, 0],
        [1, 1],
        [1, 2],
    ],
    [
        [2, 0],
        [2, 1],
        [2, 2],
    ],
    [
        [0, 0],
        [1, 0],
        [2, 0],
    ],
    [
        [0, 1],
        [1, 1],
        [2, 1],
    ],
    [
        [0, 2],
        [1, 2],
        [2, 2],
    ],
    [
        [0, 0],
        [1, 1],
        [2, 2],
    ],
    [
        [0, 2],
        [1, 1],
        [2, 0],
    ],
];

function createPlayerPieces(owner: Player): Piece[] {
    return [
        { id: `P${owner}-S1`, owner, size: 1 },
        { id: `P${owner}-S2`, owner, size: 1 },
        { id: `P${owner}-M1`, owner, size: 2 },
        { id: `P${owner}-M2`, owner, size: 2 },
        { id: `P${owner}-L1`, owner, size: 3 },
        { id: `P${owner}-L2`, owner, size: 3 },
    ];
}

function createEmptyBoard(): Cell[][] {
    return Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => [] as Piece[])
    );
}

function pickRandomStartingPlayer(): Player {
    return Math.random() < 0.5 ? 1 : 2;
}

function normalizeRoomId(value: unknown): string {
    return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function createRoomId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let value = "";

    do {
        value = "";
        for (let i = 0; i < 6; i += 1) {
            value += chars[Math.floor(Math.random() * chars.length)];
        }
    } while (rooms.has(value));

    return value;
}

function cleanupRooms() {
    const now = Date.now();

    for (const [roomId, room] of rooms.entries()) {
        if (now - room.updatedAt > ROOM_TTL_MS) {
            rooms.delete(roomId);
        }
    }
}

function isPlayer(value: unknown): value is Player {
    return value === 1 || value === 2;
}

function isCellIndex(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2;
}

function getTopPiece(cell: Cell): Piece | null {
    if (!cell.length) return null;
    return cell[cell.length - 1];
}

function visibleOwner(board: Cell[][], row: number, col: number): Player | null {
    const top = getTopPiece(board[row][col]);
    return top ? top.owner : null;
}

function canPlaceOnCell(board: Cell[][], piece: Piece, row: number, col: number): boolean {
    const top = getTopPiece(board[row][col]);
    if (!top) return true;
    return piece.size > top.size;
}

function playerDisplayName(room: OnlineRoom, player: Player): string {
    return room.players[player]?.userName ?? `Player ${player}`;
}

function roomPayload(room: OnlineRoom): OnlineRoom {
    return JSON.parse(JSON.stringify(room)) as OnlineRoom;
}

function parsePlayerInfo(body: any): RoomPlayerInfo | null {
    const userName =
        typeof body?.userName === "string" && body.userName.trim()
            ? body.userName.trim()
            : null;

    const characterName =
        typeof body?.characterName === "string" && body.characterName.trim()
            ? body.characterName.trim()
            : null;

    const characterImage =
        typeof body?.characterImage === "string" ? body.characterImage : "";

    const rawUserId = body?.userId;
    let userId: number | null = null;

    if (rawUserId !== null && rawUserId !== undefined && rawUserId !== "") {
        const parsed = Number(rawUserId);
        userId = Number.isNaN(parsed) ? null : parsed;
    }

    if (!userName || !characterName) return null;

    return {
        userId,
        userName,
        characterName,
        characterImage,
        connected: true,
    };
}

function checkWinner(board: Cell[][]): { winner: Player | null; line: Line | null } {
    for (const line of WIN_LINES) {
        const owners = line.map(([r, c]) => visibleOwner(board, r, c));
        if (owners[0] && owners.every((owner) => owner === owners[0])) {
            return {
                winner: owners[0],
                line,
            };
        }
    }

    return {
        winner: null,
        line: null,
    };
}

function getSelectedPiece(
    room: OnlineRoom,
    player: Player,
    source: SelectedSource
): Piece | null {
    if (source.type === "reserve") {
        const list = player === 1 ? room.reserveP1 : room.reserveP2;
        return list.find((piece) => piece.id === source.pieceId) ?? null;
    }

    if (!isCellIndex(source.row) || !isCellIndex(source.col)) return null;

    const top = getTopPiece(room.board[source.row][source.col]);
    if (!top) return null;
    if (top.id !== source.pieceId) return null;
    if (top.owner !== player) return null;

    return top;
}

function resetRoomState(room: OnlineRoom) {
    room.board = createEmptyBoard();
    room.reserveP1 = createPlayerPieces(1);
    room.reserveP2 = createPlayerPieces(2);
    room.winner = null;
    room.winningLine = null;
    room.status = room.players[1] && room.players[2] ? "playing" : "waiting";

    if (room.status === "playing") {
        const starter = pickRandomStartingPlayer();
        room.currentPlayer = starter;
        room.message = `${playerDisplayName(room, starter)} の手番です`;
    } else {
        room.currentPlayer = 1;
        room.message = "対戦相手の参加を待っています";
    }

    room.updatedAt = Date.now();
}

router.post("/rooms/create", (req, res) => {
    cleanupRooms();

    const playerInfo = parsePlayerInfo(req.body);
    if (!playerInfo) {
        return res.status(400).json({ message: "プレイヤー情報が不正です" });
    }

    const roomId = createRoomId();

    const room: OnlineRoom = {
        roomId,
        players: {
            1: playerInfo,
            2: null,
        },
        board: createEmptyBoard(),
        reserveP1: createPlayerPieces(1),
        reserveP2: createPlayerPieces(2),
        currentPlayer: 1,
        winner: null,
        winningLine: null,
        message: "対戦相手の参加を待っています",
        status: "waiting",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    rooms.set(roomId, room);

    return res.json({
        item: {
            roomId,
            player: 1,
        },
    });
});

router.post("/rooms/join", (req, res) => {
    cleanupRooms();

    const roomId = normalizeRoomId(req.body?.roomId);
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ message: "ルームが見つかりません" });
    }

    if (room.players[2]) {
        return res.status(400).json({ message: "このルームは満員です" });
    }

    const playerInfo = parsePlayerInfo(req.body);
    if (!playerInfo) {
        return res.status(400).json({ message: "プレイヤー情報が不正です" });
    }

    room.players[2] = playerInfo;
    room.status = "playing";

    const starter = pickRandomStartingPlayer();

    room.currentPlayer = starter;
    room.winner = null;
    room.winningLine = null;
    room.message = `${playerDisplayName(room, starter)} の手番です`;
    room.updatedAt = Date.now();

    return res.json({
        item: {
            roomId: room.roomId,
            player: 2,
        },
    });
});

router.get("/rooms/:roomId", (req, res) => {
    cleanupRooms();

    const roomId = normalizeRoomId(req.params.roomId);
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ message: "ルームが見つかりません" });
    }

    return res.json({
        item: roomPayload(room),
    });
});

router.post("/rooms/:roomId/moves", (req, res) => {
    cleanupRooms();

    const roomId = normalizeRoomId(req.params.roomId);
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ message: "ルームが見つかりません" });
    }

    if (room.status !== "playing") {
        return res.status(400).json({ message: "まだ対戦を開始できません" });
    }

    if (room.winner !== null) {
        return res.status(400).json({ message: "この対戦はすでに終了しています" });
    }

    const rawPlayer = Number(req.body?.player);
    if (!isPlayer(rawPlayer)) {
        return res.status(400).json({ message: "プレイヤー情報が不正です" });
    }

    const player = rawPlayer as Player;

    if (!room.players[player]) {
        return res.status(400).json({ message: "ルームに参加していないプレイヤーです" });
    }

    if (room.currentPlayer !== player) {
        return res.status(400).json({ message: "いまはあなたの手番ではありません" });
    }

    const source = req.body?.source as SelectedSource | undefined;
    if (!source || (source.type !== "reserve" && source.type !== "board")) {
        return res.status(400).json({ message: "移動元が不正です" });
    }

    const toRow = Number(req.body?.to?.row);
    const toCol = Number(req.body?.to?.col);

    if (!isCellIndex(toRow) || !isCellIndex(toCol)) {
        return res.status(400).json({ message: "移動先が不正です" });
    }

    const piece = getSelectedPiece(room, player, source);
    if (!piece) {
        return res.status(400).json({ message: "その駒は動かせません" });
    }

    if (source.type === "board" && source.row === toRow && source.col === toCol) {
        return res.status(400).json({ message: "同じマスには移動できません" });
    }

    if (!canPlaceOnCell(room.board, piece, toRow, toCol)) {
        return res.status(400).json({ message: "そのマスには置けません" });
    }

    if (source.type === "reserve") {
        const list = player === 1 ? room.reserveP1 : room.reserveP2;
        const index = list.findIndex((p) => p.id === piece.id);

        if (index === -1) {
            return res.status(400).json({ message: "その駒は持ち駒にありません" });
        }

        list.splice(index, 1);
        room.board[toRow][toCol].push(piece);
    } else {
        const fromCell = room.board[source.row][source.col];
        const top = getTopPiece(fromCell);

        if (!top || top.id !== piece.id || top.owner !== player) {
            return res.status(400).json({ message: "その駒は動かせません" });
        }

        fromCell.pop();
        room.board[toRow][toCol].push(piece);
    }

    const result = checkWinner(room.board);

    if (result.winner) {
        room.winner = result.winner;
        room.winningLine = result.line;
        room.status = "finished";
        room.message = `${playerDisplayName(room, result.winner)} の勝ち！`;
    } else {
        room.currentPlayer = player === 1 ? 2 : 1;
        room.message = `${playerDisplayName(room, room.currentPlayer)} の手番です`;
    }

    room.updatedAt = Date.now();

    return res.json({
        item: roomPayload(room),
    });
});

router.post("/rooms/:roomId/reset", (req, res) => {
    cleanupRooms();

    const roomId = normalizeRoomId(req.params.roomId);
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ message: "ルームが見つかりません" });
    }

    resetRoomState(room);

    return res.json({
        item: roomPayload(room),
    });
});

export default router;