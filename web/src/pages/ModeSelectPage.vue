<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goLocal() {
  router.push({ name: "local-lobby" });
}

function goOnline() {
  router.push({ name: "online-lobby" });
}
</script>

<template>
  <div class="mode-select-page">
    <!-- ローカル -->
    <button class="btn local" @click="goLocal">
      ローカルマッチ
    </button>

    <!-- オンライン -->
    <button class="btn online" @click="goOnline">
      オンラインマッチ
    </button>
  </div>
</template>

<style scoped>
.mode-select-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  /* ←ここにさっきの画像 */
  background: url("../assets/background/modeselect.png") center / cover no-repeat;
}

/* ======================
   共通ボタン
====================== */
.btn {
  position: absolute;
  border: none;
  background: transparent;
  cursor: pointer;

  font-size: 32px;
  font-weight: 900;
  color: white;

  text-shadow:
    0 4px 12px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(255, 255, 255, 0.6);

  transition: all 0.2s ease;
}

/* ======================
   ホバー演出（躍動感）
====================== */
.btn:hover {
  transform: translateY(-6px) scale(1.05);
  text-shadow:
    0 6px 18px rgba(0, 0, 0, 0.9),
    0 0 18px rgba(255, 255, 255, 0.9);
}

/* ======================
   クリック時
====================== */
.btn:active {
  transform: scale(0.95);
}

/* ======================
   ボタン位置（超重要）
====================== */

/* 左（赤ボタン） */
.local {
  left: 18%;
  top: 70%;
}

/* 右（青ボタン） */
.online {
  right: 17%;
  top: 70%;
}

/* ======================
   レスポンシブ
====================== */
@media (max-width: 768px) {
  .btn {
    font-size: 22px;
  }

  .local {
    left: 14%;
    top: 72%;
  }

  .online {
    right: 14%;
    top: 72%;
  }
}
.btn {
  letter-spacing: 2px;
}

.btn:hover {
  filter: brightness(1.2);
}
</style>