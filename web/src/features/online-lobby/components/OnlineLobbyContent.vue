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

async function handleHeaderUserChange(value: string) {
  updateSelectedLobbyUserId(value);

  if (!value) return;
  await applySelectedLobbyUser();
}
</script>

<template>
  <div class="online-lobby-content">
    <OnlineLobbyHero
      :user-name="userName"
      :selected-character="selectedCharacter"
      :users="users"
      :selected-lobby-user-id="selectedLobbyUserId"
      :can-change-lobby-user="canChangeLobbyUser"
      :is-member="isMember"
      @change-user="handleHeaderUserChange"
    />

    <div class="content-grid">
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
  gap: 12px;
  min-height: 0;
  color: #eef5ff;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  align-items: start;
}
.online-lobby-content {
  gap: 16px;
  color: #fff5d6;
  justify-items: center;
}

.content-grid {
  width: min(100%, 1040px);
  gap: 16px;
}

.right-column {
  width: 100%;
}

@media (max-width: 980px) {
  .online-lobby-content {
    justify-items: stretch;
  }

  .content-grid {
    width: 100%;
  }
}
.right-column {
  display: grid;
  gap: 14px;
  min-height: 0;
  align-self: start;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>