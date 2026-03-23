<script setup lang="ts">
defineProps<{
  player1Name: string;
  player2Name: string;
  player1Character: string;
  player2Character: string;
}>();
</script>

<template>
  <header class="hero-card">
    <p class="eyebrow">LOCAL MATCH</p>
    <h1>ローカルロビー</h1>
    <p class="description">
      同じ端末で遊ぶ 2 人の対戦準備をします。プレイヤー名を決めて、対局を開始してください。
    </p>

    <div class="summary-row">
      <div class="summary-chip">
        <span class="chip-label">対戦形式</span>
        <strong>1台でローカル対戦</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">プレイ人数</span>
        <strong>2人</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">対戦カード</span>
        <strong>{{ player1Name || "Player 1" }} VS {{ player2Name || "Player 2" }}</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">キャラクター</span>
        <strong>{{ player1Character || "未設定" }} / {{ player2Character || "未設定" }}</strong>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero-card {
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(255, 221, 166, 0.16);
  background: rgba(56, 34, 22, 0.72);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #f2cb86;
}

h1 {
  margin: 10px 0 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.05;
  color: #fff8ee;
}

.description {
  margin: 14px 0 0;
  color: rgba(255, 245, 230, 0.84);
  font-size: 15px;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.summary-chip {
  min-width: 150px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 221, 166, 0.12);
}

.chip-label {
  display: block;
  font-size: 11px;
  color: rgba(255, 232, 201, 0.68);
  margin-bottom: 4px;
}

@media (max-width: 640px) {
  .hero-card {
    padding: 18px;
    border-radius: 20px;
  }

  h1 {
    font-size: 28px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: 1fr;
  }

  .summary-chip {
    width: 100%;
  }
}
</style>