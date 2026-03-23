import { apiClient } from "./apiClient";

export type GameStatus = "WAITING" | "PLAYING" | "FINISHED" | "ABORTED";
export type GameMode = "LOCAL" | "ONLINE" | "CPU";

export type UserSummary = {
    id: number;
    name: string;
};

export type RoomSummary = {
    id: number;
    roomCode: string;
    status: "OPEN" | "MATCHED" | "PLAYING" | "CLOSED";
    hostUserId?: number;
    guestUserId?: number | null;
};

export type Game = {
    id: number;
    player1Id: number;
    player2Id: number;
    winnerId: number | null;
    mode: GameMode;
    status: GameStatus;
    currentTurn: number;
    boardState: unknown;
    player1Character: string | null;
    player2Character: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    updatedAt: string;
    player1?: UserSummary;
    player2?: UserSummary;
    winner?: UserSummary | null;
    room?: RoomSummary | null;
};

export type UpdateGameStateInput = {
    gameId: number;
    boardState: unknown;
    currentTurn?: number;
    status?: GameStatus;
};

export type FinishGameInput = {
    gameId: number;
    winnerId: number | null;
    boardState?: unknown;
};

export const gameService = {
    getGame(gameId: number) {
        return apiClient.get<Game>(`/games/${gameId}`);
    },

    updateState(input: UpdateGameStateInput) {
        return apiClient.patch<Game>(`/games/${input.gameId}/state`, {
            boardState: input.boardState,
            currentTurn: input.currentTurn,
            status: input.status,
        });
    },

    finishGame(input: FinishGameInput) {
        return apiClient.patch<Game>(`/games/${input.gameId}/finish`, {
            winnerId: input.winnerId,
            boardState: input.boardState,
        });
    },

    abortGame(gameId: number) {
        return apiClient.patch<Game>(`/games/${gameId}/abort`);
    },
};