<script setup lang="ts">
import OnlineLobbyHero from "./OnlineLobbyHero.vue";
import RoomActionPanel from "./RoomActionPanel.vue";
import RoomStatusPanel from "./RoomStatusPanel.vue";
import RoomFooterActions from "./RoomFooterActions.vue";
import { useOnlineLobby } from "../composables/useOnlineLobby";

const {
  loading,
  message,
  errorMessage,
  room,
  roomCodeInput,

  users,
  selectedLobbyUserId,

  userName,
  selectedCharacter,

  isHost,
  isMember,
  myReady,
  opponentReady,

  statusLabel,
  canCreateRoom,
  canJoinRoom,
  canToggleReady,
  canStartGame,
  canChangeLobbyUser,
  canChangeCharacter,

  characterOptions,

  updateSelectedLobbyUserId,
  updateSelectedCharacter,
  applySelectedLobbyUser,

  copyRoomCode,
  handleCreateRoom,
  handleJoinRoom,
  handleToggleReady,
  handleStartGame,
  handleLeaveRoom,
} = useOnlineLobby();

function updateRoomCodeInput(value: string) {
  roomCodeInput.value = value;
}

async function handleLobbyUserChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  updateSelectedLobbyUserId(value);

  if (!value) return;
  await applySelectedLobbyUser();
}

function handleCharacterChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  updateSelectedCharacter(value);
}
</script>

<template>
  <div class="online-lobby-content">
    <OnlineLobbyHero />

    <div class="content-grid">
      <div class="left-column">
        <section class="user-area">
          <div class="user-head">
            <p class="mini-label">LOBBY USER</p>
            <h2>ユーザー設定</h2>
          </div>

          <div class="user-grid">
            <label class="user-card user-select-card">
              <span class="card-label">ユーザー</span>
              <select
                class="user-select"
                :value="selectedLobbyUserId"
                :disabled="!canChangeLobbyUser"
                @change="handleLobbyUserChange"
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

            <label class="user-card user-select-card">
              <span class="card-label">キャラクター</span>
              <select
                class="character-select"
                :value="selectedCharacter"
                :disabled="!canChangeCharacter"
                @change="handleCharacterChange"
              >
                <option
                  v-for="option in characterOptions"
                  :key="option.value || 'empty'"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>

            <div class="user-card">
              <span class="card-label">現在のユーザー</span>
              <strong class="card-value">{{ userName || "未選択" }}</strong>
            </div>

            <div class="user-card">
              <span class="card-label">現在のキャラ</span>
              <strong class="card-value">{{ selectedCharacter || "未選択" }}</strong>
            </div>
          </div>

          <p v-if="isMember" class="switch-hint">
            部屋参加中はユーザー変更・キャラ変更できません。先に退出してください。
          </p>
        </section>

        <RoomActionPanel
          :model-value="roomCodeInput"
          :loading="loading"
          :can-create-room="canCreateRoom"
          :can-join-room="canJoinRoom"
          :message="message"
          :error-message="errorMessage"
          @update:model-value="updateRoomCodeInput"
          @create="handleCreateRoom"
          @join="handleJoinRoom"
        />
      </div>

      <div class="right-column">
        <RoomStatusPanel
          :room="room"
          :status-label="statusLabel"
          @copy="copyRoomCode"
        />

        <RoomFooterActions
          :is-member="isMember"
          :is-host="isHost"
          :my-ready="myReady"
          :opponent-ready="opponentReady"
          :can-toggle-ready="canToggleReady"
          :can-start-game="canStartGame"
          :loading="loading"
          @toggle-ready="handleToggleReady"
          @start="handleStartGame"
          @leave="handleLeaveRoom"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.online-lobby-content {
  --online-lobby-content-gap: 10px;
  --online-lobby-column-gap: 18px;
  --online-lobby-stack-gap: 14px;
  --online-lobby-column-offset: -30px;
  --online-lobby-user-area-gap: 10px;
  --online-lobby-user-area-offset: -75px;
  --online-lobby-user-area-min-height: 0px;
  --online-lobby-user-grid-gap: 8px;
  --online-lobby-user-card-min-height: 0px;
  --online-lobby-user-card-padding-block: 10px;
  --online-lobby-user-card-padding-inline: 12px;
  --online-lobby-user-select-height: 38px;
  display: grid;
  gap: var(--online-lobby-content-gap);
  min-height: 0;
  color: #fff8ea;
}

.content-grid {
  display: grid;
  grid-template-columns: var(--online-lobby-left-column-width, 340px) minmax(0, 1fr);
  gap: var(--online-lobby-column-gap);
  min-height: 0;
  align-items: start;
}

.left-column,
.right-column {
  display: grid;
  gap: var(--online-lobby-stack-gap);
  min-height: 0;
  align-self: start;
  margin-top: var(--online-lobby-column-offset);
}

.user-area {
  display: grid;
  gap: var(--online-lobby-user-area-gap);
  padding: 0;
  margin-top: var(--online-lobby-user-area-offset);
  min-height: var(--online-lobby-user-area-min-height);
}

.user-head {
  display: grid;
  gap: 2px;
}

.mini-label {
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #ffe892;
  text-shadow:
    0 0 14px rgba(255, 232, 146, 0.34),
    0 2px 10px rgba(0, 0, 0, 0.10);
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #fff7d2;
  text-shadow:
    0 4px 16px rgba(0, 0, 0, 0.12),
    0 0 12px rgba(255, 247, 210, 0.14);
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--online-lobby-user-grid-gap);
  align-items: stretch;
}

.user-card {
  display: grid;
  gap: 6px;
  min-width: 0;
  min-height: var(--online-lobby-user-card-min-height);
  padding:
    var(--online-lobby-user-card-padding-block)
    var(--online-lobby-user-card-padding-inline);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.20);
  border: 1px solid rgba(255, 247, 221, 0.28);
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 6px 18px rgba(0, 0, 0, 0.06);
}

.user-select-card {
  align-content: center;
}

.card-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(255, 246, 220, 0.94);
}

.card-value {
  display: flex;
  align-items: center;
  min-height: 34px;
  color: #fffaf0;
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-select,
.character-select {
  width: 100%;
  min-width: 0;
  height: var(--online-lobby-user-select-height);
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 244, 214, 0.30);
  background: rgba(106, 125, 167, 0.42);
  color: #fffaf0;
  font-size: 14px;
  font-weight: 800;
  outline: none;
}

.user-select:disabled,
.character-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-hint {
  margin: 0;
  color: #fff2c9;
  font-size: 12px;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.10);
}

</style>
