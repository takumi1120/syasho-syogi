<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BattleHeader from "../components/battle/BattleHeader.vue";
import BattleBoard from "../components/battle/BattleBoard.vue";
import ReservePanel from "../components/battle/ReservePanel.vue";
import BattleControls from "../components/battle/BattleControls.vue";
import BattleRules from "../components/battle/BattleRules.vue";

import { useBattleBgm } from "../composables/useBattleBgm";
import { useOnlineBattleGame } from "../composables/useOnlineBattleGame";

import type { PieceSize, Player } from "../types/battle.types";

const router = useRouter();
const route = useRoute();

const roomId =
  typeof route.params.roomId === "string" ? route.params.roomId.toUpperCase() : "";

const localPlayer: Player = route.query.player === "2" ? 2 : 1;

const {
  board,
  reserveP1,
  reserveP2,
  currentPlayer,
  winner,
  message,
  error,
  player1Name,
  player2Name,
  player1CharacterName,
  player2CharacterName,
  player1CharacterImage,
  player2CharacterImage,
  playerImage,
  selectReservePiece,
  handleCellClick,
  resetRoom,
  isSelectedReservePiece,
  isSelectedBoardPiece,
  isWinningCell,
  isPlayableCell,
  reserveText,
  boardPieceAt,
  coinTossVisible,
  coinTossSpinning,
  coinTossFace,
  coinTossResultText,
} = useOnlineBattleGame({
  roomId,
  localPlayer,
});

const { playing, startBgm, stopBgm } = useBattleBgm();

function pieceSizeClass(size: PieceSize): string {
  if (size === 1) return "piece-s";
  if (size === 2) return "piece-m";
  return "piece-l";
}

async function copyRoomId() {
  try {
    await navigator.clipboard.writeText(roomId);
    alert(`ルームIDをコピーしました: ${roomId}`);
  } catch {
    alert(`ルームID: ${roomId}`);
  }
}

function handleReset() {
  void resetRoom();
}

function goHome() {
  stopBgm();
  router.push("/online");
}

onMounted(async () => {
  try {
    await startBgm();
  } catch {
    // 自動再生ブロック対策
  }
});

onBeforeUnmount(() => {
  stopBgm();
});
</script>

<template>
  <div class="battle-page">
    <div class="page-inner">
      <button class="room-floating" type="button" @click="copyRoomId">
        ルームID: {{ roomId }} / P{{ localPlayer }}
      </button>

      <h1>Gobblet Gobblers</h1>

      <div v-if="coinTossVisible" class="coin-toss-overlay">
        <div class="coin-toss-card">
          <p class="coin-toss-label">先手決定</p>

        <div
  class="coin-toss-coin"
  :class="[
    { spinning: coinTossSpinning },
    coinTossFace === 'heads' ? 'heads' : '',
    coinTossFace === 'tails' ? 'tails' : '',
  ]"
>
  <span class="coin-face face-front face-p1">
    <template v-if="player1CharacterImage">
      <img
        class="coin-face-image"
        :src="player1CharacterImage"
        :alt="`${player1Name} のコイン`"
      />
    </template>
    <span v-else class="coin-face-fallback">表</span>
    <span class="coin-face-badge badge-p1">{{ player1Name }}</span>
  </span>

  <span class="coin-face face-back face-p2">
    <template v-if="player2CharacterImage">
      <img
        class="coin-face-image"
        :src="player2CharacterImage"
        :alt="`${player2Name} のコイン`"
      />
    </template>
    <span v-else class="coin-face-fallback">裏</span>
    <span class="coin-face-badge badge-p2">{{ player2Name }}</span>
  </span>
