<script setup lang="ts">
import { onMounted } from "vue";
import { onBeforeRouteLeave, RouterLink } from "vue-router";
import GlobalMusicButton from "../components/GlobalMusicButton.vue";
import LobbyShell from "../components/lobby/LobbyShell.vue";
import { useFixedStage } from "../composables/useFixedStage";
import {
  playModeSelectBgm,
  stopModeSelectBgm,
  unlockModeSelectBgm,
} from "../features/audio/modeSelectBgm";
import OnlineLobbyContent from "../features/online-lobby/components/OnlineLobbyContent.vue";

const { stageShellStyle, stageStyle } = useFixedStage({
  baseWidth: 1920,
  baseHeight: 1080,
  viewportPadding: 0,
});

function isBattleDestination(to: { name?: unknown; path?: string }) {
  const nameText = String(to.name ?? "").toLowerCase();
  const pathText = String(to.path ?? "").toLowerCase();

  return nameText.includes("battle") || pathText.includes("battle");
}

onMounted(() => {
  void playModeSelectBgm();
});

onBeforeRouteLeave((to) => {
  if (isBattleDestination(to)) {
    stopModeSelectBgm(true);
  }
});
</script>

<template>
  <section class="lobby-page" @pointerdown.once="unlockModeSelectBgm">
    <div class="lobby-stage-shell" :style="stageShellStyle">
      <div class="lobby-scene" :style="stageStyle">
        <div class="page-overlay"></div>

        <div class="lobby-frame">
          <LobbyShell>
            <OnlineLobbyContent />
          </LobbyShell>

          <RouterLink class="back-link" to="/">
            mode選択へ
          </RouterLink>

          <div class="music-button-wrap">
            <GlobalMusicButton />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  max-width: 100%;
  margin: 0;
  border-inline: none;
}

.lobby-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
}

.lobby-stage-shell {
  position: relative;
}

.lobby-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 36px;
  background: url("../assets/background/loby.png") center / cover no-repeat;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.32);
  color: #fff8ea;
}

.lobby-frame {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 14px 16px 72px;
  box-sizing: border-box;
}

.page-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 14%, rgba(255, 242, 180, 0.16), transparent 24%),
    radial-gradient(circle at 18% 22%, rgba(112, 220, 255, 0.18), transparent 26%),
    radial-gradient(circle at 82% 18%, rgba(200, 146, 255, 0.16), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.1), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(110, 205, 255, 0.1), transparent 32%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.12) 0%,
      rgba(6, 12, 24, 0.12) 30%,
      rgba(6, 12, 24, 0.12) 100%
    );
  pointer-events: none;
}

:deep(.lobby-shell) {
  position: relative;
  z-index: 1;
  height: 100%;
  width: min(100%, 1840px);
}

.lobby-page :deep(.shell-body) {
  margin-top: 0;
}

.lobby-page :deep(.online-lobby-content) {
  height: 100%;
  font-family:
    "Meiryo UI",
    "Meiryo",
    "Hiragino Sans",
    "Yu Gothic UI",
    system-ui,
    sans-serif;
  /* Online lobby size controls */
  /* 左カラム全体の幅 */
  --online-lobby-left-column-width: 700px;
  /* 左右カラムの間隔 */
  --online-lobby-column-gap: 44px;
  /* 左右カラム内でパネル同士を積む間隔 */
  --online-lobby-stack-gap: 14px;
  /* 左右カラム全体を上にずらす量 */
  --online-lobby-column-offset: 100px;
  /* ユーザー情報パネルだけを上にずらす量 */
  --online-lobby-user-area-offset: -80px;
  /* 左下のルーム操作パネルの最低高さ */
  --online-lobby-action-area-min-height: 0px;
  /* 右上のルーム状態パネルの最低高さ */
  --online-lobby-status-area-min-height: 0px;
  /* 右下のフッターボタンパネルの最低高さ */
  --online-lobby-footer-area-min-height: 0px;
  /* ユーザー情報パネル内の各カードの最低高さ */
  --online-lobby-user-card-min-height: 0px;
  /* 入力欄と参加ボタンの高さ */
  --online-lobby-action-control-height: 44px;
  /* ルーム作成ボタンの高さ */
  --online-lobby-action-primary-button-height: 46px;
  /* ルームコード表示とコピーボタンの高さ */
  --online-lobby-room-code-height: 50px;
  /* ルームコード文字の大きさ */
  --online-lobby-room-code-font-size: 28px;
  /* ホスト/ゲスト行の最低高さ */
  --online-lobby-member-row-min-height: 0px;
  /* 右上ステータスバッジの横幅 */
  --online-lobby-status-badge-width: 92px;
  /* 下部の状態ピルの最低横幅 */
  --online-lobby-state-pill-min-width: 132px;
  /* READY/開始/退出ボタンの高さ */
  --online-lobby-footer-button-height: 42px;
}

