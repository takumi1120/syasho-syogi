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
  min-height: var(--online-lobby-action-area-min-height, 0px);
}

.section-head {
  display: grid;
  gap: 2px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 10px;
  font-weight: 800;
  color: #ffe892;
  text-shadow:
    0 0 12px rgba(255, 232, 146, 0.28),
    0 2px 10px rgba(0, 0, 0, 0.08);
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #fff7d2;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.subtext {
  margin: 0;
  color: rgba(255, 247, 225, 0.94);
  font-size: 12px;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.field-label {
  display: inline-block;
  margin-top: 2px;
  font-size: 12px;
  color: rgba(255, 244, 214, 0.96);
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
  height: var(--online-lobby-action-control-height, 44px);
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 244, 214, 0.28);
  background: rgba(16, 22, 40, 0.38);
  color: #fffaf0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  outline: none;
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.room-code-input::placeholder {
  color: rgba(255, 231, 173, 0.42);
  letter-spacing: 0.04em;
}

.join-button,
.create-button {
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  font-weight: 800;
  box-sizing: border-box;
}

.join-button:hover,
.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
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
  min-height: var(--online-lobby-action-control-height, 44px);
  padding: 0 10px;
  border-radius: 14px;
  white-space: nowrap;
  color: #3d2d0f;
  background: linear-gradient(180deg, rgba(145, 227, 255, 0.92) 0%, rgba(196, 161, 255, 0.86) 100%);
  border: 1px solid rgba(255, 247, 221, 0.56);
  backdrop-filter: blur(8px);
}

.create-button {
  width: 100%;
  min-height: var(--online-lobby-action-primary-button-height, 46px);
  margin-top: 2px;
  border-radius: 14px;
  color: #2d2238;
  background: linear-gradient(
    90deg,
    rgba(120, 236, 255, 0.94) 0%,
    rgba(173, 190, 255, 0.90) 52%,
    rgba(238, 181, 255, 0.90) 100%
  );
  border: 1px solid rgba(255, 247, 221, 0.58);
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
  background: rgba(110, 223, 166, 0.18);
  border: 1px solid rgba(110, 223, 166, 0.24);
  color: #f5fff9;
}

.notice.error {
  background: rgba(255, 124, 154, 0.18);
  border: 1px solid rgba(255, 124, 154, 0.24);
  color: #fff4f7;
}

</style>
