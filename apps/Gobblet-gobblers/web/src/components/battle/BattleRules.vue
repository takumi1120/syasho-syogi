<template>
  <div class="rules">
    <p>ルール</p>
    <ul>
      <li>自分の駒を選んで置く</li>
      <li>盤面の一番上に見えている自分の駒は移動できる</li>
      <li>大きい駒は小さい駒にかぶせられる</li>
      <li>見えている駒で縦・横・斜めを3つ揃えたら勝ち</li>
    </ul>
  </div>
</template>

<style scoped>
.rules {
  max-width: 720px;
  width: 100%;
  background:
    linear-gradient(180deg, rgba(36, 22, 11, 0.86), rgba(24, 14, 8, 0.82));
  border: 1px solid rgba(255, 204, 112, 0.34);
  border-radius: 18px;
  padding: var(--battle-rules-padding-y, 16px) var(--battle-rules-padding-x, 20px);
  box-sizing: border-box;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 230, 185, 0.05);
}

.rules p {
  margin: 0 0 clamp(6px, 0.8vh, 10px);
  font-weight: bold;
  font-size: var(--battle-rules-title-size, 18px);
  line-height: 1.2;
}

.rules ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  grid-template-columns: repeat(var(--battle-rules-columns, 1), minmax(0, 1fr));
  gap: 4px var(--battle-rules-column-gap, 16px);
}

.rules li {
  margin-bottom: 0;
  font-size: var(--battle-rules-item-size, 14px);
  line-height: 1.35;
}
</style>
