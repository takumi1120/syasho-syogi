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
  <section class="guide-panel">
    <div class="section-head">
      <p class="mini-label">MATCH START</p>
      <h2>対戦プレビュー</h2>
    </div>

    <div class="preview-box">
      <p class="preview-title">LOCAL MATCH</p>

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

    <p class="hint">2人分の名前とキャラクターを選択すると開始できます。</p>
  </section>
</template>

<style scoped>
.guide-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 100%;
  padding: 22px 24px 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(132, 205, 255, 0.24), rgba(60, 110, 205, 0.2));
  border: 1px solid rgba(255, 247, 221, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 14px 28px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.section-head {
  display: grid;
  gap: 2px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 10px;
  font-weight: 900;
  color: #ffe27a;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.48),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

h2 {
  margin: 2px 0 0;
  font-size: 28px;
  color: #fff2a8;
  text-shadow:
    0 1px 0 rgba(96, 60, 0, 0.52),
    0 4px 14px rgba(0, 0, 0, 0.22);
}

.preview-box {
  padding: 18px 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 247, 221, 0.18);
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 20px rgba(0, 0, 0, 0.08);
}

.preview-title {
  margin: 0;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 900;
  color: #ffd96a;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.preview-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 14px 0 0;
  color: #fff7d6;
}

.preview-line strong {
  font-size: 22px;
  font-weight: 900;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.38),
    0 3px 10px rgba(0, 0, 0, 0.16);
}

.preview-line span {
  font-size: 12px;
  color: #ffe49a;
}

.preview-sub {
  margin: 12px 0 0;
  font-size: 13px;
  color: #ffefbf;
  text-shadow:
    0 1px 0 rgba(82, 48, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.divider {
  margin: 0 8px;
  opacity: 0.65;
}

.action-stack {
  display: grid;
  gap: 12px;
}

.start-button,
.ghost-button {
  min-height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  backdrop-filter: blur(8px);
}

.start-button:hover,
.ghost-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.start-button:disabled,
.ghost-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.start-button {
  color: #3a2908;
  background: linear-gradient(180deg, rgba(255, 225, 145, 0.96) 0%, rgba(255, 198, 96, 0.88) 100%);
  border: 1px solid rgba(255, 245, 214, 0.56);
}

.ghost-button {
  color: #3f2b0d;
  background: linear-gradient(180deg, rgba(145, 227, 255, 0.88) 0%, rgba(196, 161, 255, 0.78) 100%);
  border: 1px solid rgba(255, 247, 221, 0.46);
}

.hint {
  margin: auto 0 0;
  color: #ffefbf;
  font-size: 12px;
  line-height: 1.6;
  text-shadow:
    0 1px 0 rgba(82, 48, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

</style>
