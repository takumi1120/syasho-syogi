import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type RoomStatus = "OPEN" | "MATCHED" | "PLAYING" | "CLOSED";

export type UserSummary = {
    id: number;
    name: string;
};

export type GameSummary = {
    id: number;
    player1Id: number;
    player2Id: number;
    winnerId: number | null;
    mode: "LOCAL" | "ONLINE" | "CPU";
    status: "WAITING" | "PLAYING" | "FINISHED" | "ABORTED";
    currentTurn: number;
    boardState: unknown;
    player1Character: string | null;
    player2Character: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Room = {
    id: number;
    roomCode: string;
    hostUserId: number;
    guestUserId: number | null;
    status: RoomStatus;
    hostReady: boolean;
    guestReady: boolean;
    hostCharacter: string | null;
    guestCharacter: string | null;
    gameId: number | null;
    createdAt: string;
    updatedAt: string;
    hostUser?: UserSummary;
    guestUser?: UserSummary | null;
    game?: GameSummary | null;
};

export type CreateRoomInput = {
    hostUserId: number;
    hostCharacter?: string;
};

export type JoinRoomInput = {
    roomCode: string;
    guestUserId: number;
    guestCharacter?: string;
};

export type UpdateReadyInput = {
    roomCode: string;
    userId: number;
    ready: boolean;
};

export type LeaveRoomInput = {
    roomCode: string;
    userId: number;
};

export type StartRoomGameResponse = {
    room: Room;
    game: GameSummary;
    message?: string;
};

function normalizeRoomCode(roomCode: string): string {
    return roomCode.trim().toUpperCase();
}

export const roomService = {
    createRoom(input: CreateRoomInput) {
        return apiClient.post<Room>("/rooms", input);
    },

    getRoom(roomCode: string) {
        return apiClient.get<Room>(`/rooms/${normalizeRoomCode(roomCode)}`);
    },

    joinRoom(input: JoinRoomInput) {
        return apiClient.post<Room>(`/rooms/${normalizeRoomCode(input.roomCode)}/join`, {
            guestUserId: input.guestUserId,
            guestCharacter: input.guestCharacter,
        });
    },

    updateReady(input: UpdateReadyInput) {
        return apiClient.patch<Room>(`/rooms/${normalizeRoomCode(input.roomCode)}/ready`, {
            userId: input.userId,
            ready: input.ready,
        });
    },

    startGame(roomCode: string) {
        return apiClient.post<StartRoomGameResponse>(`/rooms/${normalizeRoomCode(roomCode)}/start`);
    },

    leaveRoom(input: LeaveRoomInput) {
        return apiClient.post<Room>(`/rooms/${normalizeRoomCode(input.roomCode)}/leave`, {
            userId: input.userId,
        });
    },
};

export { resolveApiBaseUrl };
