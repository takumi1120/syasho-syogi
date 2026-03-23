<script setup lang="ts">
defineProps<{
  userName: string;
  userId: number | null;
  selectedCharacter: string;
}>();
</script>

<template>
  <header class="hero-card">
    <p class="eyebrow">SHACHO SHOGI ONLINE</p>
    <h1>オンラインロビー</h1>
    <p class="description">
      ルームを作成して待機、またはルームコードを入力して参加できます。
    </p>

    <div class="player-summary">
      <div class="summary-chip">
        <span class="chip-label">ユーザー</span>
        <strong>{{ userName }}</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">ユーザーID</span>
        <strong>{{ userId ?? "未設定" }}</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">キャラクター</span>
        <strong>{{ selectedCharacter || "未選択" }}</strong>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero-card {
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(157, 206, 255, 0.18);
  background: rgba(18, 29, 52, 0.74);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #8ec5ff;
}

h1 {
  margin: 10px 0 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.05;
  color: #f4f8ff;
}

.description {
  margin: 14px 0 0;
  color: rgba(238, 245, 255, 0.82);
  font-size: 15px;
}

.player-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.summary-chip {
  min-width: 150px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(157, 206, 255, 0.14);
}

.chip-label {
  display: block;
  font-size: 11px;
  color: rgba(210, 228, 255, 0.7);
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

  .player-summary {
    display: grid;
    grid-template-columns: 1fr;
  }

  .summary-chip {
    width: 100%;
  }
}
</style>