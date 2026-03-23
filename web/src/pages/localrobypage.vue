<template>
  <section class="lobby-page">
    <div class="panel">
      <p class="eyebrow">LOCAL MATCH</p>
      <h1>ローカル対戦</h1>
      <p class="description">
        このページはローカル対戦の準備画面です。機能を追加するまでは、ここを遷移先として使えます。
      </p>
      <RouterLink class="back-link" to="/">モード選択に戻る</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.lobby-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #21151d 0%, #120d13 100%);
}

.panel {
  width: min(100%, 720px);
  padding: 40px 32px;
  border-radius: 24px;
  border: 1px solid rgba(255, 232, 187, 0.22);
  background: rgba(64, 36, 22, 0.55);
  color: #fff7e8;
  text-align: center;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 14px;
  letter-spacing: 0.3em;
  color: #f0cf8f;
}

h1 {
  margin: 0;
  color: #fff3da;
}

.description {
  margin: 16px 0 0;
  color: rgba(255, 244, 222, 0.8);
}

.back-link {
  display: inline-flex;
  margin-top: 28px;
  padding: 12px 18px;
  border-radius: 999px;
  color: #21151d;
  background: #f0cf8f;
  text-decoration: none;
  font-weight: 700;
}
</style>
