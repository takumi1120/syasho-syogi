<script setup lang="ts">
defineProps<{
  isMember: boolean;
  isHost: boolean;
  myReady: boolean;
  opponentReady: boolean;
  canToggleReady: boolean;
  canStartGame: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-ready"): void;
  (e: "start"): void;
  (e: "leave"): void;
}>();
</script>

<template>
  <section v-if="isMember" class="panel footer-area">
    <div class="state-row">
      <div class="state-pill">
        <span>あなた</span>
        <strong>{{ isHost ? "ホスト" : "ゲスト" }}</strong>
      </div>

      <div class="state-pill">
        <span>あなたの準備</span>
        <strong>{{ myReady ? "READY" : "WAITING" }}</strong>
      </div>

      <div class="state-pill">
        <span>相手の準備</span>
        <strong>{{ opponentReady ? "READY" : "WAITING" }}</strong>
      </div>
    </div>

    <div class="action-row">
      <button class="ready-button" @click="emit('toggle-ready')" :disabled="!canToggleReady">
        {{ myReady ? "準備解除" : "準備OK" }}
      </button>

      <button class="start-button" @click="emit('start')" :disabled="!canStartGame">
        ゲーム開始
      </button>

      <button class="leave-button" @click="emit('leave')" :disabled="loading">
        退出
      </button>
    </div>

    <p class="hint" v-if="isHost">
      ホストのみゲーム開始できます。両者が READY で開始可能です。
    </p>
  </section>
</template>

<style scoped>
.panel {
  min-width: 0;
}

.footer-area {
  display: grid;
  gap: 10px;
  padding: 4px 0 0;
}

.state-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.state-pill {
  min-width: 132px;
  padding: 9px 12px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(232, 241, 255, 0.14);
  color: #eef5ff;
  backdrop-filter: blur(8px);
}

.state-pill span {
  display: block;
  margin-bottom: 3px;
  font-size: 10px;
  color: rgba(214, 232, 255, 0.78);
}

.state-pill strong {
  font-size: 13px;
}

.ready-button,
.start-button,
.leave-button {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  backdrop-filter: blur(8px);
}

.ready-button:hover,
.start-button:hover,
.leave-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}

.ready-button:disabled,
.start-button:disabled,
.leave-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.ready-button {
  color: #f0fff7;
  background: linear-gradient(180deg, rgba(95, 236, 180, 0.24) 0%, rgba(95, 236, 180, 0.16) 100%);
  border: 1px solid rgba(160, 248, 212, 0.18);
}

.start-button {
  color: #fffaf0;
  background: linear-gradient(180deg, rgba(255, 206, 113, 0.24) 0%, rgba(255, 206, 113, 0.16) 100%);
  border: 1px solid rgba(255, 224, 156, 0.18);
}

.leave-button {
  color: #ffeef3;
  background: linear-gradient(180deg, rgba(255, 118, 146, 0.18) 0%, rgba(255, 118, 146, 0.10) 100%);
  border: 1px solid rgba(255, 168, 186, 0.16);
}

.state-pill {
  background: rgba(10, 18, 33, 0.54);
  border: 1px solid rgba(255, 223, 156, 0.16);
  color: #fff6d9;
}

.state-pill span {
  color: rgba(255, 229, 171, 0.82);
}

.ready-button {
  color: #133022;
  background: linear-gradient(180deg, rgba(143, 244, 198, 0.96) 0%, rgba(97, 226, 165, 0.88) 100%);
  border: 1px solid rgba(226, 255, 241, 0.58);
}

.start-button {
  color: #3a2908;
  background: linear-gradient(180deg, rgba(255, 225, 145, 0.96) 0%, rgba(255, 198, 96, 0.88) 100%);
  border: 1px solid rgba(255, 245, 214, 0.56);
}

.leave-button {
  color: #4a1826;
  background: linear-gradient(180deg, rgba(255, 188, 205, 0.94) 0%, rgba(255, 149, 177, 0.84) 100%);
  border: 1px solid rgba(255, 241, 246, 0.56);
}

.hint {
  color: rgba(255, 242, 210, 0.86);
}
.hint {
  margin: 0;
  color: rgba(230, 239, 255, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .state-row,
  .action-row {
    display: grid;
    grid-template-columns: 1fr;
  }

  .state-pill,
  .ready-button,
  .start-button,
  .leave-button {
    width: 100%;
  }
}
</style>