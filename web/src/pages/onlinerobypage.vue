<script setup lang="ts">
import { RouterLink } from "vue-router";
import LobbyShell from "../components/lobby/LobbyShell.vue";
import OnlineLobbyContent from "../features/online-lobby/components/OnlineLobbyContent.vue";
</script>

<template>
  <section class="lobby-page">
    <LobbyShell>
      <OnlineLobbyContent />

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
 background: url("../assets/background/loby.png") center / cover no-repeat;
  color: #eef5ff;
}

.back-link {
  display: inline-flex;
  margin-top: 18px;
  padding: 12px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  color: #0b1221;
  background: #8ec5ff;
}

@media (max-width: 640px) {
  .lobby-page {
    padding: 18px 12px 28px;
  }
}
</style>