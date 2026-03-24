<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { userService, type User } from "../services/userServices";

const router = useRouter();

const users = ref<User[]>([]);
const loadingUsers = ref(false);
const registering = ref(false);

const newUserName = ref("");
const selectedUserId = ref<number | null>(null);

const message = ref("");
const errorMessage = ref("");

const selectedUser = computed(() => {
  return users.value.find((user) => user.id === selectedUserId.value) ?? null;
});

const canRegister = computed(() => {
  return newUserName.value.trim().length > 0 && !registering.value;
});

const canComplete = computed(() => {
  return selectedUser.value !== null && !registering.value;
});

function setMessage(text = "") {
  message.value = text;
  errorMessage.value = "";
}

function setError(text = "") {
  errorMessage.value = text;
  message.value = "";
}

function saveOnlineUser(user: User) {
  localStorage.setItem("onlineUserId", String(user.id));
  localStorage.setItem("onlineUserName", user.name);
}

async function fetchUsers() {
  loadingUsers.value = true;
  errorMessage.value = "";

  try {
    const fetched = await userService.getUsers();
    users.value = fetched;

    const storedId = Number(localStorage.getItem("onlineUserId"));
    if (Number.isInteger(storedId) && storedId > 0) {
      const found = fetched.find((user) => user.id === storedId);
      if (found) {
        selectedUserId.value = found.id;
      }
    }
  } catch (error) {
    const text =
      error instanceof Error ? error.message : "ユーザー一覧の取得に失敗しました";
    setError(text);
  } finally {
    loadingUsers.value = false;
  }
}

async function registerUser() {
  if (!canRegister.value) return;

  registering.value = true;
  message.value = "";
  errorMessage.value = "";

  try {
    const result = await userService.register(newUserName.value.trim());

    await fetchUsers();

    selectedUserId.value = result.id;
    saveOnlineUser(result);
    newUserName.value = "";

    setMessage(
      result.created
        ? `ユーザー「${result.name}」を登録しました`
        : `ユーザー「${result.name}」を選択しました`
    );
  } catch (error) {
    const text =
      error instanceof Error ? error.message : "ユーザー登録に失敗しました";
    setError(text);
  } finally {
    registering.value = false;
  }
}

function selectUser(userId: number) {
  selectedUserId.value = userId;

  const user = users.value.find((item) => item.id === userId);
  if (!user) return;

  saveOnlineUser(user);
  setMessage(`ユーザー「${user.name}」を選択しました`);
}

function completeAndBack() {
  if (!selectedUser.value) {
    setError("ユーザーを選択してください。");
    return;
  }

  saveOnlineUser(selectedUser.value);
  router.push({ name: "mode-select" });
}

function goBack() {
  router.push({ name: "mode-select" });
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <section class="entry-page">
    <div class="entry-card">
      <p class="eyebrow">ONLINE USER ENTRY</p>
      <h1>ユーザー登録 / 選択</h1>
      <p class="sub">
        オンライン用ユーザーを設定すると、モードセレクト画面へ戻ります。
      </p>

      <div class="register-row">
        <input
          v-model="newUserName"
          class="name-input"
          type="text"
          maxlength="20"
          placeholder="新しいユーザー名を入力"
          @keydown.enter="registerUser"
        />
        <button class="register-button" :disabled="!canRegister" @click="registerUser">
          {{ registering ? "登録中..." : "登録" }}
        </button>
      </div>

      <p v-if="message" class="notice success">{{ message }}</p>
      <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>

      <div class="users-area">
        <div class="users-head">
          <h2>登録済みユーザー</h2>
          <button
            class="refresh-button"
            type="button"
            @click="fetchUsers"
            :disabled="loadingUsers"
          >
            {{ loadingUsers ? "更新中..." : "再読込" }}
          </button>
        </div>

        <p v-if="!loadingUsers && users.length === 0" class="empty-text">
          まだユーザーが登録されていません
        </p>

        <div v-else class="user-list">
          <button
            v-for="user in users"
            :key="user.id"
            type="button"
            class="user-chip"
            :class="{ selected: user.id === selectedUserId }"
            @click="selectUser(user.id)"
          >
            <span class="user-chip-name">{{ user.name }}</span>
            <span class="user-chip-id">ID: {{ user.id }}</span>
          </button>
        </div>
      </div>

      <div class="current-user-box">
        <span class="current-label">現在の選択</span>
        <strong class="current-name">
          {{ selectedUser ? `${selectedUser.name} (ID: ${selectedUser.id})` : "未選択" }}
        </strong>
      </div>

      <div class="footer-actions">
        <button class="back-button" @click="goBack">
          戻る
        </button>
        <button class="complete-button" :disabled="!canComplete" @click="completeAndBack">
          決定して戻る
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.entry-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(128, 196, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #16233d 0%, #0d162a 58%, #07101d 100%);
  color: #eef5ff;
}

.entry-card {
  width: min(100%, 760px);
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(160, 205, 255, 0.18);
  background: rgba(12, 20, 37, 0.84);
  backdrop-filter: blur(8px);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.3);
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 30px;
}

