<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api";

const router = useRouter();

type ResultItem = {
  id: number;
  name: string;
  win_count: number;
  lose_count: number;
};

const items = ref<ResultItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchResults() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("results/stats");
    items.value = res.data.items ?? [];
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ??
      e?.message ??
      "戦績取得に失敗しました";
  } finally {
    loading.value = false;
  }
}

function goHome() {
  router.push("/start");
}

onMounted(() => {
  fetchResults();
});
</script>

<template>
  <div class="result-page">
    <h1>戦績一覧</h1>

    <p v-if="loading">読み込み中...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="!loading && !error" class="result-table">
      <thead>
        <tr>
          <th>順位</th>
          <th>名前</th>
          <th>勝利数</th>
          <th>敗北数</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.win_count }}</td>
          <td>{{ item.lose_count }}</td>
        </tr>
      </tbody>
    </table>

    <div class="buttons">
      <button @click="goHome">ユーザー選択画面へ戻る</button>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  background:
    radial-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.58)),
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffdc9a;
  font-family: system-ui;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  text-shadow:
    0 0 4px #fff2b3,
    0 0 8px #13100b,
    0 0 16px #ff9f1c,
    0 0 28px #070606;
}

.result-table {
  width: min(800px, 100%);
  margin: 0 auto;
  border-collapse: collapse;
  background: rgba(30, 18, 10, 0.88);
  border: 1px solid rgba(255, 204, 112, 0.45);
  overflow: hidden;
}

.result-table th,
.result-table td {
  padding: 14px;
  text-align: center;
  border: 1px solid rgba(255, 204, 112, 0.2);
}

.result-table th {
  background: rgba(60, 35, 15, 0.95);
}

.error {
  text-align: center;
  color: #ff8a8a;
}

.buttons {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

button {
  padding: 12px 20px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.75);
  color: #ffdc9a;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
</style>