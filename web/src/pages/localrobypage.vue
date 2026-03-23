<script setup lang="ts">
import { RouterLink } from "vue-router";
import LobbyShell from "../components/lobby/LobbyShell.vue";
import LocalLobbyContent from "../features/local-lobby/components/LocalLobbyContent.vue";
</script>

<template>
  <section class="lobby-page">
    <LobbyShell>
      <LocalLobbyContent />

      <template #footer>
        <RouterLink class="back-link" to="/">
          モード選択に戻る
        </RouterLink>
      </template>
    </LobbyShell>
  </section>
</template>

<style scoped>
.lobby-page {
  min-height: 100vh;
  padding: 32px 20px 40px;
  background:
    radial-gradient(circle at top, rgba(255, 198, 117, 0.14), transparent 34%),
    linear-gradient(180deg, #2a1d18 0%, #18110f 56%, #100b0a 100%);
  color: #fff5e8;
}

.back-link {
  display: inline-flex;
  margin-top: 18px;
  padding: 12px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  color: #21151d;
  background: #f0cf8f;
}

@media (max-width: 640px) {
  .lobby-page {
    padding: 18px 12px 28px;
  }
}
</style>