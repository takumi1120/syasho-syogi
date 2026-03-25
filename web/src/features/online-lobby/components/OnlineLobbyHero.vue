<script setup lang="ts">
type LobbyUser = {
  id: number;
  name: string;
};

defineProps<{
  userName: string;
  selectedCharacter: string;
  users: LobbyUser[];
  selectedLobbyUserId: string;
  canChangeLobbyUser: boolean;
  isMember: boolean;
}>();

const emit = defineEmits<{
  (e: "change-user", value: string): void;
}>();

function onChangeUser(event: Event) {
  emit("change-user", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <header class="hero-card">
    <div class="hero-main">
      <p class="eyebrow">SHACHO SHOGI ONLINE</p>
      <h1>オンラインロビー</h1>
      <p class="description">
        ルームを作成して待機、またはルームコードを入力して参加できます。
      </p>
    </div>

    <div class="hero-tools">
      <label class="hero-inline">
        <span class="inline-label">ユーザー</span>
        <select
          class="user-select"
          :value="selectedLobbyUserId"
          :disabled="!canChangeLobbyUser"
          @change="onChangeUser"
        >
          <option value="">ユーザーを選択</option>
          <option
            v-for="user in users"
            :key="user.id"
            :value="String(user.id)"
          >
            {{ user.name }}
          </option>
        </select>
      </label>

      <div class="hero-inline">
        <span class="inline-label">現在</span>
        <strong class="inline-value">{{ userName || "未選択" }}</strong>
      </div>

      <div class="hero-inline">
        <span class="inline-label">キャラクター</span>
        <strong class="inline-value">{{ selectedCharacter || "未選択" }}</strong>
      </div>
    </div>

    <p v-if="isMember" class="switch-hint">
      部屋参加中はユーザー変更できません。先に退出してください。
    </p>
  </header>
</template>

<style scoped>
.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 16px;
  align-items: center;
  padding: 12px 0 10px;
}

.hero-main {
  min-width: 0;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.24em;
  font-size: 11px;
  color: #7fe7ff;
  text-shadow: 0 0 12px rgba(127, 231, 255, 0.28);
}

h1 {
  margin: 4px 0 0;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.02;
  color: #ffffff;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.24);
}

.description {
  margin: 6px 0 0;
  color: rgba(238, 244, 255, 0.9);
  font-size: 13px;
  line-height: 1.6;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.hero-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.hero-inline {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(232, 241, 255, 0.14);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.inline-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(218, 234, 255, 0.84);
}

.inline-value {
  display: flex;
  align-items: center;
  min-height: 22px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.user-select {
  min-width: 190px;
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(193, 230, 255, 0.20);
  background: rgba(10, 19, 36, 0.34);
  color: #f5fbff;
  font-size: 13px;
  font-weight: 800;
  outline: none;
}

.user-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-hint {
  grid-column: 1 / -1;
  margin: 0;
  color: rgba(255, 223, 232, 0.98);
  font-size: 12px;
  line-height: 1.6;
}
.hero-card {
  grid-template-columns: 1fr;
  justify-items: center;
  text-align: center;
  gap: 14px;
  padding: 18px 0 12px;
}

.hero-main {
  display: grid;
  gap: 6px;
  justify-items: center;
}

.eyebrow {
  color: #ffd978;
  text-shadow: 0 0 12px rgba(255, 217, 120, 0.28);
}

h1 {
  color: #fff0b8;
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.32);
}

.description {
  max-width: 680px;
  color: rgba(255, 245, 214, 0.92);
}

.hero-tools {
  justify-content: center;
}

.hero-inline {
  background: rgba(10, 18, 33, 0.52);
  border: 1px solid rgba(255, 226, 154, 0.20);
}

.inline-label {
  color: rgba(255, 230, 171, 0.84);
}

.inline-value {
  color: #fff7dc;
}

.user-select {
  background: rgba(9, 16, 30, 0.70);
  border: 1px solid rgba(255, 221, 150, 0.26);
  color: #fff4cf;
}

.switch-hint {
  color: #ffd9a8;
}

@media (max-width: 980px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .hero-tools {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .hero-inline {
    width: 100%;
  }

  .user-select {
    min-width: 0;
    width: 100%;
  }

  h1 {
    font-size: 30px;
  }
}
</style>