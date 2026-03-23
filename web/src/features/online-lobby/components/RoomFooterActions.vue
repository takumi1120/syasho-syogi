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
  <section v-if="isMember" class="panel">
    <div class="my-state">
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

    <div class="bottom-actions">
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
      ホストのみゲーム開始できます。両者が READY になると開始可能です。
    </p>
  </section>
</template>

<style scoped>
.panel {
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(157, 206, 255, 0.18);
  background: rgba(18, 29, 52, 0.74);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #eef5ff;
}

.my-state {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.state-pill {
  min-width: 150px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(157, 206, 255, 0.14);
}

.state-pill span {
  display: block;
  font-size: 11px;
  color: rgba(210, 228, 255, 0.7);
  margin-bottom: 4px;
}

.bottom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.ready-button,
.start-button,
.leave-button {
  min-height: 54px;
  padding: 0 20px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.ready-button:hover,
.start-button:hover,
.leave-button:hover {
  transform: translateY(-1px);
}

.ready-button:disabled,
.start-button:disabled,
.leave-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.ready-button {
  color: #082217;
  background: linear-gradient(180deg, #8bf2be 0%, #56db9e 100%);
}

.start-button {
  color: #201105;
  background: linear-gradient(180deg, #ffd786 0%, #f0b84f 100%);
}

.leave-button {
  color: #ffe3ea;
  background: rgba(255, 94, 126, 0.14);
  border: 1px solid rgba(255, 94, 126, 0.24);
}

.hint {
  margin: 14px 0 0;
  color: rgba(215, 229, 250, 0.64);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .panel {
    padding: 18px;
    border-radius: 20px;
  }

  .my-state,
  .bottom-actions {
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