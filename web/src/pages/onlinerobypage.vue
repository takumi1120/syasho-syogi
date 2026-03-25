<script setup lang="ts">
import { RouterLink } from "vue-router";
import LobbyShell from "../components/lobby/LobbyShell.vue";
import OnlineLobbyContent from "../features/online-lobby/components/OnlineLobbyContent.vue";
</script>

<template>
  <section class="lobby-page">
    <div class="page-overlay"></div>

    <LobbyShell>
      <OnlineLobbyContent />
    </LobbyShell>

    <RouterLink class="back-link" to="/">
      mode選択へ
    </RouterLink>
  </section>
</template>

<style scoped>
.lobby-page {
  position: relative;
  min-height: 100dvh;
  padding: 14px 16px 18px;
  background: url("../assets/background/loby.png") center / cover no-repeat;
  color: #eef5ff;
  overflow: hidden;
}

.page-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 16%, rgba(104, 226, 255, 0.16), transparent 26%),
    radial-gradient(circle at 86% 20%, rgba(192, 124, 255, 0.14), transparent 24%),
    radial-gradient(circle at 50% 100%, rgba(97, 199, 255, 0.10), transparent 32%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.10) 0%,
      rgba(6, 12, 24, 0.03) 28%,
      rgba(6, 12, 24, 0.14) 100%
    );
  pointer-events: none;
}

:deep(.lobby-shell) {
  position: relative;
  z-index: 1;
  height: calc(100dvh - 32px);
}

.back-link {
  position: fixed;
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
  color: #ffffff;
  background: rgba(14, 24, 45, 0.34);
  border: 1px solid rgba(232, 241, 255, 0.18);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}
.lobby-page {
  display: grid;
  place-items: start center;
  color: #fff4cf;
}

.page-overlay {
  background:
    radial-gradient(circle at 14% 16%, rgba(110, 210, 255, 0.10), transparent 24%),
    radial-gradient(circle at 86% 20%, rgba(176, 128, 255, 0.10), transparent 22%),
    radial-gradient(circle at 50% 100%, rgba(97, 199, 255, 0.08), transparent 28%),
    linear-gradient(
      180deg,
      rgba(5, 10, 20, 0.40) 0%,
      rgba(5, 10, 20, 0.26) 28%,
      rgba(5, 10, 20, 0.48) 100%
    );
}

.back-link {
  color: #2a1a05;
  background: rgba(255, 229, 153, 0.96);
  border: 1px solid rgba(255, 245, 210, 0.72);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
}

@media (max-width: 980px) {
  .lobby-page {
    overflow: auto;
    padding-bottom: 72px;
  }

  :deep(.lobby-shell) {
    height: auto;
  }
}

@media (max-width: 640px) {
  .lobby-page {
    padding: 12px 10px 72px;
  }

  .back-link {
    right: 10px;
    bottom: 10px;
    min-height: 32px;
    font-size: 11px;
    padding: 0 10px;
  }
}
</style>