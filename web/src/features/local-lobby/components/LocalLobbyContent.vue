<script setup lang="ts">
import LocalLobbyHero from "./LocalLobbyHero.vue";
import LocalPlayersPanel from "./LocalPlayersPanel.vue";
import LocalLobbyGuidePanel from "./LocalLobbyGuidePanel.vue";
import { useLocalLobby } from "../composables/useLocalLobby";

const {
  player1Name,
  player2Name,
  player1Character,
  player2Character,
  enableNameValidation,

  trimmedPlayer1Name,
  trimmedPlayer2Name,
  trimmedPlayer1Character,
  trimmedPlayer2Character,
  canStart,

  swapPlayers,
  clearInputs,
  startLocalBattle,
} = useLocalLobby();

function updatePlayer1Name(value: string) {
  player1Name.value = value;
}

function updatePlayer2Name(value: string) {
  player2Name.value = value;
}

function updatePlayer1Character(value: string) {
  player1Character.value = value;
}

function updatePlayer2Character(value: string) {
  player2Character.value = value;
}
</script>

<template>
  <div class="local-lobby-content">
    <LocalLobbyHero
      :player1-name="trimmedPlayer1Name"
      :player2-name="trimmedPlayer2Name"
      :player1-character="trimmedPlayer1Character"
      :player2-character="trimmedPlayer2Character"
    />

    <div class="content-grid">
      <LocalPlayersPanel
        :player1-name="player1Name"
        :player2-name="player2Name"
        :player1-character="player1Character"
        :player2-character="player2Character"
        :enable-name-validation="enableNameValidation"
        :trimmed-player1-name="trimmedPlayer1Name"
        :trimmed-player2-name="trimmedPlayer2Name"
        @update:player1-name="updatePlayer1Name"
        @update:player2-name="updatePlayer2Name"
        @update:player1-character="updatePlayer1Character"
        @update:player2-character="updatePlayer2Character"
        @swap="swapPlayers"
      />

      <LocalLobbyGuidePanel
        :player1-name="trimmedPlayer1Name"
        :player2-name="trimmedPlayer2Name"
        :player1-character="trimmedPlayer1Character"
        :player2-character="trimmedPlayer2Character"
        :can-start="canStart"
        @start="startLocalBattle"
        @reset="clearInputs"
      />
    </div>
  </div>
</template>

<style scoped>
.local-lobby-content {
  display: grid;
  gap: 20px;
  color: #fff5e8;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 20px;
}

@media (max-width: 920px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>