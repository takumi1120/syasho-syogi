<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  loading: boolean;
  canCreateRoom: boolean;
  canJoinRoom: boolean;
  message: string;
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "create"): void;
  (e: "join"): void;
}>();

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.toUpperCase();
  emit("update:modelValue", value);
}
</script>

<template>
  <section class="panel action-area">
    <div class="section-head">
      <p class="mini-label">ROOM ACTION</p>
      <h2>ルーム操作</h2>
    </div>

    <p class="subtext">
      ルームコードがある場合は参加、ない場合はルーム作成を押してください。
    </p>

    <label class="field-label" for="room-code">ルームコード</label>

    <div class="join-row">
      <input
        id="room-code"
        class="room-code-input"
        :value="props.modelValue"
        type="text"
        maxlength="6"
        placeholder="例: A8KQ2Z"
        @input="onInput"
      />
      <button class="join-button" @click="emit('join')" :disabled="!canJoinRoom">
        参加
      </button>
    </div>

    <button class="create-button" @click="emit('create')" :disabled="!canCreateRoom">
      ルーム作成
    </button>

    <div class="notice success" v-if="message">
      {{ message }}
    </div>

    <div class="notice error" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </section>
</template>

<style scoped>
.panel {
  min-width: 0;
}

.action-area {
  display: grid;
  gap: 8px;
  padding: 8px 0;
}

.section-head {
  display: grid;
  gap: 2px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 10px;
  color: #7fe7ff;
  text-shadow: 0 0 10px rgba(127, 231, 255, 0.24);
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #ffffff;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
}

.subtext {
  margin: 0;
  color: rgba(230, 239, 255, 0.82);
  font-size: 12px;
  line-height: 1.6;
}

.field-label {
  display: inline-block;
  margin-top: 2px;
  font-size: 12px;
  color: rgba(234, 243, 255, 0.9);
}

.join-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(84px, 24%, 108px);
  gap: 8px;
  align-items: stretch;
  min-width: 0;
}

.room-code-input {
  min-width: 0;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(193, 230, 255, 0.20);
  background: rgba(12, 21, 39, 0.34);
  color: #f7fbff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  outline: none;
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.room-code-input::placeholder {
  color: rgba(200, 220, 245, 0.35);
  letter-spacing: 0.04em;
}

.join-button,
.create-button {
  border: none;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  font-weight: 800;
  box-sizing: border-box;
}

.join-button:hover,
.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}

.join-button:disabled,
.create-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.join-button {
  min-width: 0;
  width: 100%;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 14px;
  white-space: nowrap;
  color: #eef7ff;
  background:
    linear-gradient(180deg, rgba(120, 214, 255, 0.30) 0%, rgba(165, 123, 255, 0.24) 100%);
  border: 1px solid rgba(228, 238, 255, 0.18);
  backdrop-filter: blur(8px);
}

.create-button {
  width: 100%;
  min-height: 46px;
  margin-top: 2px;
  border-radius: 14px;
  color: #ffffff;
  background:
    linear-gradient(90deg, rgba(75, 225, 255, 0.34) 0%, rgba(126, 160, 255, 0.30) 52%, rgba(194, 118, 255, 0.32) 100%);
  border: 1px solid rgba(232, 241, 255, 0.20);
  backdrop-filter: blur(8px);
}

.notice {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.55;
  backdrop-filter: blur(8px);
}

.notice.success {
  background: rgba(76, 193, 137, 0.12);
  border: 1px solid rgba(76, 193, 137, 0.18);
  color: #c6f5da;
}

.notice.error {
  background: rgba(255, 92, 122, 0.12);
  border: 1px solid rgba(255, 92, 122, 0.18);
  color: #ffd4dd;
}

@media (max-width: 640px) {
  .join-row {
    grid-template-columns: 1fr;
  }
}
</style>