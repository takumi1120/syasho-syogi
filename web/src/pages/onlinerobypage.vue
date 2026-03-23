<template>
  <section class="lobby-page">
    <div class="panel">
      <p class="eyebrow">ONLINE MATCH</p>
      <h1>オンライン対戦</h1>
      <p class="description">
        このページはオンライン対戦のロビーです。ルーム作成や参加機能はここに追加していけます。
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
  background: linear-gradient(180deg, #1c2338 0%, #0d111c 100%);
}

.panel {
  width: min(100%, 720px);
  padding: 40px 32px;
  border-radius: 24px;
  border: 1px solid rgba(173, 212, 255, 0.2);
  background: rgba(18, 29, 52, 0.72);
  color: #eef5ff;
  text-align: center;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 14px;
  letter-spacing: 0.3em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  color: #f3f8ff;
}

.description {
  margin: 16px 0 0;
  color: rgba(238, 245, 255, 0.8);
}

.back-link {
  display: inline-flex;
  margin-top: 28px;
  padding: 12px 18px;
  border-radius: 999px;
  color: #0d111c;
  background: #8ec5ff;
  text-decoration: none;
  font-weight: 700;
}
</style>