.sub {
  margin: 10px 0 0;
  color: #bcd4ef;
  line-height: 1.7;
}

.register-row {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 10px;
}

.name-input {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(160, 205, 255, 0.18);
  background: rgba(22, 34, 56, 0.95);
  color: #eef5ff;
  padding: 0 14px;
  font-size: 16px;
  box-sizing: border-box;
}

.register-button,
.refresh-button,
.back-button,
.complete-button {
  border: none;
  cursor: pointer;
  font-weight: 800;
  transition: 0.2s ease;
}

.register-button {
  height: 48px;
  border-radius: 14px;
  color: #0d1b2f;
  background: linear-gradient(135deg, #8ec5ff 0%, #d8ecff 100%);
}

.register-button:disabled,
.refresh-button:disabled,
.complete-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.notice {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.success {
  background: rgba(80, 200, 140, 0.14);
  border: 1px solid rgba(80, 200, 140, 0.28);
  color: #8df0b7;
}

.error {
  background: rgba(255, 107, 107, 0.14);
  border: 1px solid rgba(255, 107, 107, 0.28);
  color: #ffb3b3;
}

.users-area {
  margin-top: 24px;
}

.users-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.users-head h2 {
  margin: 0;
  font-size: 18px;
}

.refresh-button {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(27, 42, 66, 0.96);
  color: #eef5ff;
  border: 1px solid rgba(160, 205, 255, 0.16);
}

.empty-text {
  margin: 12px 0 0;
  color: #9bb7d7;
}

.user-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-height: 220px;
  overflow-y: auto;
}

.user-chip {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(22, 34, 56, 0.88);
  color: #eef5ff;
  cursor: pointer;
  text-align: left;
}

.user-chip.selected {
  border-color: rgba(134, 203, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(134, 203, 255, 0.6) inset;
  background: rgba(28, 49, 79, 0.96);
}

.user-chip-name {
  display: block;
  font-weight: 800;
}

.user-chip-id {
  display: block;
  margin-top: 4px;
  color: #8ec5ff;
  font-size: 13px;
}

.current-user-box {
  margin-top: 20px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(18, 29, 46, 0.82);
  border: 1px solid rgba(160, 205, 255, 0.16);
}

.current-label {
  display: block;
  font-size: 12px;
  color: #8ec5ff;
}

.current-name {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.back-button,
.complete-button {
  height: 48px;
  border-radius: 16px;
  padding: 0 20px;
}

.back-button {
  background: rgba(27, 42, 66, 0.96);
  color: #eef5ff;
  border: 1px solid rgba(160, 205, 255, 0.16);
}

.complete-button {
  flex: 1;
  background: linear-gradient(135deg, #6fc2ff 0%, #cfe7ff 100%);
  color: #10233c;
}

@media (max-width: 768px) {
  .register-row {
    grid-template-columns: 1fr;
  }

  .user-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .entry-card {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .user-list {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
  }
}
</style>