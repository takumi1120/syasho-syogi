<script setup lang="ts">
import { ref } from "vue";
import {
  playModeSelectBgm,
  stopModeSelectBgm,
} from "../../audio/modeSelectBgm";

const isMusicPlaying = ref(true);

async function handleToggleMusic() {
  if (isMusicPlaying.value) {
    stopModeSelectBgm(false);
    isMusicPlaying.value = false;
    return;
  }

  await playModeSelectBgm();
  isMusicPlaying.value = true;
}
</script>

<template>
  <section class="battle-layout">
    <button class="music-toggle-button" @click="handleToggleMusic">
      {{ isMusicPlaying ? "音楽停止" : "音楽再生" }}
    </button>

    <header v-if="$slots.header" class="battle-header">
      <slot name="header" />
    </header>

    <div class="battle-content">
      <main class="battle-main">
        <slot />
      </main>

      <aside v-if="$slots.sidebar" class="battle-sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.battle-layout {
  width: min(100%, 1160px);
  height: 100dvh;
  margin: 0 auto;
  padding: 8px 12px 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
}

.music-toggle-button {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 99999;
  min-width: 108px;
  height: 44px;
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

.battle-content {
  min-height: 0;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
}

.battle-header,
.battle-main,
.battle-sidebar {
  min-height: 0;
}

.battle-main {
  display: grid;
}

.battle-sidebar {
  display: grid;
  gap: 8px;
  align-content: start;
  grid-auto-rows: max-content;
}

@media (min-width: 980px) {
  .battle-content {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

@media (max-width: 980px) {
  .battle-layout {
    height: auto;
    min-height: 100dvh;
  }
}

@media (max-width: 640px) {
  .battle-layout {
    padding: 10px;
  }

  .music-toggle-button {
    right: 12px;
    bottom: 12px;
    min-width: 96px;
    height: 40px;
    padding: 0 14px;
    font-size: 12px;
  }
}
</style>