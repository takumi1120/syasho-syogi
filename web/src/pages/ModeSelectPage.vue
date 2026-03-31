<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { resultService, type ResultStats } from "../services/resultService";
import { userService, type User } from "../services/userServices";
import {
  playModeSelectBgm,
  unlockModeSelectBgm,
  stopModeSelectBgm,
} from "../features/audio/modeSelectBgm";

const router = useRouter();

const users = ref<User[]>([]);
const loadingUsers = ref(false);
const errorMessage = ref("");

const currentOnlineUserId = ref<number | null>(null);
const currentOnlineUserName = ref("");

const selectedOnlineUserId = ref("");

const currentStats = ref<ResultStats | null>(null);
const loadingStats = ref(false);
const statsErrorMessage = ref("");

const isMusicPlaying = ref(true);

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

  void fetchCurrentUserStats();
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

async function fetchCurrentUserStats() {
  if (!currentOnlineUserId.value) {
    currentStats.value = null;
    statsErrorMessage.value = "";
    return;
  }

  loadingStats.value = true;
  statsErrorMessage.value = "";

  try {
    currentStats.value = await resultService.getUserStats(currentOnlineUserId.value);
  } catch (error) {
    currentStats.value = null;
    statsErrorMessage.value =
      error instanceof Error ? error.message : "戦績の取得に失敗しました";
  } finally {
    loadingStats.value = false;
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

function goTopPage() {
  window.location.href = "http://54.252.188.39:8080/#/";
}

function formatWinRate(rate: number) {
  return `${rate.toFixed(1)}%`;
}

async function handleFirstPointerDown() {
  if (isMusicPlaying.value) return;
  unlockModeSelectBgm();
  isMusicPlaying.value = true;
}

async function handleToggleMusic() {
  if (isMusicPlaying.value) {
    stopModeSelectBgm(false);
    isMusicPlaying.value = false;
    return;
  }

  await playModeSelectBgm();
  isMusicPlaying.value = true;
}

onMounted(async () => {
  syncCurrentUserFromStorage();
  await fetchUsers();
  await fetchCurrentUserStats();

  await playModeSelectBgm();
  isMusicPlaying.value = true;
});
</script>

<template>
  <div class="mode-select-page" @pointerdown.once="handleFirstPointerDown">
    <button class="btn local" @click="goLocal">
      ローカルマッチ
    </button>

    <button class="btn online" @click="goOnline">
      オンラインマッチ
    </button>

    <button class="music-toggle-button" @click="handleToggleMusic">
      {{ isMusicPlaying ? "音楽停止" : "音楽再生" }}
    </button>

    <button class="top-page-button" @click="goTopPage">
      ゴブリンゴブラーズへ
    </button>

    <section class="online-user-box">
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
          {{ user.name }}
        </option>
      </select>

      <div class="record-strip">
        <p class="record-heading">RESULT</p>

        <p v-if="loadingStats" class="record-empty">
          戦績を読み込み中...
        </p>

        <template v-else-if="currentOnlineUserId && currentStats">
          <div class="record-grid">
            <div class="record-chip chip-win">
              <span class="record-chip-label">勝</span>
              <strong class="record-chip-value">{{ currentStats.totalWins }}</strong>
            </div>

            <div class="record-chip chip-lose">
              <span class="record-chip-label">敗</span>
              <strong class="record-chip-value">{{ currentStats.totalLoses }}</strong>
            </div>

            <div class="record-chip chip-rate">
              <span class="record-chip-label">勝率</span>
              <strong class="record-chip-value">{{ formatWinRate(currentStats.winRate) }}</strong>
            </div>

            <div class="record-chip chip-rank">
              <span class="record-chip-label">順位</span>
              <strong class="record-chip-value">
                {{ currentStats.rank !== null ? `${currentStats.rank}位` : "-" }}
              </strong>
            </div>
          </div>
        </template>

        <p v-else class="record-empty">
          戦績なし
        </p>
      </div>

      <button class="register-user-button" @click="goUserRegister">
        ユーザー登録
      </button>

      <p v-if="loadingUsers" class="helper-text">
        ユーザー一覧を読み込み中...
      </p>
      <p v-else class="helper-text">
        ユーザー変更はこの画面でできます
      </p>

      <p v-if="statsErrorMessage" class="error-text">
        {{ statsErrorMessage }}
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
  background: url("../assets/background/mode_select_particles_up_sweep_soft.gif") center / cover no-repeat;
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

.music-toggle-button {
  position: absolute;
  left: 95%;
  top: 92%;
  transform: translateX(-50%);
  width: 50px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 13px;
  color: #4f4a87;
  background: linear-gradient(
    135deg,
    rgba(248, 236, 255, 0.94) 0%,
    rgba(236, 245, 255, 0.96) 50%,
    rgba(226, 239, 255, 0.94) 100%
  );
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  z-index: 2;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.music-toggle-button:hover {
  filter: brightness(1.03);
}

.music-toggle-button:active {
  transform: translateX(-50%) scale(0.97);
}

.top-page-button {
  position: absolute;
  left: 3%;
  bottom: 4%;
  width: 160px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 14px;
  color: #4f4a87;
  background: linear-gradient(
    135deg,
    rgba(248, 236, 255, 0.94) 0%,
    rgba(236, 245, 255, 0.96) 50%,
    rgba(226, 239, 255, 0.94) 100%
  );
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  z-index: 2;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.top-page-button:hover {
  filter: brightness(1.03);
  transform: translateY(-2px);
}

.top-page-button:active {
  transform: scale(0.97);
}

.online-user-box {
  position: absolute;
  right: 4%;
  top: 35%;
  transform: translateY(-50%);
  width: min(28vw, 280px);
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  backdrop-filter: none;
  color: #b98f1c;
  text-align: center;
  box-shadow: none;
}

.change-user-select {
  width: 208px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(248, 252, 255, 0.92) 0%,
    rgba(228, 242, 255, 0.88) 100%
  );
  color: #31507b;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 800;
  outline: none;
  text-align: center;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.change-user-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.change-user-select option {
  color: #31507b;
  background: #f7fbff;
}

.record-strip {
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 12px 12px 10px;
  border-radius: 20px;
  background: linear-gradient(
    180deg,
    rgb(24, 125, 202) 0%,
    rgba(255, 255, 255, 0.09) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 10px 18px rgba(0, 0, 0, 0.14);
  backdrop-filter: blur(6px);
}

.record-heading {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: #d8f1ff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.record-chip {
  padding: 10px 8px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.chip-win {
  background: linear-gradient(135deg, rgba(143, 226, 255, 0.9), rgba(130, 187, 255, 0.82));
}

.chip-lose {
  background: linear-gradient(135deg, rgba(255, 185, 226, 0.88), rgba(255, 153, 190, 0.8));
}

.chip-rate {
  background: linear-gradient(135deg, rgba(184, 255, 220, 0.88), rgba(138, 234, 201, 0.8));
}

.chip-rank {
  background: linear-gradient(135deg, rgba(255, 234, 163, 0.92), rgba(255, 198, 136, 0.84));
}

.record-chip-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
}

.record-chip-value {
  display: block;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.record-empty {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #ecf7ff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.register-user-button {
  width: 208px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 13px;
  color: #4f4a87;
  background: linear-gradient(
    135deg,
    rgba(248, 236, 255, 0.94) 0%,
    rgba(236, 245, 255, 0.96) 50%,
    rgba(226, 239, 255, 0.94) 100%
  );
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.register-user-button:hover,
.change-user-select:hover {
  filter: brightness(1.03);
}

.helper-text {
  margin: 8px 0 0;
  font-size: 11px;
  color: #eef7ff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.error-text {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #ffd1d1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

@media (max-width: 900px) {
  .online-user-box {
    right: 3%;
    width: min(32vw, 248px);
  }

  .change-user-select,
  .register-user-button {
    width: 196px;
  }

  .record-chip-value {
    font-size: 16px;
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

  .music-toggle-button {
    top: 80%;
    width: 154px;
    height: 40px;
    font-size: 12px;
  }

  .top-page-button {
    left: 4%;
    bottom: 3%;
    width: 154px;
    height: 40px;
    font-size: 12px;
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

  .music-toggle-button {
    top: 78%;
    width: 146px;
    height: 36px;
    font-size: 12px;
  }

  .top-page-button {
    left: 4%;
    bottom: 3%;
    width: 146px;
    height: 36px;
    font-size: 12px;
  }

  .change-user-select,
  .register-user-button {
    width: 188px;
    height: 36px;
    font-size: 12px;
  }
}

@media (max-width: 430px) {
  .btn {
    width: min(78vw, 280px);
    font-size: 17px;
    letter-spacing: 1px;
    text-align: center;
    white-space: nowrap;
  }

  .local,
  .online {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }

  .local {
    top: 61%;
  }

  .online {
    top: 69%;
  }

  .btn:hover {
    transform: translateX(-50%) translateY(-4px) scale(1.02);
  }

  .btn:active {
    transform: translateX(-50%) scale(0.98);
  }

  .music-toggle-button {
    top: 78%;
    left: 50%;
    transform: translateX(-50%);
    width: min(78vw, 280px);
  }

  .music-toggle-button:active {
    transform: translateX(-50%) scale(0.97);
  }

  .top-page-button {
    left: 50%;
    bottom: 18%;
    transform: translateX(-50%);
    width: min(78vw, 280px);
  }

  .top-page-button:hover {
    transform: translateX(-50%) translateY(-4px) scale(1.02);
  }

  .top-page-button:active {
    transform: translateX(-50%) scale(0.98);
  }

  .online-user-box {
    bottom: 2.5%;
    width: min(92vw, 340px);
    padding: 12px;
    border-radius: 14px;
  }

  .change-user-select,
  .register-user-button {
    width: 100%;
  }
}
</style>