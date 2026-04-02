<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useFixedStage } from "../composables/useFixedStage";
import { resultService, type ResultStats } from "../services/resultService";
import { userService, type User } from "../services/userServices";
import {
  playModeSelectBgm,
  unlockModeSelectBgm,
  stopModeSelectBgm,
} from "../features/audio/modeSelectBgm";

const router = useRouter();
const viewportRef = ref<HTMLElement | null>(null);

const { stageShellStyle, stageStyle } = useFixedStage({
  baseWidth: 1920,
  baseHeight: 1080,
  viewportPadding: 0,
  viewportRef,
});

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

function goOmake() {
  router.push({ name: "omake" });
}

function goOmake2() {
  router.push({ name: "omake2" });
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
  <div ref="viewportRef" class="mode-select-page" @pointerdown.once="handleFirstPointerDown">
    <div class="mode-stage-shell" :style="stageShellStyle">
      <div class="mode-scene" :style="stageStyle">
        <button class="btn local" type="button" @click="goLocal">
          ローカルマッチ
        </button>

        <button class="btn online" type="button" @click="goOnline">
          オンラインマッチ
        </button>

        <button class="music-toggle-button" type="button" @click="handleToggleMusic">
          {{ isMusicPlaying ? "音楽停止" : "音楽再生" }}
        </button>

        <button class="top-page-button" type="button" @click="goTopPage">
          ゴブリンゴブラーズへ
        </button>

        <button class="omake-page-button" type="button" @click="goOmake">
          OMAKEへ
        </button>

        <button class="omake2-page-button" type="button" @click="goOmake2">
          OMAKE2へ
        </button>

        <section class="online-user-box">
          <p class="panel-label">ONLINE USER</p>

          <select
            class="change-user-select"
            :value="selectedOnlineUserId"
            :disabled="loadingUsers || users.length === 0"
            @change="handleUserChange"
          >
            <option value="">
              {{
                loadingUsers
                  ? "ユーザー読み込み中..."
                  : users.length === 0
                    ? "利用可能なユーザーがいません"
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
                  <span class="record-chip-label">負</span>
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

          <button class="register-user-button" type="button" @click="goUserRegister">
            ユーザー登録
          </button>

          <p v-if="loadingUsers" class="helper-text">
            ユーザー一覧を読み込み中...
          </p>
          <p v-else class="helper-text">
            ユーザー変更はこの画面でいつでもできます。
          </p>

          <p v-if="statsErrorMessage" class="error-text">
            {{ statsErrorMessage }}
          </p>

          <p v-if="errorMessage" class="error-text">
            {{ errorMessage }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  max-width: 100%;
  margin: 0;
  border-inline: none;
}

.mode-select-page {
  height: 100dvh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
}

.mode-stage-shell {
  position: relative;
}

.mode-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 36px;
  background:
    url("../assets/background/mode_select_particles_up_sweep_soft.gif") center / cover no-repeat;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.42);
  color: #ffffff;
}

.mode-scene::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent 38%),
    linear-gradient(180deg, rgba(10, 18, 38, 0.1) 0%, rgba(6, 11, 24, 0.2) 100%);
  pointer-events: none;
}

.btn,
.music-toggle-button,
.top-page-button,
.omake-page-button,
.omake2-page-button,
.online-user-box {
  position: absolute;
  z-index: 2;
}

.btn {
  width: 459px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 46px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.08em;
  text-shadow:
    0 4px 12px rgba(0, 0, 0, 0.82),
    0 0 14px rgba(255, 255, 255, 0.64);
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.btn:hover {
  transform: translateY(-6px) scale(1.03);
  filter: brightness(1.15);
  text-shadow:
    0 8px 22px rgba(0, 0, 0, 0.9),
    0 0 24px rgba(255, 255, 255, 0.88);
}

.btn:active {
  transform: scale(0.97);
}

.local {
  left: 340px;
  top: 750px;
}

.online {
  right: 330px;
  top: 750px;
}

.music-toggle-button,
.top-page-button,
.omake-page-button,
.omake2-page-button,
.register-user-button,
.change-user-select {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
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

.music-toggle-button,
.top-page-button,
.omake-page-button,
.omake2-page-button,
.register-user-button {
  cursor: pointer;
  font-weight: 900;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.music-toggle-button:hover,
.top-page-button:hover,
.omake-page-button:hover,
.omake2-page-button:hover,
.register-user-button:hover,
.change-user-select:hover {
  filter: brightness(1.03);
}

.music-toggle-button {
  right: 70px;
  bottom: 44px;
  width: 132px;
  height: 44px;
  font-size: 13px;
}

.music-toggle-button:active {
  transform: scale(0.97);
}

.top-page-button {
  left: 58px;
  bottom: 44px;
  width: 222px;
  height: 44px;
  font-size: 14px;
}

.omake-page-button {
  left: 58px;
  bottom: 100px;
  width: 222px;
  height: 44px;
  font-size: 14px;
}

.omake2-page-button {
  left: 58px;
  bottom: 156px;
  width: 222px;
  height: 44px;
  font-size: 14px;
}

.top-page-button:active,
.omake-page-button:active,
.omake2-page-button:active,
.register-user-button:active {
  transform: scale(0.97);
}

.online-user-box {
  right: 76px;
  top: 378px;
  width: 280px;
  transform: translateY(-50%);
  padding: 22px 18px 18px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(18, 83, 149, 0.86), rgba(10, 35, 76, 0.78));
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 18px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.panel-label {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: #d7efff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.change-user-select,
.register-user-button {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 800;
  outline: none;
}

.change-user-select {
  text-align: center;
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
  margin: 14px 0 12px;
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
</style>
