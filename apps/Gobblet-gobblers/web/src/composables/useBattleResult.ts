import { ref } from "vue";
import { api } from "../lib/api";
import type { Player } from "../types/battle.types";

type Params = {
    player1Id: number | null;
    player2Id: number | null;
};

export function useBattleResult(params: Params) {
    const resultSaving = ref(false);
    const resultSaved = ref(false);

    async function saveBattleResult(winnerPlayer: Player) {
        if (resultSaved.value || resultSaving.value) return;

        if (!params.player1Id || !params.player2Id) {
            console.error("p1Id または p2Id がありません");
            return;
        }

        const winnerId = winnerPlayer === 1 ? params.player1Id : params.player2Id;
        const loserId = winnerPlayer === 1 ? params.player2Id : params.player1Id;

        resultSaving.value = true;

        try {
            await api.post("results/battle/result", {
                winnerId,
                loserId,
            });

            resultSaved.value = true;
            console.log("対戦結果を保存しました");
        } catch (e) {
            console.error("対戦結果の保存に失敗しました", e);
        } finally {
            resultSaving.value = false;
        }
    }

    function resetResultState() {
        resultSaving.value = false;
        resultSaved.value = false;
    }

    return {
        resultSaving,
        resultSaved,
        saveBattleResult,
        resetResultState,
    };
}