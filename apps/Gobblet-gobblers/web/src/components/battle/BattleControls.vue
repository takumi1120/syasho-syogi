<script setup lang="ts">
defineProps<{
  playing: boolean;
}>();

const emit = defineEmits<{
  startBgm: [];
  stopBgm: [];
  reset: [];
  goHome: [];
}>();
</script>

<template>
  <div class="buttons">
    <button v-if="!playing" @click="emit('startBgm')">BGM再生</button>
    <button v-else @click="emit('stopBgm')">BGM停止</button>
    <button @click="emit('reset')">リセット</button>
    <button @click="emit('goHome')">タイトルへ戻る</button>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  gap: var(--battle-button-gap, 12px);
  flex-wrap: wrap;
  justify-content: center;
}

.buttons button {
  min-width: var(--battle-button-min-width, 132px);
  padding: var(--battle-button-padding-y, 12px) var(--battle-button-padding-x, 20px);
  border: 1px solid rgba(255, 204, 112, 0.5);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(58, 34, 14, 0.88), rgba(34, 20, 9, 0.82));
  color: #ffdc9a;
  font-size: var(--battle-button-font-size, 16px);
  line-height: 1.2;
  font-weight: bold;
  white-space: nowrap;
  cursor: pointer;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 232, 188, 0.08);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.buttons button:hover {
  background:
    linear-gradient(180deg, rgba(76, 44, 18, 0.92), rgba(45, 25, 10, 0.88));
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.4),
    0 0 16px rgba(255, 190, 90, 0.18);
  transform: translateY(-2px);
}
</style>
