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

  updateSelectedLobbyUserId,
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
</script>

<template>
  <div class="online-lobby-content">
    <OnlineLobbyHero />

    <div class="content-grid">
      <div class="left-column">
        <section class="user-area">
          <div class="user-head">
            <p class="mini-label">LOBBY USER</p>
            <h2>ユーザー選択</h2>
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

            <div class="user-card">
              <span class="card-label">現在</span>
              <strong class="card-value">{{ userName || "未選択" }}</strong>
            </div>

            <div class="user-card">
              <span class="card-label">キャラクター</span>
              <strong class="card-value">{{ selectedCharacter || "未選択" }}</strong>
            </div>
          </div>

          <p v-if="isMember" class="switch-hint">
            部屋参加中はユーザー変更できません。先に退出してください。
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
  display: grid;
  gap: 10px;
  min-height: 0;
  color: #fff8ea;
}

.content-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 18px;
  min-height: 0;
  align-items: start;
}

.left-column,
.right-column {
  display: grid;
  gap: 14px;
  min-height: 0;
  align-self: start;
  margin-top: -30Spx;
}

.user-area {
  display: grid;
  gap: 10px;
  padding: 0;
  margin-top: -75px;
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
  grid-template-columns: minmax(0, 1.45fr) minmax(96px, 0.8fr) minmax(110px, 0.9fr);
  gap: 8px;
  align-items: stretch;
}

.user-card {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 10px 12px;
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

.user-select {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 244, 214, 0.30);
  background: rgba(106, 125, 167, 0.42);
  color: #fffaf0;
  font-size: 14px;
  font-weight: 800;
  outline: none;
}

.user-select:disabled {
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

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .user-area {
    margin-top: -8px;
  }

  .user-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .online-lobby-content {
    gap: 12px;
  }

  h2 {
    font-size: 18px;
  }

  .user-card {
    border-radius: 16px;
  }

  .card-value {
    min-height: auto;
    white-space: normal;
  }
}
</style>