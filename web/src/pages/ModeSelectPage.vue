<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { userService, type User } from "../services/userServices";

const router = useRouter();

const users = ref<User[]>([]);
const loadingUsers = ref(false);
const errorMessage = ref("");

const currentOnlineUserId = ref<number | null>(null);
const currentOnlineUserName = ref("");

const selectedOnlineUserId = ref("");

function syncCurrentUserFromStorage() {
  const rawId = Number(localStorage.getItem("onlineUserId"));
  currentOnlineUserId.value = Number.isInteger(rawId) && rawId > 0 ? rawId : null;
  currentOnlineUserName.value = localStorage.getItem("onlineUserName")?.trim() || "";
  selectedOnlineUserId.value = currentOnlineUserId.value
    ? String(currentOnlineUserId.value)
    : "";
}

function saveOnlineUser(user: User) {
  currentOnlineUserId.value = user.id;
  currentOnlineUserName.value = user.name;
  selectedOnlineUserId.value = String(user.id);

  localStorage.setItem("onlineUserId", String(user.id));
  localStorage.setItem("onlineUserName", user.name);
}

async function fetchUsers() {
  loadingUsers.value = true;
  errorMessage.value = "";

  try {
    const fetched = await userService.getUsers();

    if (
      currentOnlineUserId.value &&
      !fetched.some((user) => user.id === currentOnlineUserId.value)
    ) {
      users.value = [
        {
          id: currentOnlineUserId.value,
          name: currentOnlineUserName.value || `ユーザー ${currentOnlineUserId.value}`,
        },
        ...fetched,
      ];
    } else {
      users.value = fetched;
    }

    selectedOnlineUserId.value = currentOnlineUserId.value
      ? String(currentOnlineUserId.value)
      : "";
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "ユーザー一覧の取得に失敗しました";
  } finally {
    loadingUsers.value = false;
  }
}

function handleUserChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  selectedOnlineUserId.value = value;

  const nextUserId = Number(value);
  if (!Number.isInteger(nextUserId) || nextUserId <= 0) return;

  const nextUser = users.value.find((user) => user.id === nextUserId);
  if (!nextUser) return;

  saveOnlineUser(nextUser);
}

function goLocal() {
  router.push({ name: "local-lobby" });
}

function goOnline() {
  if (!currentOnlineUserId.value) {
    router.push({ name: "online-user-entry" });
    return;
  }

  router.push({
    name: "online-lobby",
    query: {
      userId: String(currentOnlineUserId.value),
      userName: currentOnlineUserName.value,
    },
  });
}

function goUserRegister() {
  router.push({ name: "online-user-entry" });
}

onMounted(() => {
  syncCurrentUserFromStorage();
  fetchUsers();
});
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

      <div class="online-user-actions">
        <select
          class="change-user-select"
          :value="selectedOnlineUserId"
          :disabled="loadingUsers || users.length === 0"
          @change="handleUserChange"
        >
          <option value="">
            {{
              loadingUsers
                ? "ユーザー読込中..."
                : users.length === 0
                  ? "登録済みユーザーなし"
                  : "ユーザーを選択"
            }}
          </option>
          <option
            v-for="user in users"
            :key="user.id"
            :value="String(user.id)"
          >
            {{ user.name }} (ID: {{ user.id }})
          </option>
        </select>

        <button class="register-user-button" @click="goUserRegister">
          ユーザー登録
        </button>
      </div>

      <p v-if="loadingUsers" class="helper-text">
        ユーザー一覧を読み込み中...
      </p>
      <p v-else class="helper-text">
        上記ボタンでユーザー登録
      </p>

      <p v-if="errorMessage" class="error-text">
        {{ errorMessage }}
      </p>
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
  right: 6%;
  top: 28%;
  width: min(26vw, 290px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  text-align: center;
  background: transparent;
  border: none;
  padding: 0;
  transform: none;
}

.online-user-label {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #a91778;
  text-shadow:
    0 2px 8px rgba(78, 29, 138, 0.45),
    0 0 16px rgba(255, 255, 255, 0.65);
}

.online-user-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.change-user-select {
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(91, 170, 255, 0.95) 0%,
    rgba(126, 209, 255, 0.95) 55%,
    rgba(180, 235, 255, 0.95) 100%
  );
  color: #10396c;
  font-size: 14px;
  font-weight: 900;
  text-align: center;
  outline: none;
  box-shadow:
    0 10px 24px rgba(76, 127, 255, 0.22),
    inset 0 2px 8px rgba(255, 255, 255, 0.5);
}

.change-user-select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.register-user-button {
  width: 100%;
  height: 48px;
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  color: #7b245d;
  background: linear-gradient(
    135deg,
    rgba(255, 197, 236, 0.96) 0%,
    rgba(255, 224, 244, 0.96) 45%,
    rgba(255, 246, 186, 0.96) 100%
  );
  box-shadow:
    0 10px 24px rgba(255, 132, 207, 0.24),
    inset 0 2px 8px rgba(255, 255, 255, 0.55);
  transition: transform 0.18s ease, filter 0.18s ease;
}

.register-user-button:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.04);
}

.helper-text {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  color: #0c0c0c;
  text-shadow:
    0 2px 10px rgba(64, 44, 138, 0.45),
    0 0 10px rgba(255, 255, 255, 0.4);
}

.error-text {
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  color: #ff3e7f;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(255, 62, 127, 0.18);
}

@media (max-width: 1100px) {
  .online-user-box {
    right: 3.5%;
    top: 26%;
    width: min(29vw, 270px);
  }
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
    right: 50%;
    top: auto;
    bottom: 5%;
    transform: translateX(50%);
    width: min(88vw, 300px);
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

  .online-user-box {
    width: min(90vw, 290px);
    bottom: 4%;
  }

  .change-user-select,
  .register-user-button {
    height: 44px;
    font-size: 13px;
  }
}
</style>