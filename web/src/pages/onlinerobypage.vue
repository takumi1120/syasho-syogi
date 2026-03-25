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
  color: #fff8ea;
  overflow: hidden;
}

.page-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 14%, rgba(255, 242, 180, 0.16), transparent 24%),
    radial-gradient(circle at 18% 22%, rgba(112, 220, 255, 0.18), transparent 26%),
    radial-gradient(circle at 82% 18%, rgba(200, 146, 255, 0.16), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.10), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(110, 205, 255, 0.10), transparent 32%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.02) 0%,
      rgba(6, 12, 24, 0.01) 30%,
      rgba(6, 12, 24, 0.05) 100%
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
  color: #4b3608;
  background: rgba(255, 229, 150, 0.95);
  border: 1px solid rgba(255, 245, 214, 0.76);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
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