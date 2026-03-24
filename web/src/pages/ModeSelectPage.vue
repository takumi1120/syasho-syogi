<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const onlineUserId = computed(() => {
  const raw = Number(localStorage.getItem("onlineUserId"));
  return Number.isInteger(raw) && raw > 0 ? raw : null;
});

const onlineUserName = computed(() => {
  return localStorage.getItem("onlineUserName")?.trim() || "";
});

function goLocal() {
  router.push({ name: "local-lobby" });
}

function goOnline() {
  if (!onlineUserId.value) {
    router.push({ name: "online-user-entry" });
    return;
  }

  router.push({
    name: "online-lobby",
    query: {
      userId: String(onlineUserId.value),
      userName: onlineUserName.value,
    },
  });
}

function changeOnlineUser() {
  router.push({ name: "online-user-entry" });
}
</script>

<template>
  <div class="mode-select-page">
    <button class="btn local" @click="goLocal">
      ローカルマッチ
    </button>

    <button class="btn online" @click="goOnline">
      オンラインマッチ
    </button>

    <section class="online-user-box">
      <p class="online-user-label">オンライン用ユーザー</p>

      <template v-if="onlineUserId">
        <p class="online-user-name">
          {{ onlineUserName }} <span>(ID: {{ onlineUserId }})</span>
        </p>
        <button class="change-user-button" @click="changeOnlineUser">
          ユーザー変更
        </button>
      </template>

      <template v-else>
        <p class="online-user-empty">未選択</p>
        <button class="change-user-button" @click="changeOnlineUser">
          ユーザー登録 / 選択
        </button>
      </template>
    </section>
  </div>
</template>

<style scoped>
.mode-select-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: url("../assets/background/modeselect.png") center / cover no-repeat;
}

.btn {
  position: absolute;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 32px;
  font-weight: 900;
  color: white;
  letter-spacing: 2px;
  text-shadow:
    0 4px 12px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-6px) scale(1.05);
  filter: brightness(1.2);
  text-shadow:
    0 6px 18px rgba(0, 0, 0, 0.9),
    0 0 18px rgba(255, 255, 255, 0.9);
}

.btn:active {
  transform: scale(0.95);
}

.local {
  left: 18%;
  top: 70%;
}

.online {
  right: 17%;
  top: 70%;
}

.online-user-box {
  position: absolute;
  left: 50%;
  bottom: 6%;
  transform: translateX(-50%);
  width: min(90vw, 520px);
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(8, 16, 30, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  color: #eef5ff;
  text-align: center;
}

.online-user-label {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.14em;
  color: #8ec5ff;
}

.online-user-name,
.online-user-empty {
  margin: 8px 0 0;
  font-size: 18px;
  font-weight: 800;
}

.online-user-name span {
  font-size: 14px;
  color: #b8d7f4;
  font-weight: 600;
}

.change-user-button {
  margin-top: 12px;
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  color: #10233c;
  background: linear-gradient(135deg, #86cbff 0%, #dcedff 100%);
}

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

  .online-user-box {
    bottom: 4%;
    width: min(94vw, 460px);
  }
}

@media (max-width: 560px) {
  .btn {
    font-size: 18px;
  }

  .local {
    left: 11%;
    top: 70%;
  }

  .online {
    right: 10%;
    top: 70%;
  }
}
</style>