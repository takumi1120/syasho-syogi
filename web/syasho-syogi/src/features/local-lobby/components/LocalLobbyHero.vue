<template>
  <header class="hero-card">
    <p class="eyebrow">SHACHO SHOGI LOCAL</p>
    <h1>ローカルロビー</h1>
    <p class="description">
      同じ端末で遊ぶ 2 人の対戦準備をします。プレイヤー名とキャラクターを決めてゲームを開始してください。
    </p>
  </header>
</template>

<style scoped>
.hero-card {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 12px;
  padding: 10px 0 0;
}

.eyebrow {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.28em;
  color: #fff0a8;
  text-shadow:
    0 1px 0 rgba(72, 42, 0, 0.45),
    0 0 14px rgba(255, 232, 143, 0.36),
    0 6px 18px rgba(0, 0, 0, 0.34);
}

h1 {
  margin: 0;
  font-size: 76px;
  line-height: 1.02;
  font-weight: 900;
  color: #fff9e2;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.42),
    0 3px 0 rgba(84, 52, 0, 0.22),
    0 8px 24px rgba(0, 0, 0, 0.34),
    0 0 18px rgba(255, 247, 210, 0.16);
}

.description {
  margin: 0;
  max-width: 900px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 18px;
  line-height: 1.8;
  color: #fffdf6;
  background: rgba(24, 38, 74, 0.18);
  border: 1px solid rgba(255, 247, 221, 0.18);
  text-shadow:
    0 1px 0 rgba(0, 0, 0, 0.28),
    0 4px 14px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
}

</style>
