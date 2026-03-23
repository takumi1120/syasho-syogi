<script setup lang="ts">
import BattleLayout from "../features/battle/components/BattleLayout.vue";
import BattleBoard from "../features/battle/components/BattleBoard.vue";
import BattleHands from "../features/battle/components/BattleHands.vue";
import BattleStatusPanel from "../features/battle/components/BattleStatusPanel.vue";
import BattlePlayerPanel from "../features/battle/components/BattlePlayerPanel.vue";

import { useLocalBattle } from "../features/battle/composables/useLocalBattle";

const {
  player1Name,
  player2Name,
  player1Character,
  player2Character,
  boardRows,
  legalTargets,
  selectedSquare,
  currentPlayer,
  currentTurnName,
  resultLabel,
  winReasonLabel,
  lastActionLabel,
  handPieces,
  message,
  errorMessage,
  handleHandClick,
  handleCellClick,
  resetBattle,
  backToLobby,
} = useLocalBattle();

</script>

<template>
  <section class="battle-page">
    <BattleLayout>
      <template #header>
        <div class="hero-card">
          <div>
            <p class="eyebrow">LOCAL BATTLE</p>
            <h1>社長将棋</h1>
            <p class="sub">{{ player1Name }} vs {{ player2Name }}</p>
          </div>

          <div class="hero-actions">
            <button class="ghost-button" type="button" @click="backToLobby">
              ロビーへ戻る
            </button>
            <button class="ghost-button" type="button" @click="resetBattle">
              リセット
            </button>
          </div>
        </div>
      </template>

      <div class="main-stack">
        <BattleStatusPanel
          :turn-label="currentTurnName"
          :result-label="resultLabel"
          :win-reason-label="winReasonLabel"
          :last-action-label="lastActionLabel"
          :message="message"
          :error-message="errorMessage"
        />

     <BattleBoard
  :board="boardRows"
  :selected-square="selectedSquare"
  :legal-targets="legalTargets"
  :active-player="currentPlayer"
  @cell-click="handleCellClick"
/>
      </div>

      <template #sidebar>
        <BattlePlayerPanel
          position="先手"
          :name="player1Name"
          :character-name="player1Character || '未設定'"
          :active="currentPlayer === 1"
        />

        <BattlePlayerPanel
          position="後手"
          :name="player2Name"
          :character-name="player2Character || '未設定'"
          :active="currentPlayer === 2"
        />

        <BattleHands
          title="現在の持ち駒"
          :pieces="handPieces"
          @select="handleHandClick"
        />
      </template>
    </BattleLayout>
  </section>
</template>

<style scoped>
.battle-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(128, 196, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #16233d 0%, #0d162a 58%, #07101d 100%);
  color: #eef5ff;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  border-radius: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 28px;
}

.sub {
  margin: 8px 0 0;
  color: #bcd4ef;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-button {
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(160, 205, 255, 0.22);
  font-weight: 800;
  cursor: pointer;
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
}

.main-stack {
  display: grid;
  gap: 16px;
}

@media (max-width: 640px) {
  .hero-card {
    padding: 18px;
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: 22px;
  }
}
</style>