</div>

          <p class="coin-toss-text">{{ coinTossResultText }}</p>
          <p class="coin-toss-sub">表: {{ player1Name }} / 裏: {{ player2Name }}</p>
        </div>
      </div>

      <BattleHeader
        class="battle-header"
        :player1-name="player1Name"
        :player2-name="player2Name"
        :player1-character-name="player1CharacterName"
        :player2-character-name="player2CharacterName"
        :player1-character-image="player1CharacterImage"
        :player2-character-image="player2CharacterImage"
      />

      <div
        class="turn-banner"
        :class="currentPlayer === 1 ? 'banner-p1' : 'banner-p2'"
      >
        {{ message }}
      </div>

      <p v-if="error" class="error-inline">{{ error }}</p>

      <div class="game-layout">
  <ReservePanel
    class="reserve-panel"
    :title="player1Name"
    :pieces="reserveP1"
    :current-player="currentPlayer"
    :owner="1"
    :winner="winner"
    :piece-size-class="pieceSizeClass"
    :is-selected-reserve-piece="isSelectedReservePiece"
    :reserve-text="reserveText"
    :player-image="playerImage"
    @select="selectReservePiece"
  />

  <BattleBoard
    class="battle-board"
    :board="board"
    :winner="winner"
    :board-piece-at="boardPieceAt"
    :piece-size-class="pieceSizeClass"
    :is-selected-board-piece="isSelectedBoardPiece"
    :is-playable-cell="isPlayableCell"
    :is-winning-cell="isWinningCell"
    :player-image="playerImage"
    @cell-click="handleCellClick"
  />

  <ReservePanel
    class="reserve-panel"
    :title="player2Name"
    :pieces="reserveP2"
    :current-player="currentPlayer"
    :owner="2"
    :winner="winner"
    :piece-size-class="pieceSizeClass"
    :is-selected-reserve-piece="isSelectedReservePiece"
    :reserve-text="reserveText"
    :player-image="playerImage"
    @select="selectReservePiece"
  />
</div>

      <div class="bottom-layout">
        <BattleControls
          class="battle-controls"
          :playing="playing"
          @start-bgm="startBgm"
          @stop-bgm="stopBgm"
          @reset="handleReset"
          @go-home="goHome"
        />

        <BattleRules class="battle-rules" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border-inline: 0;
}

.battle-page {
  --battle-page-top-padding: 0px;
  --battle-page-side-padding: clamp(16px, 1.6vw, 24px);
  --battle-page-bottom-padding: clamp(8px, 1.2vh, 10px);
  --battle-section-gap: clamp(1px, 0.3vh, 3px);
  --battle-title-size: clamp(17px, 1.8vh, 22px);
  --battle-header-gap: clamp(20px, 4vw, 56px);
  --battle-header-card-width: clamp(168px, 13vw, 196px);
  --battle-header-card-padding-y: clamp(2px, 0.4vh, 4px);
  --battle-header-card-padding-x: clamp(10px, 0.9vw, 12px);
  --battle-header-image-size: clamp(50px, 5.7vh, 60px);
  --battle-player-name-size: clamp(11px, 1.3vh, 13px);
  --battle-character-name-size: clamp(9px, 1vh, 10px);
  --battle-banner-max-width: clamp(280px, 30vw, 340px);
  --battle-banner-font-size: clamp(15px, 1.85vh, 18px);
  --battle-banner-padding-y: clamp(3px, 0.45vh, 5px);
  --battle-banner-padding-x: clamp(12px, 1vw, 15px);
  --battle-banner-lift: clamp(84px, 10vh, 104px);
  --battle-side-panel-width: clamp(214px, 15vw, 248px);
  --battle-layout-gap: clamp(12px, 1.2vw, 20px);
  --battle-side-panel-padding-top: clamp(10px, 1.3vh, 12px);
  --battle-side-panel-padding-x: clamp(9px, 0.8vw, 11px);
  --battle-side-panel-padding-bottom: clamp(12px, 1.5vh, 14px);
  --battle-side-heading-size: clamp(14px, 1.8vh, 17px);
  --battle-side-piece-column-min: clamp(84px, 6.5vw, 104px);
  --battle-reserve-gap: clamp(6px, 0.9vh, 8px);
  --battle-reserve-height-s: clamp(56px, 7vh, 68px);
  --battle-reserve-height-m: clamp(68px, 8.8vh, 82px);
  --battle-reserve-height-l: clamp(82px, 10.6vh, 96px);
  --battle-reserve-scale-s: 0.58;
  --battle-reserve-scale-m: 0.68;
  --battle-reserve-scale-l: 0.8;
  --battle-board-size: clamp(600px, calc(100svh - 350px), 680px);
  --battle-board-lift: clamp(130px, 14vh, 160px);
  --battle-stack-size: clamp(20px, 2.8vh, 24px);
  --battle-stack-font-size: clamp(11px, 1.6vh, 13px);
  --battle-bottom-gap: clamp(10px, 1vw, 12px);
  --battle-button-gap: clamp(6px, 0.8vh, 8px);
  --battle-button-min-width: clamp(104px, 9vw, 122px);
  --battle-button-padding-y: clamp(7px, 0.9vh, 9px);
  --battle-button-padding-x: clamp(10px, 0.9vw, 14px);
  --battle-button-font-size: clamp(12px, 1.4vh, 13px);
  --battle-rules-padding-y: clamp(8px, 1vh, 10px);
  --battle-rules-padding-x: clamp(12px, 1vw, 14px);
  --battle-rules-title-size: clamp(14px, 1.8vh, 15px);
  --battle-rules-item-size: clamp(11px, 1.35vh, 12px);
  --battle-rules-columns: 1;
  --battle-rules-column-gap: clamp(10px, 1.1vw, 14px);
  --battle-piece-size-s: clamp(42px, 5.7vh, 56px);
  --battle-piece-size-m: clamp(58px, 7.8vh, 76px);
  --battle-piece-size-l: clamp(72px, 9.9vh, 96px);

  min-height: 100vh;
  background:
    linear-gradient(rgba(15, 8, 4, 0.60), rgba(15, 8, 4, 0.72)),
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffe3ad;
}

