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
      mode選択に戻る
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
    radial-gradient(circle at 18% 18%, rgba(113, 217, 255, 0.16), transparent 28%),
    radial-gradient(circle at 82% 22%, rgba(176, 126, 255, 0.14), transparent 26%),
    radial-gradient(circle at 50% 100%, rgba(103, 198, 255, 0.12), transparent 34%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.18) 0%,
      rgba(6, 12, 24, 0.08) 32%,
      rgba(6, 12, 24, 0.2) 100%
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
  color: #f5fbff;
  background: rgba(12, 20, 38, 0.34);
  border: 1px solid rgba(220, 236, 255, 0.18);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
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