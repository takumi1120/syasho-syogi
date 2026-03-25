<template>
  <header class="hero-card">
    <p class="eyebrow">SHACHO SHOGI ONLINE</p>
    <h1>オンラインロビー</h1>
    <p class="description">
      ルームを作成して待機、またはルームコードを入力して参加できます。
    </p>
  </header>
</template>

<style scoped>
.hero-card {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 8px;
  padding: 6px 0 0;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.24em;
  color: #ffe88f;
  text-shadow:
    0 0 14px rgba(255, 232, 143, 0.34),
    0 4px 14px rgba(0, 0, 0, 0.14);
}

h1 {
  margin: 0;
  font-size: clamp(34px, 4.2vw, 56px);
  line-height: 1.02;
  font-weight: 900;
  color: #fff7d2;
  text-shadow:
    0 0 18px rgba(255, 247, 210, 0.16),
    0 6px 18px rgba(0, 0, 0, 0.18);
}

.description {
  margin: 0;
  max-width: 720px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 248, 226, 0.98);
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
}

@media (max-width: 640px) {
  .hero-card {
    gap: 6px;
    padding-top: 2px;
  }

  h1 {
    font-size: 34px;
  }

  .description {
    font-size: 13px;
  }
}
</style>