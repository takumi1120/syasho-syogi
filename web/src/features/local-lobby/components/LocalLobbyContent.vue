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

  characterOptions,

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
    <LocalLobbyHero />

    <div class="content-grid">
      <div class="left-column">
        <LocalPlayersPanel
          :player1-name="player1Name"
          :player2-name="player2Name"
          :player1-character="player1Character"
          :player2-character="player2Character"
          :enable-name-validation="enableNameValidation"
          :trimmed-player1-name="trimmedPlayer1Name"
          :trimmed-player2-name="trimmedPlayer2Name"
          :character-options="characterOptions"
          @update:player1-name="updatePlayer1Name"
          @update:player2-name="updatePlayer2Name"
          @update:player1-character="updatePlayer1Character"
          @update:player2-character="updatePlayer2Character"
          @swap="swapPlayers"
        />
      </div>

      <div class="right-column">
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
  </div>
</template>

<style scoped>
.local-lobby-content {
  display: grid;
  gap: 10px;
  min-height: 0;
  color: #fff8ea;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 336px;
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
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .local-lobby-content {
    gap: 12px;
  }
}
@media (max-width: 430px) {
  .local-lobby-content {
    gap: 10px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .left-column,
  .right-column {
    gap: 12px;
  }
}
</style>