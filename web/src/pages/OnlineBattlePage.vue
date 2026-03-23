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
          <div>
            <p class="eyebrow">ONLINE BATTLE</p>
            <h1>社長将棋</h1>
            <p class="sub">
              {{ player1Name }} vs {{ player2Name }}
            </p>
            <p class="meta">
              <span v-if="roomCode">ROOM: {{ roomCode }}</span>
              <span v-if="gameId">GAME ID: {{ gameId }}</span>
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

        <section class="online-note">
          <h3>オンライン状態</h3>
          <p>{{ loading ? "サーバーと同期中です" : "同期済みです" }}</p>
          <p>{{ canInteract ? "操作できます" : "今は操作できません" }}</p>
        </section>
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

.meta {
  margin: 10px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #8ec5ff;
  font-size: 13px;
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

.online-note {
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

.online-note h3 {
  margin: 0 0 10px;
}

.online-note p {
  margin: 0;
  color: #bcd4ef;
  line-height: 1.7;
}

.online-note p + p {
  margin-top: 6px;
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