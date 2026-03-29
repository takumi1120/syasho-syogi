<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import BattleBoard from "../features/battle/components/BattleBoard.vue";
import BattleHands from "../features/battle/components/BattleHands.vue";
import BattleStatusPanel from "../features/battle/components/BattleStatusPanel.vue";

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
  player1HandPieces,
  player2HandPieces,
  message,
  errorMessage,
  isMyTurn,
  legalTargets,
  fetchGame,
  handleHandClick,
  handleCellClick,
  backToLobby,
} = useOnlineBattle();

const showExitNotice = computed(() => resultLabel.value === "対局中断");

const exitNoticeTitle = computed(() => "対戦相手が退出しました");

const exitNoticeText = computed(() => {
  if (message.value.trim()) return message.value;
  return "相手の退出により対局は中断されました";
});

const exitNoticeSubText = computed(() => {
  if (roomCode.value) {
    return gameId.value
      ? `ROOM: ${roomCode.value} / GAME: ${gameId.value}`
      : `ROOM: ${roomCode.value}`;
  }
  return "オンライン対戦";
});

// ===== BGM =====
const BGM_SRC = "/bgm/battle-bgm.mp3";
let bgm: HTMLAudioElement | null = null;
const bgmStarted = ref(false);

function ensureBgm() {
  if (!bgm) {
    bgm = new Audio(BGM_SRC);
    bgm.loop = true;
    bgm.volume = 0.35;
    bgm.preload = "auto";
  }
  return bgm;
}

async function playBgm() {
  try {
    const audio = ensureBgm();
    await audio.play();
    bgmStarted.value = true;
    console.log("online battle bgm started:", BGM_SRC);
  } catch (error) {
    console.log("online battle bgm blocked or failed:", error);
  }
}

const isMusicPlaying = ref(true);

async function handleToggleMusic() {
  if (isMusicPlaying.value) {
    stopBgm(false);
    isMusicPlaying.value = false;
    return;
  }

  await playBgm();
  isMusicPlaying.value = true;
}

function unlockAndPlayBgm() {
  if (bgmStarted.value) return;
  void playBgm();
}

function stopBgm(reset = false) {
  if (!bgm) return;
  bgm.pause();

  if (reset) {
    bgm.currentTime = 0;
  }
}

async function handleBackToLobby() {
  stopBgm(true);
  await backToLobby();
}

onMounted(() => {
  void playBgm();
});

onBeforeUnmount(() => {
  stopBgm(true);
  bgm = null;
  bgmStarted.value = false;
});
</script>

<template>
  <section class="battle-page" @pointerdown.once="unlockAndPlayBgm">
    <div class="battle-scene">
      <transition name="exit-notice">
        <div v-if="showExitNotice" class="exit-notice-overlay">
          <div class="exit-notice-card">
            <p class="exit-notice-badge">ONLINE BATTLE</p>
            <h2 class="exit-notice-title">{{ exitNoticeTitle }}</h2>
            <p class="exit-notice-text">{{ exitNoticeText }}</p>
            <p class="exit-notice-subtext">{{ exitNoticeSubText }}</p>

            <div class="exit-notice-actions">
              <button class="exit-notice-button" type="button" @click="handleBackToLobby">
                ロビーへ戻る
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="nameplate nameplate-left" :class="{ active: currentPlayer === 1 }">
        <p class="player-side">PLAYER 1 / 先手</p>
        <p class="player-name">{{ player1Name }}</p>
        <p class="player-character">{{ player1Character || "未設定" }}</p>
      </div>

      <div class="nameplate nameplate-center">
        <p class="center-mode">ONLINE BATTLE</p>
        <p class="center-main">
          {{ resultLabel || (isMyTurn ? "あなたの手番" : `${currentTurnName} の手番`) }}
        </p>
        <p class="center-sub">
          {{
            resultLabel
              ? (winReasonLabel || "対局終了")
              : roomCode
                ? `ROOM: ${roomCode}${gameId ? ` / GAME: ${gameId}` : ""}`
                : (loading ? "同期中..." : "オンライン対戦")
          }}
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

      <div class="hand-panel hand-panel-left">
        <BattleHands
          title="先手の持ち駒"
          :pieces="player1HandPieces"
          :selectable="isMyTurn && currentPlayer === 1"
          :show-hint="false"
          @select="handleHandClick"
        />
      </div>

      <div class="hand-panel hand-panel-right">
        <BattleHands
          title="後手の持ち駒"
          :pieces="player2HandPieces"
          :selectable="isMyTurn && currentPlayer === 2"
          :show-hint="false"
          @select="handleHandClick"
        />
      </div>

      <div class="status-panel">
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
        <button class="scene-button" type="button" @click="fetchGame">
          更新
        </button>
        <button class="scene-button" type="button" @click="handleBackToLobby">
          戻る
        </button>
        <button class="music-toggle-button" type="button" @click="handleToggleMusic">
          {{ isMusicPlaying ? "音楽停止" : "音楽再生" }}
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
    url("/battle/backgrounds/rainbow_battle_bg_animated_stronger_hq.gif") center / 100% 100% no-repeat;
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

