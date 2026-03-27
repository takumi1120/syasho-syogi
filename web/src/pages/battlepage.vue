<script setup lang="ts">
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
    <div class="battle-scene">
      <div class="nameplate nameplate-left" :class="{ active: currentPlayer === 1 }">
        <p class="player-side">PLAYER 1 / 先手</p>
        <p class="player-name">{{ player1Name }}</p>
        <p class="player-character">{{ player1Character || "未設定" }}</p>
      </div>

      <div class="nameplate nameplate-center">
        <p class="center-mode">LOCAL BATTLE</p>
        <p class="center-main">
          {{ resultLabel || `${currentTurnName} の手番` }}
        </p>
        <p class="center-sub">
          {{ winReasonLabel || "社長将棋" }}
        </p>
      </div>

      <div class="nameplate nameplate-right" :class="{ active: currentPlayer === 2 }">
        <p class="player-side">PLAYER 2 / 後手</p>
        <p class="player-name">{{ player2Name }}</p>
        <p class="player-character">{{ player2Character || "未設定" }}</p>
      </div>

      <div class="board-area">
        <BattleBoard
          :board="boardRows"
          :selected-square="selectedSquare"
          :legal-targets="legalTargets"
          :active-player="currentPlayer"
          @cell-click="handleCellClick"
        />
      </div>

      <div class="side-panel side-left">
        <BattleHands
          title="現在の持ち駒"
          :pieces="handPieces"
          @select="handleHandClick"
        />
      </div>

      <div class="side-panel side-right">
        <BattleStatusPanel
          :turn-label="currentTurnName"
          :result-label="resultLabel"
          :win-reason-label="winReasonLabel"
          :last-action-label="lastActionLabel"
          :message="message"
          :error-message="errorMessage"
        />
      </div>

      <div class="action-bar">
        <button class="scene-button" type="button" @click="resetBattle">
          リセット
        </button>
        <button class="scene-button" type="button" @click="backToLobby">
          戻る
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.battle-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 12px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at center, rgba(79, 93, 255, 0.2), transparent 38%),
    linear-gradient(180deg, #1a1443 0%, #0b0f2b 100%);
  color: #ffffff;
  overflow: hidden;
}

.battle-scene {
  position: relative;
  width: min(calc(100vw - 24px), calc((100dvh - 24px) * 4 / 3));
  height: min(calc(100dvh - 24px), calc((100vw - 24px) * 3 / 4));
  max-width: 1365px;
  max-height: 1024px;
  border-radius: 28px;
  overflow: hidden;
  background:
    url("/battle/backgrounds/rainbow-battle-bg.png") center / 100% 100% no-repeat;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
}

.battle-scene::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, 0.08) 100%);
  pointer-events: none;
}

.nameplate {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 0 14px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.nameplate-left {
  top: 4%;
  left: 5%;
  width: 25.8%;
  height: 10.5%;
}

.nameplate-center {
  top: 7.5%;
  left: 50%;
  transform: translateX(-50%);
  width: 26%;
  height: 9.8%;
}

.nameplate-right {
  top: 4.3%;
  right: 7%;
  width: 25.8%;
  height: 10.5%;
}

.nameplate.active .player-name {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.45));
}

.player-side {
  margin: 0;
  font-size: clamp(10px, 0.95vw, 13px);
  font-weight: 800;
  letter-spacing: 0.12em;
}

.player-name {
  margin: 3px 0 0;
  font-size: clamp(18px, 1.7vw, 30px);
  font-weight: 900;
  line-height: 1.1;
  word-break: break-word;
}

.player-character {
  margin: 3px 0 0;
  font-size: clamp(11px, 0.95vw, 15px);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nameplate-left .player-side {
  color: #d6f6ff;
}

.nameplate-right .player-side {
  color: #ffd8ec;
}

.center-mode {
  margin: 0;
  font-size: clamp(10px, 0.95vw, 13px);
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #fff4a8;
}

.center-main {
  margin: 4px 0 0;
  font-size: clamp(18px, 1.5vw, 28px);
  font-weight: 900;
  line-height: 1.1;
}

.center-sub {
  margin: 3px 0 0;
  font-size: clamp(11px, 0.95vw, 14px);
  color: #eef2ff;
}

.board-area {
  position: absolute;
  top: 7%;
  left: 45%;
  transform: translateX(-50%);
  width: 44.2%;
  aspect-ratio: 3 / 4;
  z-index: 2;
}

.side-panel {
  position: absolute;
  z-index: 4;
  width: 22.5%;
}

.side-left {
  left: 2.8%;
  bottom: 7.2%;
}

.side-right {
  right: 2.8%;
  bottom: 7.2%;
}

.action-bar {
  position: absolute;
  left: 50%;
  bottom: 2.4%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 12px;
}

.scene-button {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 900;
  color: #ffffff;
  cursor: pointer;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08)),
    rgba(43, 36, 93, 0.66);
  backdrop-filter: blur(8px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.scene-button:hover {
  transform: translateY(-1px);
}

:deep(.panel) {
  background:
    linear-gradient(180deg, rgba(48, 34, 113, 0.56), rgba(17, 18, 48, 0.48));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(10px);
}

:deep(.panel h3) {
  color: #fff5b8;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

:deep(.panel dt),
:deep(.panel .hint),
:deep(.panel .character),
:deep(.panel .row dd) {
  color: #f2f6ff;
}

:deep(.hand-chip) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

:deep(.hand-chip.active) {
  background: rgba(112, 97, 255, 0.34);
  outline: 2px solid rgba(255, 255, 255, 0.75);
}

@media (max-width: 900px) {
  .board-area {
    width: 46%;
  }

  .side-panel {
    width: 24%;
  }
}

@media (max-width: 760px) {
  .battle-page {
    padding: 8px;
  }

  .battle-scene {
    width: min(calc(100vw - 16px), calc((100dvh - 16px) * 4 / 3));
    height: min(calc(100dvh - 16px), calc((100vw - 16px) * 3 / 4));
    border-radius: 18px;
  }

  .nameplate-left,
  .nameplate-right {
    width: 29%;
    height: 11%;
  }

  .nameplate-center {
    width: 31%;
  }

  .board-area {
    top: 10%;
    width: 47%;
  }

  .side-panel {
    width: 26%;
    bottom: 5.6%;
  }

  .action-bar {
    bottom: 1.6%;
    gap: 8px;
  }

  .scene-button {
    padding: 8px 14px;
    font-size: 12px;
  }
}

@media (max-width: 560px) {
  .board-area {
    top: 10%;
    width: 48.5%;
  }

  .side-panel {
    width: 29%;
  }

  .player-character,
  .center-sub {
    display: none;
  }

  :deep(.panel) {
    padding: 10px 12px;
  }

  :deep(.hand-list) {
    grid-template-columns: 1fr;
  }

  :deep(.hand-image) {
    width: 42px;
    height: 42px;
  }

  :deep(.count) {
    font-size: 12px;
  }
}
</style>