.page-inner {
  width: min(100%, 1760px);
  min-height: 100vh;
  margin: 0 auto;
  box-sizing: border-box;
  padding:
    var(--battle-page-top-padding)
    var(--battle-page-side-padding)
    var(--battle-page-bottom-padding);
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: var(--battle-section-gap);
  position: relative;
}

.room-floating {
  position: absolute;
  top: 8px;
  right: var(--battle-page-side-padding);
  z-index: 10;
  border: 1px solid rgba(255, 212, 138, 0.35);
  background: rgba(38, 24, 14, 0.86);
  color: #ffe3ad;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
  margin-right: 300px;
}

h1 {
  margin: 0;
  text-align: center;
  font-size: var(--battle-title-size);
  line-height: 1.05;
  font-weight: 900;
  color: #ffd27a;
  text-shadow:
    0 2px 10px rgba(0, 0, 0, 0.55),
    0 0 18px rgba(255, 170, 70, 0.22);
}

.coin-toss-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: rgba(10, 6, 3, 0.42);
  backdrop-filter: blur(4px);
}

.coin-toss-card {
  width: min(420px, calc(100% - 32px));
  padding: 24px 20px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 214, 147, 0.38);
  background:
    linear-gradient(180deg, rgba(62, 37, 20, 0.96), rgba(30, 18, 10, 0.96));
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 240, 210, 0.18);
  text-align: center;
}

.coin-toss-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #ffd79b;
}

.coin-toss-coin {
  position: relative;
  width: 116px;
  height: 116px;
  margin: 0 auto 16px;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
}

.coin-toss-coin.spinning {
  animation: coin-spin 0.9s linear infinite;
}

.coin-toss-coin.heads {
  transform: rotateY(0deg);
}

.coin-toss-coin.tails {
  transform: rotateY(180deg);
}
.coin-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  backface-visibility: hidden;
  box-shadow:
    inset 0 3px 10px rgba(255, 255, 255, 0.38),
    inset 0 -8px 16px rgba(0, 0, 0, 0.18),
    0 12px 24px rgba(0, 0, 0, 0.28);
}

.face-p1 {
  border: 3px solid rgba(210, 255, 224, 0.82);
  background:
    radial-gradient(circle at 30% 30%, #ebfff1 0%, #66cf86 46%, #1f6f3d 100%);
}

.face-p2 {
  border: 3px solid rgba(255, 221, 221, 0.82);
  background:
    radial-gradient(circle at 30% 30%, #fff0f0 0%, #eb7272 46%, #8b2323 100%);
}

.coin-face-image {
  width: 72%;
  height: 72%;
  object-fit: cover;
  border-radius: 999px;
  border: 2px solid rgba(255, 247, 224, 0.9);
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.18);
}

.coin-face-fallback {
  font-size: 28px;
  font-weight: 900;
  color: #2f1607;
}

.coin-face-badge {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.22);
}

.badge-p1 {
  color: #effff4;
  background: rgba(18, 93, 47, 0.88);
}

.badge-p2 {
  color: #fff2f2;
  background: rgba(123, 25, 25, 0.88);
}

.face-back {
  transform: rotateY(180deg);
}

.coin-toss-text {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #ffe9bf;
}

.coin-toss-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 227, 173, 0.86);
}

@keyframes coin-spin {
  from {
    transform: rotateY(0deg) rotateZ(0deg);
  }
  to {
    transform: rotateY(720deg) rotateZ(360deg);
  }
}

.battle-header :deep(.player-info-row) {
  width: 100%;
  gap: var(--battle-header-gap);
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
}

