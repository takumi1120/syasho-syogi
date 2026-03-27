<script setup lang="ts">
import BattleLayout from "../features/battle/components/BattleLayout.vue";
import BattleBoard from "../features/battle/components/BattleBoard.vue";
import BattleHands from "../features/battle/components/BattleHands.vue";
import BattleStatusPanel from "../features/battle/components/BattleStatusPanel.vue";

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
          <div class="hero-left">
            <p class="eyebrow">LOCAL BATTLE</p>
            <h1>社長将棋</h1>
            <p class="sub">
              {{ player1Name }} vs {{ player2Name }}
            </p>
            <p class="meta">
              <span>ローカル対戦</span>
              <span>現在手番: {{ currentTurnName }}</span>
            </p>
          </div>

          <div class="hero-players">
            <div class="hero-player" :class="{ active: currentPlayer === 1 }">
              <span class="hero-player-position">先手</span>
              <strong class="hero-player-name">{{ player1Name }}</strong>
              <span class="hero-player-character">
                {{ player1Character || "未設定" }}
              </span>
            </div>

            <div class="hero-player" :class="{ active: currentPlayer === 2 }">
              <span class="hero-player-position">後手</span>
              <strong class="hero-player-name">{{ player2Name }}</strong>
              <span class="hero-player-character">
                {{ player2Character || "未設定" }}
              </span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="ghost-button" type="button" @click="resetBattle">
              リセット
            </button>
            <button class="ghost-button" type="button" @click="backToLobby">
              戻る
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
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-radius: 18px;
}

.hero-left {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 2px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
}

.sub {
  margin: 4px 0 0;
  color: #bcd4ef;
  font-size: 11px;
  line-height: 1.3;
}

.meta {
  margin: 4px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #8ec5ff;
  font-size: 10px;
  line-height: 1.3;
}

.hero-players {
  width: 100%;
  max-width: 520px;
  justify-self: center;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.hero-player {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 14px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(18, 30, 53, 0.9);
  display: grid;
  gap: 2px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero-player.active {
  outline: 2px solid #8ec5ff;
}

.hero-player-position {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #8ec5ff;
}

.hero-player-name {
  font-size: 14px;
  line-height: 1.2;
  word-break: break-word;
}

.hero-player-character {
  color: #bcd4ef;
  font-size: 11px;
  line-height: 1.3;
  word-break: break-word;
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

@media (max-width: 980px) {
  .battle-page {
    overflow: auto;
  }

  .hero-card {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .hero-players {
    max-width: none;
  }

  .hero-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .battle-page {
    overflow: auto;
  }

  .hero-card {
    padding: 12px;
  }

  h1 {
    font-size: 18px;
  }

  .hero-players {
    grid-template-columns: 1fr;
  }

  .sub,
  .meta {
    font-size: 11px;
  }
}
</style>