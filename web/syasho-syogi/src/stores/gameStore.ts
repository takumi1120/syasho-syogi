import { defineStore } from "pinia";
import { gameService, type Game, type GameStatus } from "../services/gameService";

type GameState = {
    game: Game | null;
    loading: boolean;
    error: string | null;
};

export const useGameStore = defineStore("game", {
    state: (): GameState => ({
        game: null,
        loading: false,
        error: null,
    }),

    getters: {
        gameId: (state) => state.game?.id ?? null,
        boardState: (state) => state.game?.boardState ?? null,
        currentTurn: (state) => state.game?.currentTurn ?? 1,
        status: (state) => state.game?.status ?? null,
        player1: (state) => state.game?.player1 ?? null,
        player2: (state) => state.game?.player2 ?? null,
        winner: (state) => state.game?.winner ?? null,
        isPlaying: (state) => state.game?.status === "PLAYING",
        isFinished: (state) => state.game?.status === "FINISHED",
        isAborted: (state) => state.game?.status === "ABORTED",
    },

    actions: {
        clearError() {
            this.error = null;
        },

        clearGame() {
            this.game = null;
            this.loading = false;
            this.error = null;
        },

        async fetchGame(gameId: number) {
            this.loading = true;
            this.error = null;

            try {
                const game = await gameService.getGame(gameId);
                this.game = game;
                return game;
            } catch (error) {
                const message = error instanceof Error ? error.message : "ゲーム取得に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateState(input: {
            gameId: number;
            boardState: unknown;
            currentTurn?: number;
            status?: GameStatus;
        }) {
            this.loading = true;
            this.error = null;

            try {
                const game = await gameService.updateState(input);
                this.game = game;
                return game;
            } catch (error) {
                const message = error instanceof Error ? error.message : "盤面更新に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async finishGame(input: {
            gameId: number;
            winnerId: number | null;
            boardState?: unknown;
        }) {
            this.loading = true;
            this.error = null;

            try {
                const game = await gameService.finishGame(input);
                this.game = game;
                return game;
            } catch (error) {
                const message = error instanceof Error ? error.message : "ゲーム終了に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async abortGame(gameId: number) {
            this.loading = true;
            this.error = null;

            try {
                const game = await gameService.abortGame(gameId);
                this.game = game;
                return game;
            } catch (error) {
                const message = error instanceof Error ? error.message : "ゲーム中断に失敗しました";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        startPolling(gameId: number, intervalMs = 1500) {
            const timer = window.setInterval(async () => {
                try {
                    const game = await gameService.getGame(gameId);
                    this.game = game;
                } catch (error) {
                    const message = error instanceof Error ? error.message : "ゲームの自動更新に失敗しました";
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