.battle-header :deep(.player-info-card) {
  width: var(--battle-header-card-width);
  padding: var(--battle-header-card-padding-y) var(--battle-header-card-padding-x);
  border-radius: 16px;
}

.battle-header :deep(.battle-character-image) {
  width: var(--battle-header-image-size);
  height: var(--battle-header-image-size);
  margin-bottom: 8px;
}

.battle-header :deep(.player-name) {
  margin: 0 0 4px;
  font-size: var(--battle-player-name-size);
}

.battle-header :deep(.character-name) {
  margin: 0;
  font-size: var(--battle-character-name-size);
  line-height: 1.2;
}

.turn-banner {
  max-width: var(--battle-banner-max-width);
  margin: 0 auto;
  text-align: center;
  font-size: var(--battle-banner-font-size);
  font-weight: 900;
  padding: var(--battle-banner-padding-y) var(--battle-banner-padding-x);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(4px);
  transform: translateY(calc(var(--battle-banner-lift) * -1));
  position: relative;
  z-index: 6;
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(66, 110, 230, 0.55), rgba(31, 48, 112, 0.42));
  color: #e5efff;
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(215, 76, 76, 0.55), rgba(108, 28, 28, 0.42));
  color: #ffe4e4;
}

.error-inline {
  margin: 0 auto;
  padding: 4px 12px;
  font-size: 12px;
  color: #ffb4b4;
  text-align: center;
  transform: translateY(calc(var(--battle-banner-lift) * -1));
}

.game-layout {
  display: grid;
  grid-template-columns:
    var(--battle-side-panel-width)
    minmax(500px, 1fr)
    var(--battle-side-panel-width);
  gap: var(--battle-layout-gap);
  align-items: start;
  justify-content: center;
  min-height: 0;
}

.battle-board {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: var(--battle-board-lift);
  position: relative;
  z-index: 1;
}

.battle-board :deep(.board-scene) {
  transform: translateY(calc(var(--battle-board-lift) * -1));
  transform-origin: top center;
}

.reserve-panel :deep(.side-panel) {
  padding:
    var(--battle-side-panel-padding-top)
    var(--battle-side-panel-padding-x)
    var(--battle-side-panel-padding-bottom);
  border-radius: 20px;
}

.reserve-panel :deep(.side-panel h2) {
  margin: 0 0 clamp(8px, 1vh, 10px);
  font-size: var(--battle-side-heading-size);
}

.reserve-panel :deep(.reserve-grid) {
  gap: var(--battle-reserve-gap);
}

.reserve-panel :deep(.reserve-piece.piece-s) {
  min-height: var(--battle-reserve-height-s);
}

.reserve-panel :deep(.reserve-piece.piece-m) {
  min-height: var(--battle-reserve-height-m);
}

.reserve-panel :deep(.reserve-piece.piece-l) {
  min-height: var(--battle-reserve-height-l);
}

.reserve-panel :deep(.reserve-piece-inner.piece-s) {
  transform: scale(var(--battle-reserve-scale-s));
}

.reserve-panel :deep(.reserve-piece-inner.piece-m) {
  transform: scale(var(--battle-reserve-scale-m));
}

.reserve-panel :deep(.reserve-piece-inner.piece-l) {
  transform: scale(var(--battle-reserve-scale-l));
}

.bottom-layout {
  width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--battle-bottom-gap);
  align-items: end;
  position: relative;
  z-index: 2;
}

.battle-controls {
  display: flex;
  align-items: flex-end;
  align-self: end;
  justify-self: start;
  min-width: 0;
}

.battle-controls :deep(.buttons) {
  justify-content: flex-start;
  gap: var(--battle-button-gap);
}

.battle-controls :deep(.buttons button) {
  min-width: var(--battle-button-min-width);
  padding: var(--battle-button-padding-y) var(--battle-button-padding-x);
  font-size: var(--battle-button-font-size);
  border-radius: 12px;
}

.battle-rules {
  min-width: 0;
}

.battle-rules :deep(.rules) {
  max-width: none;
  width: 100%;
  padding: var(--battle-rules-padding-y) var(--battle-rules-padding-x);
  border-radius: 16px;
}

.battle-rules :deep(.rules p) {
  margin: 0 0 8px;
  font-size: var(--battle-rules-title-size);
}

.battle-rules :deep(.rules ul) {
  margin: 0;
  padding-left: 18px;
  display: grid;
  grid-template-columns: repeat(var(--battle-rules-columns), minmax(0, 1fr));
  gap: 4px var(--battle-rules-column-gap);
}

