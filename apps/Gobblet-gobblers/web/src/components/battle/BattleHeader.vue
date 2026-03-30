<script setup lang="ts">
defineProps<{
  player1Name: string;
  player2Name: string;
  player1CharacterName: string;
  player2CharacterName: string;
  player1CharacterImage: string;
  player2CharacterImage: string;
}>();
</script>

<template>
  <div class="player-info-row">
    <div class="player-info-card">
      <img
        v-if="player1CharacterImage"
        :src="player1CharacterImage"
        :alt="player1CharacterName"
        class="battle-character-image"
      />
      <p class="player-name">P1 : {{ player1Name }}</p>
      <p class="character-name">{{ player1CharacterName }}</p>
    </div>

    <div class="player-info-card">
      <img
        v-if="player2CharacterImage"
        :src="player2CharacterImage"
        :alt="player2CharacterName"
        class="battle-character-image"
      />
      <p class="player-name">P2 : {{ player2Name }}</p>
      <p class="character-name">{{ player2CharacterName }}</p>
    </div>
  </div>
</template>

<style scoped>
.player-info-row {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  gap: var(--battle-header-gap, 20px);
  padding-inline: var(--battle-header-side-padding, 0);
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
}

.player-info-card {
  width: var(--battle-header-card-width, 180px);
  padding: var(--battle-header-card-padding-y, 12px) var(--battle-header-card-padding-x, 12px);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(40, 24, 12, 0.88), rgba(24, 14, 8, 0.82));
  border: 1px solid rgba(255, 204, 112, 0.38);
  color: #ffdc9a;
  text-align: center;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 232, 190, 0.08),
    0 0 14px rgba(255, 180, 80, 0.08);
}

.battle-character-image {
  width: var(--battle-header-image-size, 100px);
  height: var(--battle-header-image-size, 100px);
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 204, 112, 0.4);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28);
}

.player-name {
  margin: 0 0 6px;
  font-size: var(--battle-player-name-size, 16px);
  line-height: 1.2;
  font-weight: bold;
}

.character-name {
  margin: 0;
  font-size: var(--battle-character-name-size, 14px);
  line-height: 1.2;
  opacity: 0.92;
}

@media (max-width: 1240px) {
  .player-info-row {
    padding-inline: 0;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 960px) {
  .player-info-card {
    width: 150px;
  }

  .battle-character-image {
    width: 86px;
    height: 86px;
  }
}
</style>
