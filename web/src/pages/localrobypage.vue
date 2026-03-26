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
          <div class="hero-text">
            <p class="eyebrow">LOCAL BATTLE</p>
            <h1>社長将棋</h1>
            <p class="sub">{{ player1Name }} vs {{ player2Name }}</p>
          </div>

          <div class="hero-actions">
            <button class="ghost-button" type="button" @click="backToLobby">
              戻る
            </button>
            <button class="ghost-button" type="button" @click="resetBattle">
              リセット
            </button>
          </div>
        </div>
      </template>

      <div class="main-stack">
        <BattleBoard
          :board="boardRows"
          :selected-square="selectedSquare"
          :legal-targets="legalTargets"
          :active-player="currentPlayer"
          @cell-click="handleCellClick"
        />
      </div>

      <template #sidebar>
        <BattleStatusPanel
          :turn-label="currentTurnName"
          :result-label="resultLabel"
          :win-reason-label="winReasonLabel"
          :last-action-label="lastActionLabel"
          :message="message"
          :error-message="errorMessage"
        />

        <div class="player-grid">
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
        </div>

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
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(128, 196, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #16233d 0%, #0d162a 58%, #07101d 100%);
  color: #eef5ff;
  overflow: hidden;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-radius: 18px;
}

.hero-text {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 3px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
}

.sub {
  margin: 4px 0 0;
  color: #bcd4ef;
  font-size: 12px;
  line-height: 1.35;
}

.hero-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ghost-button {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(160, 205, 255, 0.22);
  font-weight: 800;
  cursor: pointer;
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
  font-size: 12px;
}

.main-stack {
  min-height: 0;
  display: grid;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 980px) {
  .battle-page {
    overflow: auto;
  }

  .player-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .battle-page {
    overflow: auto;
  }

  .hero-card {
    padding: 12px;
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: 18px;
  }

  .sub {
    font-size: 11px;
  }
}
</style>