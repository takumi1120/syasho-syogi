<script setup lang="ts">
type LobbyUser = {
  id: number;
  name: string;
};

type CurrentUserSummary = {
  id: number;
  name: string;
} | null;

defineProps<{
  userName: string;
  userId: number | null;
  selectedCharacter: string;
  users: LobbyUser[];
  selectedLobbyUserId: string;
  currentUserSummary: CurrentUserSummary;
  loadingUsers: boolean;
  canChangeLobbyUser: boolean;
  isMember: boolean;
}>();

const emit = defineEmits<{
  (e: "refresh-users"): void;
  (e: "update:selected-lobby-user-id", value: string): void;
  (e: "apply-selected-lobby-user"): void;
}>();
</script>

<template>
  <header class="hero-card">
    <p class="eyebrow">SHACHO SHOGI ONLINE</p>
    <h1>オンラインロビー</h1>
    <p class="description">
      ルームを作成して待機、またはルームコードを入力して参加できます。
    </p>

    <div class="player-summary">
      <div class="summary-chip">
        <span class="chip-label">ユーザー</span>
        <strong>{{ userName }}</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">ユーザーID</span>
        <strong>{{ userId ?? "未設定" }}</strong>
      </div>
      <div class="summary-chip">
        <span class="chip-label">キャラクター</span>
        <strong>{{ selectedCharacter || "未選択" }}</strong>
      </div>
    </div>

    <section class="hero-user-switch">
      <div class="hero-user-switch-head">
        <div>
          <p class="mini-label">USER SELECT</p>
          <h3>ユーザー変更</h3>
        </div>

        <button
          class="refresh-users-button"
          type="button"
          :disabled="loadingUsers"
          @click="emit('refresh-users')"
        >
          {{ loadingUsers ? "更新中..." : "再読込" }}
        </button>
      </div>

      <div class="hero-user-switch-row">
        <select
          class="hero-user-select"
          :value="selectedLobbyUserId"
          :disabled="!canChangeLobbyUser"
          @change="emit('update:selected-lobby-user-id', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">ユーザーを選択</option>
          <option
            v-for="user in users"
            :key="user.id"
            :value="String(user.id)"
          >
            {{ user.name }} (ID: {{ user.id }})
          </option>
        </select>

        <button
          class="apply-user-button"
          type="button"
          :disabled="!canChangeLobbyUser || !selectedLobbyUserId"
          @click="emit('apply-selected-lobby-user')"
        >
          このユーザーに変更
        </button>
      </div>

      <p class="current-user-text">
        現在のユーザー:
        <strong>
          {{
            currentUserSummary
              ? `${currentUserSummary.name} (ID: ${currentUserSummary.id})`
              : "未選択"
          }}
        </strong>
      </p>

      <p v-if="isMember" class="switch-hint">
        部屋参加中はユーザー変更できません。先に退出してください。
      </p>
    </section>
  </header>
</template>

<style scoped>
.hero-card {
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(157, 206, 255, 0.18);
  background: rgba(18, 29, 52, 0.74);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #8ec5ff;
}

h1 {
  margin: 10px 0 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.05;
  color: #f4f8ff;
}

.description {
  margin: 14px 0 0;
  color: rgba(238, 245, 255, 0.82);
  font-size: 15px;
}

.player-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.summary-chip {
  min-width: 150px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(157, 206, 255, 0.14);
}

.chip-label {
  display: block;
  font-size: 11px;
  color: rgba(210, 228, 255, 0.7);
  margin-bottom: 4px;
}

.hero-user-switch {
  margin-top: 18px;
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(157, 206, 255, 0.16);
  background: rgba(18, 29, 52, 0.54);
  backdrop-filter: blur(8px);
}

.hero-user-switch-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.22em;
  font-size: 11px;
  color: #8ec5ff;
}

.hero-user-switch-head h3 {
  margin: 8px 0 0;
  font-size: 18px;
  color: #f4f8ff;
}

.refresh-users-button,
.apply-user-button {
  border: none;
  cursor: pointer;
  font-weight: 800;
}

.refresh-users-button:disabled,
.apply-user-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.refresh-users-button {
  min-width: 88px;
  padding: 10px 14px;
  border-radius: 12px;
  color: #eef5ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(157, 206, 255, 0.16);
}

.hero-user-switch-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 10px;
  margin-top: 14px;
}

.hero-user-select {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(157, 206, 255, 0.2);
  background: rgba(7, 16, 31, 0.75);
  color: #f2f7ff;
  font-size: 14px;
  font-weight: 700;
  outline: none;
}

.apply-user-button {
  min-height: 48px;
  border-radius: 14px;
  color: #081221;
  background: linear-gradient(180deg, #9ed8ff 0%, #74bfff 100%);
}

.current-user-text {
  margin: 12px 0 0;
  color: rgba(225, 238, 255, 0.88);
}

.switch-hint {
  margin: 8px 0 0;
  color: rgba(255, 214, 223, 0.92);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-user-switch-row {
    grid-template-columns: 1fr;
  }

  .hero-user-switch-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .hero-card {
    padding: 18px;
    border-radius: 20px;
  }

  h1 {
    font-size: 28px;
  }

  .player-summary {
    display: grid;
    grid-template-columns: 1fr;
  }

  .summary-chip {
    width: 100%;
  }
}
</style>