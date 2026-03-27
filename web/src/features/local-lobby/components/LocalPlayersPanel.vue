<script setup lang="ts">
const props = defineProps<{
  player1Name: string;
  player2Name: string;
  player1Character: string;
  player2Character: string;
  enableNameValidation: boolean;
  trimmedPlayer1Name: string;
  trimmedPlayer2Name: string;
  characterOptions: ReadonlyArray<{
    label: string;
    value: string;
  }>;
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
        <select
          id="p1-character"
          class="select-input"
          :value="player1Character"
          @change="emit('update:player1Character', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="option in props.characterOptions"
            :key="`p1-${option.value || 'empty'}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
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
        <select
          id="p2-character"
          class="select-input"
          :value="player2Character"
          @change="emit('update:player2Character', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="option in props.characterOptions"
            :key="`p2-${option.value || 'empty'}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
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
  color: #fff0b8;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.12);
}

.text-input,
.select-input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 247, 221, 0.30);
  background: rgba(38, 52, 84, 0.78);
  color: #fff7dc;
  font-size: 14px;
  font-weight: 700;
  outline: none;
  box-sizing: border-box;
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.10);
}

.text-input::placeholder {
  color: rgba(255, 240, 204, 0.70);
}

.select-input {
  appearance: none;
  cursor: pointer;
  background:
    linear-gradient(180deg, rgba(54, 72, 110, 0.92) 0%, rgba(35, 49, 80, 0.92) 100%);
  color: #fff4c8;
  text-shadow:
    0 1px 0 rgba(72, 42, 0, 0.28),
    0 2px 6px rgba(0, 0, 0, 0.12);
}

.select-input:focus,
.text-input:focus {
  border-color: rgba(255, 224, 128, 0.72);
  box-shadow:
    0 0 0 2px rgba(255, 224, 128, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.select-input option {
  color: #2f220a;
  background: #fff4d6;
}

.select-input:disabled,
.text-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  margin: -2px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: #ffd1da;
  text-shadow: 0 1px 0 rgba(88, 16, 36, 0.32);
}

@media (max-width: 820px) {
  .players-grid {
    grid-template-columns: 1fr;
  }
}
</style>