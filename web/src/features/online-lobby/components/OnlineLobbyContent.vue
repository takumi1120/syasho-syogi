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

  userId,
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

  copyRoomCode,
  handleCreateRoom,
  handleJoinRoom,
  handleSearchRoom,
  handleToggleReady,
  handleStartGame,
  handleLeaveRoom,
} = useOnlineLobby();

function updateRoomCodeInput(value: string) {
  roomCodeInput.value = value;
}
</script>

<template>
  <div class="online-lobby-content">
    <OnlineLobbyHero
      :user-name="userName"
      :user-id="userId"
      :selected-character="selectedCharacter"
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
        @search="handleSearchRoom"
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
  gap: 20px;
  color: #eef5ff;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 20px;
}

.right-column {
  display: grid;
  gap: 20px;
  align-self: start;
}

@media (max-width: 920px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>