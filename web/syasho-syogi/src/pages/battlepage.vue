<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import BattleBoard from "../features/battle/components/BattleBoard.vue";
import BattleHands from "../features/battle/components/BattleHands.vue";
import BattleStatusPanel from "../features/battle/components/BattleStatusPanel.vue";
import { useFixedStage } from "../composables/useFixedStage";
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
  checkLabel,
  resultLabel,
  winReasonLabel,
  lastActionLabel,
  player1HandPieces,
  player2HandPieces,
  message,
  errorMessage,
  handleHandClick,
  handleCellClick,
  resetBattle,
  backToLobby,
} = useLocalBattle();

const { stageShellStyle, stageStyle } = useFixedStage({
  baseWidth: 1920,
  baseHeight: 1080,
});

const BGM_SRC = import.meta.env.BASE_URL + "bgm/battle-bgm.mp3";
const battleBg = `url("${import.meta.env.BASE_URL}battle/backgrounds/rainbow_battle_bg_animated_stronger_hq.gif") center 3px / cover no-repeat`;
let bgm: HTMLAudioElement | null = null;
const bgmStarted = ref(false);
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
  } catch (error) {
    console.log("battle bgm blocked or failed:", error);
  }
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

function handleBackToLobby() {
  stopBgm(true);
  backToLobby();
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
    <div class="battle-stage-shell" :style="stageShellStyle">
      <div class="battle-scene" :style="stageStyle">
        <div class="nameplate nameplate-left" :class="{ active: currentPlayer === 1 }">
          <p class="player-side">PLAYER 1 / 先手</p>
          <p class="player-name">{{ player1Name }}</p>
          <p class="player-character">{{ player1Character || "キャラクター未設定" }}</p>
        </div>

        <div class="nameplate nameplate-center">
          <p class="center-mode">LOCAL BATTLE</p>
          <p class="center-main">{{ resultLabel || `${currentTurnName} の手番` }}</p>
          <p class="center-sub">{{ winReasonLabel || "社長将棋バトル" }}</p>
        </div>

        <div class="nameplate nameplate-right" :class="{ active: currentPlayer === 2 }">
          <p class="player-side">PLAYER 2 / 後手</p>
          <p class="player-name">{{ player2Name }}</p>
          <p class="player-character">{{ player2Character || "キャラクター未設定" }}</p>
        </div>

        <div class="board-area">
          <div class="board-stage-scale">
            <BattleBoard
              :board="boardRows"
              :selected-square="selectedSquare"
              :legal-targets="legalTargets"
              :active-player="currentPlayer"
              @cell-click="handleCellClick"
            />
          </div>
        </div>

        <div class="hand-panel hand-panel-left">
          <BattleHands
            title="先手の持ち駒"
            :pieces="player1HandPieces"
            :selectable="currentPlayer === 1"
            :show-hint="false"
            @select="handleHandClick"
          />
        </div>

        <div class="hand-panel hand-panel-right">
          <BattleHands
            title="後手の持ち駒"
            :pieces="player2HandPieces"
            :selectable="currentPlayer === 2"
            :show-hint="false"
            @select="handleHandClick"
          />
        </div>

        <div class="status-panel">
          <BattleStatusPanel
            :turn-label="currentTurnName"
            :check-label="checkLabel"
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
          <button class="scene-button" type="button" @click="handleBackToLobby">
            ロビーへ
          </button>
          <button class="music-toggle-button" type="button" @click="handleToggleMusic">
            {{ isMusicPlaying ? "音楽停止" : "音楽再開" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.battle-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at center, rgba(79, 93, 255, 0.2), transparent 38%),
    linear-gradient(180deg, #1a1443 0%, #0b0f2b 100%);
  color: #ffffff;
  overflow: hidden;
}

.battle-stage-shell {
  position: relative;
}

.battle-scene {
  position: absolute;
  inset: 0;
  border-radius: 36px;
  overflow: hidden;
  background:
    v-bind(battleBg);
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.38);
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
  padding: 0 18px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.nameplate-left {
  top: 70px;
  left: 180px;
  width: 360px;
  height: 116px;
}

.nameplate-center {
  top: 50px;
  left: 49%;
  transform: translateX(-50%);
  width: 420px;
  height: 108px;
}

.nameplate-right {
  top: 70px;
  right: 240px;
  width: 360px;
  height: 116px;
}

.nameplate.active .player-name {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.45));
}

.player-side {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.player-name {
  margin: 8px 0 0;
  font-size: 42px;
  font-weight: 900;
  line-height: 1.1;
  word-break: break-word;
}

.player-character {
  margin: 8px 0 0;
  font-size: 18px;
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
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #fff4a8;
}

.center-main {
  margin: 8px 0 0;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
}

.center-sub {
  margin: 6px 0 0;
  font-size: 18px;
  color: #eef2ff;
}

.board-area {
  position: absolute;
  top: 15px;
  left: 42%;
  width: 624px;
  height: 780px;
  transform: translateX(-50%);
  z-index: 2;
}

.board-stage-scale {
  width: 400px;
  height: 500px;
  transform: scale(2.2);
  transform-origin: top left;
}

.hand-panel {
  position: absolute;
  z-index: 4;
  width: 340px;
}

.hand-panel-left {
  top: 648px;
  left: 92px;
}

.hand-panel-right {
  top: 248px;
  right: 92px;
}

.status-panel {
  position: absolute;
  right: 92px;
  bottom: 136px;
  z-index: 4;
  width: 360px;
}

.action-bar {
  position: absolute;
  left: 50%;
  bottom: 48px;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 16px;
}

.scene-button,
.music-toggle-button {
  min-width: 148px;
  height: 58px;
  padding: 0 26px;
  border: none;
  border-radius: 999px;
  font-size: 20px;
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

.scene-button:hover,
.music-toggle-button:hover {
  transform: translateY(-1px);
}

:deep(.panel) {
  background:
    linear-gradient(180deg, rgba(48, 34, 113, 0.56), rgba(17, 18, 48, 0.48));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(10px);
}

.hand-panel :deep(.hands-root) {
  padding: 22px 24px;
  border-radius: 24px;
}

.hand-panel :deep(.hand-title) {
  margin-bottom: 16px;
  font-size: 26px;
}

.hand-panel :deep(.hand-list) {
  gap: 14px;
}

.hand-panel :deep(.hand-image) {
  width: 76px;
  height: 76px;
}

.hand-panel :deep(.count) {
  font-size: 24px;
}

.status-panel :deep(.panel) {
  padding: 18px 20px;
  border-radius: 24px;
}

.status-panel :deep(h3) {
  margin-bottom: 14px;
  font-size: 24px;
  color: #fff5b8;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.status-panel :deep(.status-list) {
  gap: 10px;
}

.status-panel :deep(.row) {
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 12px;
}

.status-panel :deep(dt),
.status-panel :deep(.hint),
.status-panel :deep(.character),
.status-panel :deep(.row dd) {
  color: #f2f6ff;
}

.status-panel :deep(dt) {
  font-size: 15px;
}

.status-panel :deep(dd) {
  font-size: 20px;
  line-height: 1.45;
}

.status-panel :deep(.notice) {
  margin-top: 12px;
  padding: 12px 14px;
  font-size: 18px;
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
</style>
