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
import LocalLobbyContent from "../features/local-lobby/components/LocalLobbyContent.vue";

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
            <LocalLobbyContent />
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
      rgba(6, 12, 24, 0.2) 0%,
      rgba(6, 12, 24, 0.2) 30%,
      rgba(6, 12, 24, 0.2) 100%
    );
  pointer-events: none;
}

:deep(.lobby-shell) {
  position: relative;
  z-index: 1;
  height: 100%;
  width: min(100%, 1680px);
}

.lobby-page :deep(.shell-body) {
  margin-top: 0;
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
</style>
