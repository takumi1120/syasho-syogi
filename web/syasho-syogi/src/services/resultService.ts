import { apiClient } from "./apiClient";

export type ResultStats = {
    userId: number;
    userName: string;
    totalWins: number;
    totalLoses: number;
    totalGames: number;
    winRate: number;
    rank: number | null;
};

export const resultService = {
    getStats() {
        return apiClient.get<ResultStats[]>("/results/stats");
    },

    getUserStats(userId: number) {
        return apiClient.get<ResultStats>(`/results/stats/${userId}`);
    },
};