.battle-rules :deep(.rules li) {
  margin-bottom: 0;
  line-height: 1.35;
  font-size: var(--battle-rules-item-size);
}

@media (max-width: 1240px) {
  .page-inner {
    min-height: auto;
    padding: 12px 14px 18px;
    grid-template-rows: auto auto auto auto auto;
  }

  .battle-header :deep(.player-info-row) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .game-layout {
    grid-template-columns: 220px minmax(420px, 1fr) 220px;
    gap: 14px;
  }

  .bottom-layout {
    width: min(100%, 680px);
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .battle-controls :deep(.buttons) {
    justify-content: center;
  }

  .room-floating {
    top: 6px;
    right: 14px;
    font-size: 11px;
    padding: 7px 12px;
  }
}

@media (max-width: 980px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .bottom-layout {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .battle-header :deep(.player-info-card) {
    width: 180px;
  }

  .battle-rules :deep(.rules ul) {
    grid-template-columns: 1fr;
  }

  .room-floating {
    position: static;
    justify-self: end;
    margin-bottom: 4px;
  }
}

@media (max-width: 768px) {
  .battle-page {
    --battle-page-side-padding: 10px;
    --battle-page-bottom-padding: 14px;
    --battle-section-gap: 10px;

    --battle-header-gap: 10px;
    --battle-header-card-width: min(44vw, 150px);
    --battle-header-image-size: 52px;
    --battle-player-name-size: 11px;
    --battle-character-name-size: 9px;

    --battle-banner-max-width: 100%;
    --battle-banner-font-size: 14px;
    --battle-banner-padding-y: 8px;
    --battle-banner-padding-x: 10px;
    --battle-banner-lift: 0px;

    --battle-side-panel-width: 100%;
    --battle-layout-gap: 12px;
    --battle-side-panel-padding-top: 10px;
    --battle-side-panel-padding-x: 10px;
    --battle-side-panel-padding-bottom: 10px;
    --battle-side-heading-size: 13px;
    --battle-side-piece-column-min: 0px;

    --battle-reserve-gap: 8px;
    --battle-reserve-height-s: 54px;
    --battle-reserve-height-m: 64px;
    --battle-reserve-height-l: 74px;
    --battle-reserve-scale-s: 0.5;
    --battle-reserve-scale-m: 0.58;
    --battle-reserve-scale-l: 0.68;

    --battle-board-size: min(calc(100vw - 20px), 420px);
    --battle-board-lift: 0px;

    --battle-piece-size-s: 36px;
    --battle-piece-size-m: 50px;
    --battle-piece-size-l: 64px;

    --battle-stack-size: 20px;
    --battle-stack-font-size: 11px;

    --battle-button-min-width: 100%;
    --battle-button-font-size: 14px;

    overflow-x: hidden;
  }

  .page-inner {
    min-height: auto;
    padding: 10px 10px 16px;
    grid-template-rows: auto auto auto auto auto;
    gap: 10px;
  }

  .room-floating {
    position: static;
    justify-self: end;
    margin: 0 0 4px auto;
  }

  .battle-header :deep(.player-info-row) {
    gap: 10px;
    justify-content: center;
  }

  .turn-banner {
    width: 100%;
    max-width: 100%;
    transform: none;
    margin-top: 0;
  }

  .game-layout {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .battle-board {
    padding-bottom: 0;
  }

  .battle-board :deep(.board-scene) {
    transform: none;
  }

  .bottom-layout {
    grid-template-columns: 1fr;
    width: 100%;
    gap: 10px;
  }

  .battle-controls {
    width: 100%;
  }

  .battle-controls :deep(.buttons) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .battle-controls :deep(.buttons button) {
    width: 100%;
    min-width: 0;
  }

  .coin-toss-card {
    width: min(360px, calc(100% - 24px));
    padding: 20px 16px 18px;
  }

  .coin-toss-coin {
    width: 96px;
    height: 96px;
  }

  .coin-toss-text {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 24px;
  }

  .battle-header :deep(.player-info-card) {
    width: min(44vw, 140px);
  }

  .room-floating {
    font-size: 10px;
    padding: 6px 10px;
  }
}

@media (min-width: 981px) {
  .battle-page {
    height: 100vh;
    overflow: hidden;
  }

  .page-inner {
    min-height: 100%;
    height: 100%;
  }
}
</style>