.lobby-page :deep(.online-lobby-content .content-grid) {
  height: 100%;
}

.lobby-page :deep(.online-lobby-content) {
  --online-lobby-content-gap: 18px;
  --online-lobby-left-column-width: 780px;
  --online-lobby-column-gap: 56px;
  --online-lobby-stack-gap: 20px;
  --online-lobby-user-area-gap: 16px;
  --online-lobby-user-area-offset: -56px;
  --online-lobby-user-grid-gap: 14px;
  --online-lobby-action-area-min-height: 240px;
  --online-lobby-status-area-min-height: 260px;
  --online-lobby-footer-area-min-height: 190px;
  --online-lobby-user-card-min-height: 96px;
  --online-lobby-user-card-padding-block: 16px;
  --online-lobby-user-card-padding-inline: 18px;
  --online-lobby-user-select-height: 52px;
  --online-lobby-action-control-height: 56px;
  --online-lobby-action-primary-button-height: 60px;
  --online-lobby-room-code-height: 58px;
  --online-lobby-room-code-font-size: 36px;
  --online-lobby-member-row-min-height: 68px;
  --online-lobby-status-badge-width: 118px;
  --online-lobby-state-pill-min-width: 170px;
  --online-lobby-footer-button-height: 52px;
}

.back-link {
  position: absolute;
  right: 16px;
  bottom: 14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #4b3608;
  background: rgba(255, 229, 150, 0.95);
  border: 1px solid rgba(255, 245, 214, 0.76);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.music-button-wrap {
  position: absolute;
  right: 110px;
  bottom: 14px;
  z-index: 3;
}

:deep(.global-music-button) {
  position: absolute;
  right: 0;
  bottom: 0;
}

.lobby-page :deep(.hero-card .eyebrow) {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.28em;
  -webkit-text-stroke: 0.35px rgba(104, 64, 0, 0.42);
  color: #ffe27a;
  text-shadow:
    0 0 1px rgba(104, 64, 0, 0.28),
    0 1px 0 rgba(84, 52, 0, 0.55),
    0 2px 6px rgba(0, 0, 0, 0.28);
}

.lobby-page :deep(.hero-card h1) {
  font-size: 86px;
  font-weight: 900;
  -webkit-text-stroke: 0.9px rgba(116, 72, 0, 0.48);
  color: #fff2a8;
  text-shadow:
    0 0 1px rgba(116, 72, 0, 0.32),
    0 1px 0 rgba(96, 60, 0, 0.58),
    0 2px 0 rgba(96, 60, 0, 0.28),
    0 6px 16px rgba(0, 0, 0, 0.24);
}

.lobby-page :deep(.hero-card .description) {
  max-width: 880px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.8;
  -webkit-text-stroke: 0.2px rgba(90, 52, 0, 0.18);
  color: #fff6c8;
  text-shadow:
    0 0 1px rgba(90, 52, 0, 0.12),
    0 1px 0 rgba(72, 42, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

.lobby-page :deep(.online-lobby-content .user-head h2),
.lobby-page :deep(.online-lobby-content .section-head h2),
.lobby-page :deep(.online-lobby-content .title-wrap h2) {
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  -webkit-text-stroke: 0.55px rgba(106, 64, 0, 0.36);
  color: #ffe79a;
  text-shadow:
    0 0 1px rgba(106, 64, 0, 0.22),
    0 1px 0 rgba(88, 54, 0, 0.52),
    0 2px 0 rgba(88, 54, 0, 0.22),
    0 4px 12px rgba(0, 0, 0, 0.16);
}

.lobby-page :deep(.online-lobby-content .mini-label),
.lobby-page :deep(.online-lobby-content .code-label),
.lobby-page :deep(.online-lobby-content .card-label),
.lobby-page :deep(.online-lobby-content .field-label),
.lobby-page :deep(.online-lobby-content .member-role),
.lobby-page :deep(.online-lobby-content .state-pill span) {
  font-size: 14px;
  font-weight: 900;
  -webkit-text-stroke: 0.3px rgba(106, 64, 0, 0.3);
  color: #ffd96a;
  text-shadow:
    0 0 1px rgba(106, 64, 0, 0.18),
    0 1px 0 rgba(90, 56, 0, 0.48),
    0 2px 6px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .card-value),
.lobby-page :deep(.online-lobby-content .member-name),
.lobby-page :deep(.online-lobby-content .room-code),
.lobby-page :deep(.online-lobby-content .state-pill strong),
.lobby-page :deep(.online-lobby-content .status-badge),
.lobby-page :deep(.online-lobby-content .ready-badge) {
  font-weight: 900;
  -webkit-text-stroke: 0.32px rgba(96, 56, 0, 0.28);
  color: #fff2b8;
  text-shadow:
    0 0 1px rgba(96, 56, 0, 0.16),
    0 1px 0 rgba(90, 56, 0, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

.lobby-page :deep(.online-lobby-content .card-value) {
  min-height: 42px;
  font-size: 24px;
}

.lobby-page :deep(.online-lobby-content .member-name) {
  font-size: 23px;
}

.lobby-page :deep(.online-lobby-content .state-pill strong),
.lobby-page :deep(.online-lobby-content .status-badge),
.lobby-page :deep(.online-lobby-content .ready-badge) {
  font-size: 17px;
}

.lobby-page :deep(.online-lobby-content .member-character),
.lobby-page :deep(.online-lobby-content .subtext),
.lobby-page :deep(.online-lobby-content .switch-hint),
.lobby-page :deep(.online-lobby-content .hint),
.lobby-page :deep(.online-lobby-content .empty-state) {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.75;
  -webkit-text-stroke: 0.18px rgba(82, 48, 0, 0.16);
  color: #ffefbf;
  text-shadow:
    0 0 1px rgba(82, 48, 0, 0.1),
    0 1px 0 rgba(82, 48, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .notice.success) {
  font-weight: 800;
  color: #fff4cf;
  text-shadow:
    0 1px 0 rgba(36, 64, 30, 0.24),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .notice.error) {
  font-weight: 800;
  color: #fff0c9;
  text-shadow:
    0 1px 0 rgba(92, 28, 38, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .user-select),
.lobby-page :deep(.online-lobby-content .room-code-input),
.lobby-page :deep(.online-lobby-content .character-select) {
  font-size: 21px;
  font-weight: 900;
  -webkit-text-stroke: 0.25px rgba(88, 52, 0, 0.18);
  color: #fff1b4;
  text-shadow:
    0 0 1px rgba(88, 52, 0, 0.12),
    0 1px 0 rgba(72, 42, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .user-select option),
.lobby-page :deep(.online-lobby-content .character-select option) {
  color: #3b2a0d;
  background: #fff7e2;
}

.lobby-page :deep(.online-lobby-content .room-code-input::placeholder) {
  color: rgba(255, 232, 166, 0.82);
}

.lobby-page :deep(.online-lobby-content .status-badge.open) {
  color: #fff0a8;
}

.lobby-page :deep(.online-lobby-content .status-badge.matched) {
  color: #fff3bf;
}

.lobby-page :deep(.online-lobby-content .status-badge.playing),
.lobby-page :deep(.online-lobby-content .ready-badge.active) {
  color: #f4ffd6;
}

.lobby-page :deep(.online-lobby-content .status-badge.closed) {
  color: #ffe0c4;
}

.lobby-page :deep(.online-lobby-content .join-button) {
  font-size: 19px;
  font-weight: 900;
  -webkit-text-stroke: 0.25px rgba(61, 45, 15, 0.22);
  color: #3d2d0f;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .create-button) {
  font-size: 20px;
  font-weight: 900;
  -webkit-text-stroke: 0.25px rgba(58, 43, 22, 0.2);
  color: #3a2b16;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .copy-button) {
  min-width: 98px;
  padding: 0 18px;
  font-size: 18px;
  font-weight: 900;
  -webkit-text-stroke: 0.25px rgba(64, 45, 14, 0.2);
  color: #402d0e;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .ready-button) {
  font-size: 18px;
  font-weight: 900;
  -webkit-text-stroke: 0.2px rgba(19, 48, 34, 0.22);
  color: #133022;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .start-button) {
  font-size: 18px;
  font-weight: 900;
  -webkit-text-stroke: 0.2px rgba(58, 41, 8, 0.22);
  color: #3a2908;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .leave-button) {
  font-size: 18px;
  font-weight: 900;
  -webkit-text-stroke: 0.2px rgba(74, 24, 38, 0.2);
  color: #4a1826;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .user-card) {
  border-radius: 22px;
}

.lobby-page :deep(.online-lobby-content .member-row) {
  padding: 14px 16px;
}

.lobby-page :deep(.online-lobby-content .state-pill) {
  padding: 12px 16px;
}

.lobby-page :deep(.online-lobby-content .notice) {
  padding: 14px 16px;
  font-size: 17px;
}

.lobby-page :deep(.online-lobby-content h1),
.lobby-page :deep(.online-lobby-content h2),
.lobby-page :deep(.online-lobby-content h3),
.lobby-page :deep(.online-lobby-content p),
.lobby-page :deep(.online-lobby-content span),
.lobby-page :deep(.online-lobby-content strong),
.lobby-page :deep(.online-lobby-content label),
.lobby-page :deep(.online-lobby-content li),
.lobby-page :deep(.online-lobby-content small),
.lobby-page :deep(.online-lobby-content button),
.lobby-page :deep(.online-lobby-content input),
.lobby-page :deep(.online-lobby-content select) {
  font-synthesis: weight;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
</style>
