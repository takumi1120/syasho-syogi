<script setup lang="ts">
defineProps<{
  player1Name: string;
  player2Name: string;
  player1Character: string;
  player2Character: string;
  enableNameValidation: boolean;
  trimmedPlayer1Name: string;
  trimmedPlayer2Name: string;
}>();

const emit = defineEmits<{
  (e: "update:player1Name", value: string): void;
  (e: "update:player2Name", value: string): void;
  (e: "update:player1Character", value: string): void;
  (e: "update:player2Character", value: string): void;
  (e: "swap"): void;
}>();
</script>

<template>
  <section class="players-panel">
    <div class="panel-head">
      <div class="title-wrap">
        <p class="mini-label">LOCAL PLAYERS</p>
        <h2>プレイヤー設定</h2>
      </div>

      <button class="swap-button" type="button" @click="emit('swap')">
        左右入れ替え
      </button>
    </div>

    <div class="players-grid">
      <article class="player-card">
        <div class="player-topline">
          <span class="player-badge">P1</span>
          <strong class="player-title">プレイヤー1</strong>
        </div>

        <label class="field-label" for="p1-name">名前</label>
        <input
          id="p1-name"
          class="text-input"
          type="text"
          maxlength="20"
          placeholder="プレイヤー1の名前"
          :value="player1Name"
          @input="emit('update:player1Name', ($event.target as HTMLInputElement).value)"
        />

        <p v-if="enableNameValidation && trimmedPlayer1Name.length === 0" class="field-error">
          プレイヤー1の名前を入力してください
        </p>

        <label class="field-label" for="p1-character">キャラクター</label>
        <input
          id="p1-character"
          class="text-input"
          type="text"
          maxlength="30"
          placeholder="未入力でもOK"
          :value="player1Character"
          @input="emit('update:player1Character', ($event.target as HTMLInputElement).value)"
        />
      </article>

      <article class="player-card">
        <div class="player-topline">
          <span class="player-badge alt">P2</span>
          <strong class="player-title">プレイヤー2</strong>
        </div>

        <label class="field-label" for="p2-name">名前</label>
        <input
          id="p2-name"
          class="text-input"
          type="text"
          maxlength="20"
          placeholder="プレイヤー2の名前"
          :value="player2Name"
          @input="emit('update:player2Name', ($event.target as HTMLInputElement).value)"
        />

        <p v-if="enableNameValidation && trimmedPlayer2Name.length === 0" class="field-error">
          プレイヤー2の名前を入力してください
        </p>

        <label class="field-label" for="p2-character">キャラクター</label>
        <input
          id="p2-character"
          class="text-input"
          type="text"
          maxlength="30"
          placeholder="未入力でもOK"
          :value="player2Character"
          @input="emit('update:player2Character', ($event.target as HTMLInputElement).value)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.players-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title-wrap {
  min-width: 0;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 10px;
  font-weight: 900;
  color: #ffe27a;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.48),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

h2 {
  margin: 2px 0 0;
  font-size: 20px;
  color: #fff2a8;
  text-shadow:
    0 1px 0 rgba(96, 60, 0, 0.52),
    0 4px 14px rgba(0, 0, 0, 0.22);
}

.swap-button {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 247, 221, 0.5);
  background: linear-gradient(180deg, rgba(145, 227, 255, 0.82) 0%, rgba(196, 161, 255, 0.74) 100%);
  color: #3a2b16;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.player-card {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 247, 221, 0.14);
  backdrop-filter: blur(5px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 6px 18px rgba(0, 0, 0, 0.06);
}

.player-topline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 208, 120, 0.16);
  border: 1px solid rgba(255, 245, 214, 0.18);
  color: #fff2c1;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.player-badge.alt {
  background: rgba(138, 202, 255, 0.16);
  color: #eef8ff;
}

.player-title {
  color: #fff7d6;
  font-size: 15px;
  font-weight: 900;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.38),
    0 3px 10px rgba(0, 0, 0, 0.16);
}

.field-label {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ffd96a;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.text-input {
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 244, 214, 0.16);
  background: rgba(22, 34, 64, 0.28);
  color: #fff4cf;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  box-sizing: border-box;
  text-shadow: none;
}

.text-input::placeholder {
  color: rgba(255, 232, 166, 0.78);
}

.text-input:focus {
  border-color: rgba(255, 238, 196, 0.28);
  background: rgba(22, 34, 64, 0.34);
}

.field-error {
  margin: -2px 0 0;
  color: #ffe0c4;
  font-size: 12px;
  line-height: 1.5;
  text-shadow:
    0 1px 0 rgba(92, 28, 38, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

@media (max-width: 980px) {
  .players-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .swap-button {
    width: 100%;
  }
}
</style>