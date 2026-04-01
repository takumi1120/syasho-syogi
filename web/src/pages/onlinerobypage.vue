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

.lobby-page :deep(.online-lobby-content) {
  height: 100%;
}

.lobby-page :deep(.online-lobby-content .content-grid) {
  grid-template-columns: 570px minmax(0, 1fr);
  gap: 44px;
  height: 100%;
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
  color: #ffe27a;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.55),
    0 2px 6px rgba(0, 0, 0, 0.28);
}

.lobby-page :deep(.hero-card h1) {
  color: #fff2a8;
  text-shadow:
    0 1px 0 rgba(96, 60, 0, 0.58),
    0 2px 0 rgba(96, 60, 0, 0.28),
    0 6px 16px rgba(0, 0, 0, 0.24);
}

.lobby-page :deep(.hero-card .description) {
  color: #fff6c8;
  text-shadow:
    0 1px 0 rgba(72, 42, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

.lobby-page :deep(.online-lobby-content .user-head h2),
.lobby-page :deep(.online-lobby-content .section-head h2),
.lobby-page :deep(.online-lobby-content .title-wrap h2) {
  color: #ffe79a;
  text-shadow:
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
  color: #ffd96a;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.48),
    0 2px 6px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .card-value),
.lobby-page :deep(.online-lobby-content .member-name),
.lobby-page :deep(.online-lobby-content .room-code),
.lobby-page :deep(.online-lobby-content .state-pill strong),
.lobby-page :deep(.online-lobby-content .status-badge),
.lobby-page :deep(.online-lobby-content .ready-badge) {
  color: #fff2b8;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

.lobby-page :deep(.online-lobby-content .member-character),
.lobby-page :deep(.online-lobby-content .subtext),
.lobby-page :deep(.online-lobby-content .switch-hint),
.lobby-page :deep(.online-lobby-content .hint),
.lobby-page :deep(.online-lobby-content .empty-state) {
  color: #ffefbf;
  text-shadow:
    0 1px 0 rgba(82, 48, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .notice.success) {
  color: #fff4cf;
  text-shadow:
    0 1px 0 rgba(36, 64, 30, 0.24),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .notice.error) {
  color: #fff0c9;
  text-shadow:
    0 1px 0 rgba(92, 28, 38, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .user-select),
.lobby-page :deep(.online-lobby-content .room-code-input),
.lobby-page :deep(.online-lobby-content .character-select) {
  color: #fff1b4;
  text-shadow:
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
  color: #3d2d0f;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .create-button) {
  color: #3a2b16;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .copy-button) {
  color: #402d0e;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .ready-button) {
  color: #133022;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .start-button) {
  color: #3a2908;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .leave-button) {
  color: #4a1826;
  text-shadow: none;
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
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
</style>
