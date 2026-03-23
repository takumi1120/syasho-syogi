import { defineStore } from "pinia";
import { roomService, type Room, type StartRoomGameResponse } from "../services/roomService";

type RoomState = {
    room: Room | null;
    loading: boolean;
    error: string | null;
};

export const useRoomStore = defineStore("room", {
    state: (): RoomState => ({
        room: null,
        loading: false,
        error: null,
    }),

    getters: {
        roomCode: (state) => state.room?.roomCode ?? "",
        hostUser: (state) => state.room?.hostUser ?? null,
        guestUser: (state) => state.room?.guestUser ?? null,
        roomStatus: (state) => state.room?.status ?? null,
        gameId: (state) => state.room?.gameId ?? null,
        canStart: (state) =>
            !!state.room &&
            !!state.room.guestUserId &&
            state.room.hostReady &&
            state.room.guestReady &&
            state.room.status !== "PLAYING" &&
            state.room.status !== "CLOSED",
    },

    actions: {
        clearError() {
            this.error = null;
        },

        clearRoom() {
            this.room = null;
            this.loading = false;
            this.error = null;
        },

        async createRoom(input: { hostUserId: number; hostCharacter?: string }) {
            this.loading = true;
            this.error = null;

            try {
                const room = await roomService.createRoom(input);
                this.room = room;
                return room;
            } catch (error) {
                const message = error instanceof Error ? error.message : "部屋作成に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchRoom(roomCode: string) {
            this.loading = true;
            this.error = null;

            try {
                const room = await roomService.getRoom(roomCode);
                this.room = room;
                return room;
            } catch (error) {
                const message = error instanceof Error ? error.message : "部屋取得に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async joinRoom(input: { roomCode: string; guestUserId: number; guestCharacter?: string }) {
            this.loading = true;
            this.error = null;

            try {
                const room = await roomService.joinRoom(input);
                this.room = room;
                return room;
            } catch (error) {
                const message = error instanceof Error ? error.message : "部屋参加に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateReady(input: { roomCode: string; userId: number; ready: boolean }) {
            this.loading = true;
            this.error = null;

            try {
                const room = await roomService.updateReady(input);
                this.room = room;
                return room;
            } catch (error) {
                const message = error instanceof Error ? error.message : "準備状態の更新に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async startGame(roomCode: string): Promise<StartRoomGameResponse> {
            this.loading = true;
            this.error = null;

            try {
                const result = await roomService.startGame(roomCode);
                this.room = result.room;
                return result;
            } catch (error) {
                const message = error instanceof Error ? error.message : "ゲーム開始に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async leaveRoom(input: { roomCode: string; userId: number }) {
            this.loading = true;
            this.error = null;

            try {
                const room = await roomService.leaveRoom(input);
                this.room = room;
                return room;
            } catch (error) {
                const message = error instanceof Error ? error.message : "部屋退出に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        startPolling(roomCode: string, intervalMs = 2000) {
            const timer = window.setInterval(async () => {
                try {
                    const room = await roomService.getRoom(roomCode);
                    this.room = room;
                } catch (error) {
                    const message = error instanceof Error ? error.message : "部屋の自動更新に失敗しました";
                    this.error = message;
                }
            }, intervalMs);

            return timer;
        },

        stopPolling(timerId: number | null | undefined) {
            if (timerId != null) {
                window.clearInterval(timerId);
            }
        },
    },
});