<script setup lang="ts">
import BattleLayout from "../features/battle/components/BattleLayout.vue";
import BattleBoard from "../features/battle/components/BattleBoard.vue";
import BattleHands from "../features/battle/components/BattleHands.vue";
import BattleStatusPanel from "../features/battle/components/BattleStatusPanel.vue";
import BattlePlayerPanel from "../features/battle/components/BattlePlayerPanel.vue";

import { useOnlineBattle } from "../features/battle/composables/useOnlineBattle";

const {
  loading,
  roomCode,
  gameId,
  player1Name,
  player2Name,
  player1Character,
  player2Character,
  boardRows,
  selectedSquare,
  currentPlayer,
  currentTurnName,
  resultLabel,
  winReasonLabel,
  lastActionLabel,
  handPieces,
  message,
  errorMessage,
  canInteract,
  isMyTurn,
  legalTargets,
  fetchGame,
  handleHandClick,
  handleCellClick,
  backToLobby,
} = useOnlineBattle();
</script>

<template>
  <section class="battle-page">
    <BattleLayout>
      <template #header>
        <div class="hero-card">
          <div class="hero-text">
            <p class="eyebrow">ONLINE BATTLE</p>
            <h1>社長将棋</h1>
            <p class="sub">
              {{ player1Name }} vs {{ player2Name }}
            </p>
            <p class="meta">
              <span v-if="roomCode">ROOM: {{ roomCode }}</span>
              <span v-if="gameId">GAME: {{ gameId }}</span>
              <span>{{ loading ? "同期中..." : isMyTurn ? "あなたの手番" : "相手の手番" }}</span>
            </p>
          </div>

          <div class="hero-actions">
            <button class="ghost-button" type="button" @click="fetchGame">
              更新
            </button>
            <button class="ghost-button" type="button" @click="backToLobby">
              ロビーへ戻る
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

        <section class="online-state">
          <h3>オンライン状態</h3>
          <p>{{ loading ? "サーバー同期中" : "同期済み" }}</p>
          <p>{{ canInteract ? "操作できます" : "今は操作できません" }}</p>
        </section>
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
  gap: 14px;
  padding: 14px 18px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
  border-radius: 22px;
}

.hero-text {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.sub {
  margin: 6px 0 0;
  color: #bcd4ef;
  font-size: 14px;
  line-height: 1.4;
}

.meta {
  margin: 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #8ec5ff;
  font-size: 12px;
}

.hero-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ghost-button {
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid rgba(160, 205, 255, 0.22);
  font-weight: 800;
  cursor: pointer;
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
  font-size: 13px;
}

.main-stack {
  min-height: 0;
  display: grid;
}

.online-state {
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

.online-state h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.online-state p {
  margin: 0;
  color: #bcd4ef;
  line-height: 1.5;
  font-size: 13px;
}

.online-state p + p {
  margin-top: 4px;
}

@media (max-width: 980px) {
  .battle-page {
    overflow: auto;
  }
}

@media (max-width: 640px) {
  .battle-page {
    overflow: auto;
  }

  .hero-card {
    padding: 14px;
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: 21px;
  }

  .sub {
    font-size: 13px;
  }

  .meta {
    font-size: 11px;
  }
}
</style>