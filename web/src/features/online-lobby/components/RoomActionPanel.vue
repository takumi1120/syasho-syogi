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
  (e: "search"): void;
  (e: "create"): void;
  (e: "join"): void;
}>();

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.toUpperCase();
  emit("update:modelValue", value);
}
</script>

<template>
  <section class="panel control-panel">
    <h2>ルーム操作</h2>

    <label class="field-label" for="room-code">ルームコード</label>

    <div class="room-code-row">
      <input
        id="room-code"
        class="room-code-input"
        :value="props.modelValue"
        type="text"
        maxlength="6"
        placeholder="例: A8KQ2Z"
        @input="onInput"
      />
      <button class="ghost-button" @click="emit('search')" :disabled="loading">
        取得
      </button>
    </div>

    <div class="action-stack">
      <button class="primary-button" @click="emit('create')" :disabled="!canCreateRoom">
        ルーム作成
      </button>

      <button class="secondary-button" @click="emit('join')" :disabled="!canJoinRoom">
        ルーム参加
      </button>
    </div>

    <div class="notice success" v-if="message">
      {{ message }}
    </div>

    <div class="notice error" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <p class="hint">
      ホストが退出すると部屋はクローズ、ゲストが退出すると部屋は募集状態に戻ります。
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

h2 {
  margin: 0;
}

.field-label {
  display: inline-block;
  margin-top: 18px;
  margin-bottom: 10px;
  font-size: 13px;
  color: rgba(234, 243, 255, 0.88);
}

.room-code-row {
  display: flex;
  gap: 10px;
}

.room-code-input {
  flex: 1;
  height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(157, 206, 255, 0.2);
  background: rgba(7, 16, 31, 0.75);
  color: #f2f7ff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  outline: none;
}

.room-code-input::placeholder {
  color: rgba(200, 220, 245, 0.35);
  letter-spacing: 0.04em;
}

.action-stack {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.primary-button,
.secondary-button,
.ghost-button {
  border: none;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease;
  font-weight: 800;
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled,
.ghost-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.primary-button,
.secondary-button {
  min-height: 54px;
  border-radius: 16px;
  font-size: 15px;
}

.primary-button {
  color: #081221;
  background: linear-gradient(180deg, #9ed8ff 0%, #74bfff 100%);
}

.secondary-button,
.ghost-button {
  color: #def0ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(157, 206, 255, 0.16);
}

.ghost-button {
  min-width: 88px;
  padding: 0 16px;
  border-radius: 14px;
}

.notice {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
}

.notice.success {
  background: rgba(76, 193, 137, 0.16);
  border: 1px solid rgba(76, 193, 137, 0.24);
  color: #bff5d8;
}

.notice.error {
  background: rgba(255, 92, 122, 0.14);
  border: 1px solid rgba(255, 92, 122, 0.24);
  color: #ffd4dd;
}

.hint {
  margin: 14px 0 0;
  color: rgba(215, 229, 250, 0.64);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 920px) {
  .room-code-row {
    flex-direction: column;
  }

  .ghost-button {
    width: 100%;
    min-height: 48px;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>