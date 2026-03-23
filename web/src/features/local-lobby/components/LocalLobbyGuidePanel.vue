<script setup lang="ts">
defineProps<{
  player1Name: string;
  player2Name: string;
  player1Character: string;
  player2Character: string;
  canStart: boolean;
}>();

defineEmits<{
  (e: "start"): void;
  (e: "reset"): void;
}>();
</script>

<template>
  <section class="panel guide-panel">
    <p class="mini-label">MATCH GUIDE</p>
    <h2>開始前チェック</h2>

    <div class="check-list">
      <div class="check-item" :class="{ active: player1Name.length > 0 }">
        <span class="check-dot"></span>
        <span>プレイヤー1の名前入力</span>
      </div>
      <div class="check-item" :class="{ active: player2Name.length > 0 }">
        <span class="check-dot"></span>
        <span>プレイヤー2の名前入力</span>
      </div>
      <div class="check-item active">
        <span class="check-dot"></span>
        <span>キャラクター名は任意</span>
      </div>
      <div class="check-item active">
        <span class="check-dot"></span>
        <span>この画面では API 通信なし</span>
      </div>
    </div>

    <div class="preview-box">
      <p class="preview-title">対戦プレビュー</p>
      <p class="preview-line">
        <strong>{{ player1Name || "Player 1" }}</strong>
        <span>VS</span>
        <strong>{{ player2Name || "Player 2" }}</strong>
      </p>
      <p class="preview-sub">
        {{ player1Character || "キャラ未設定" }}
        <span class="divider">/</span>
        {{ player2Character || "キャラ未設定" }}
      </p>
    </div>

    <div class="action-stack">
      <button class="start-button" type="button" :disabled="!canStart" @click="$emit('start')">
        ローカル対戦を開始
      </button>

      <button class="ghost-button" type="button" @click="$emit('reset')">
        入力をリセット
      </button>
    </div>

    <p class="hint">
      対局画面のルートが <code>/battle</code> でない場合は、`useLocalLobby.ts` の
      `router.push` だけ今のルーターに合わせて変えてください。
    </p>
  </section>
</template>

<style scoped>
.panel {
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 221, 166, 0.16);
  background: rgba(56, 34, 22, 0.72);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  color: #fff5e8;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #f2cb86;
}

h2 {
  margin: 10px 0 0;
}

.check-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 236, 208, 0.68);
}

.check-item.active {
  color: #fff5e8;
}

.check-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 226, 171, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255, 226, 171, 0.18);
}

.check-item.active .check-dot {
  background: linear-gradient(180deg, #ffd98f 0%, #f0b85a 100%);
}

.preview-box {
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 221, 166, 0.12);
}

.preview-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.22em;
  color: #f2cb86;
}

.preview-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0 0;
  font-size: 22px;
}

.preview-line span {
  font-size: 14px;
  opacity: 0.8;
}

.preview-sub {
  margin: 10px 0 0;
  color: rgba(255, 237, 210, 0.76);
}

.divider {
  margin: 0 8px;
  opacity: 0.6;
}

.action-stack {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.start-button,
.ghost-button {
  min-height: 54px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
}

.start-button {
  color: #2b1607;
  background: linear-gradient(180deg, #ffd78d 0%, #efb557 100%);
}

.start-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ghost-button {
  color: #fff2dc;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 221, 166, 0.16);
}

.hint {
  margin: 14px 0 0;
  color: rgba(255, 231, 196, 0.64);
  font-size: 13px;
  line-height: 1.7;
}

code {
  color: #ffe3a7;
}

@media (max-width: 640px) {
  .panel {
    padding: 18px;
    border-radius: 20px;
  }

  .preview-line {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>