.exit-notice-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(7, 10, 30, 0.48);
  backdrop-filter: blur(6px);
}

.exit-notice-card {
  width: min(92%, 620px);
  padding: 34px 28px 28px;
  border-radius: 30px;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08)),
    linear-gradient(180deg, rgba(101, 58, 182, 0.92), rgba(38, 29, 101, 0.94));
  border: 2px solid rgba(255, 255, 255, 0.34);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.exit-notice-badge {
  margin: 0;
  font-size: clamp(12px, 1vw, 15px);
  font-weight: 900;
  letter-spacing: 0.2em;
  color: #fff3a6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.exit-notice-title {
  margin: 12px 0 0;
  font-size: clamp(30px, 3vw, 52px);
  line-height: 1.08;
  font-weight: 900;
  color: #ffffff;
  text-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    0 0 24px rgba(255, 255, 255, 0.16);
}

.exit-notice-text {
  margin: 16px 0 0;
  font-size: clamp(16px, 1.35vw, 22px);
  line-height: 1.7;
  font-weight: 800;
  color: #f7f4ff;
}

.exit-notice-subtext {
  margin: 12px 0 0;
  font-size: clamp(12px, 1vw, 15px);
  line-height: 1.5;
  color: rgba(239, 242, 255, 0.9);
}

.exit-notice-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
}

.exit-notice-button {
  min-width: 220px;
  height: 52px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  color: #4d2b8a;
  background:
    linear-gradient(180deg, #fff8d5 0%, #ffe9a2 100%);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition:
    transform 0.18s ease,
    filter 0.18s ease;
}

.exit-notice-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.exit-notice-button:active {
  transform: scale(0.98);
}

.exit-notice-enter-active,
.exit-notice-leave-active {
  transition: opacity 0.22s ease;
}

.exit-notice-enter-active .exit-notice-card,
.exit-notice-leave-active .exit-notice-card {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.exit-notice-enter-from,
.exit-notice-leave-to {
  opacity: 0;
}

.exit-notice-enter-from .exit-notice-card,
.exit-notice-leave-to .exit-notice-card {
  opacity: 0;
  transform: scale(0.94) translateY(10px);
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
  left: 6%;
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
  top: 4%;
  right: 8%;
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
  top: 8%;
  left: 52%;
  transform: translateX(-50%);
  width: 430px;
  aspect-ratio: 3 / 4;
  z-index: 2;
}

.hand-panel {
  position: absolute;
  z-index: 4;
  width: 22.5%;
}

.hand-panel-left {
  top: 60%;
  left: 2.8%;
}

.hand-panel-right {
  top: 22%;
  right: 3.3%;
}

.status-panel {
  position: absolute;
  left: 87%;
  bottom: 8.8%;
  transform: translateX(-50%);
  z-index: 4;
  width: 25%;
  max-width: 420px;
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
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.hand-chip.active) {
  background: transparent;
  outline: none;
}

.music-toggle-button {
  position: absolute;
  right: 170px;
  bottom: 0px;
  z-index: 10;
  min-width: 108px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 13px;
  color: #4f4a87;
  background: linear-gradient(
    135deg,
    rgba(248, 236, 255, 0.94) 0%,
    rgba(236, 245, 255, 0.96) 50%,
    rgba(226, 239, 255, 0.94) 100%
  );
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.music-toggle-button:hover {
  filter: brightness(1.03);
}

.music-toggle-button:active {
  transform: scale(0.97);
}

@media (max-width: 900px) {
  .board-area {
    width: 46%;
  }

  .hand-panel {
    width: 24%;
  }

  .status-panel {
    width: 33%;
  }

  .exit-notice-card {
    width: min(92%, 560px);
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

  .hand-panel {
    top: 18%;
    width: 26%;
  }

  .board-area {
    top: 29.4%;
    width: 47%;
  }

  .status-panel {
    width: 36%;
    bottom: 7.2%;
  }

  .action-bar {
    bottom: 1.6%;
    gap: 8px;
  }

  .scene-button {
    padding: 8px 14px;
    font-size: 12px;
  }

  .exit-notice-card {
    padding: 28px 20px 22px;
    width: min(94%, 500px);
  }

  .exit-notice-button {
    min-width: 180px;
    height: 46px;
    font-size: 16px;
  }
}

@media (max-width: 560px) {
  .board-area {
    width: 48.5%;
  }

  .hand-panel {
    width: 29%;
  }

  .status-panel {
    width: 39%;
  }

  .player-character,
  .center-sub {
    display: none;
  }

  :deep(.panel) {
    padding: 10px 12px;
  }

  .exit-notice-overlay {
    padding: 16px;
  }

  .exit-notice-title {
    font-size: clamp(24px, 7vw, 34px);
  }

  .exit-notice-text {
    font-size: 15px;
  }

  .exit-notice-subtext {
    font-size: 11px;
  }
}
</style>