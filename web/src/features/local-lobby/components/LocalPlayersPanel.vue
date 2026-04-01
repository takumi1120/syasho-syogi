<script setup lang="ts">
import { computed } from "vue";

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

const trimmedPlayer1Character = computed(() => props.player1Character.trim());
const trimmedPlayer2Character = computed(() => props.player2Character.trim());
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
          class="text-input select-input"
          :value="player1Character"
          @change="emit('update:player1Character', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="option in characterOptions"
            :key="`p1-${option.value || 'empty'}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <p
          v-if="enableNameValidation && trimmedPlayer1Character.length === 0"
          class="field-error"
        >
          プレイヤー1のキャラクターを選択してください
        </p>
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
          class="text-input select-input"
          :value="player2Character"
          @change="emit('update:player2Character', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="option in characterOptions"
            :key="`p2-${option.value || 'empty'}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <p
          v-if="enableNameValidation && trimmedPlayer2Character.length === 0"
          class="field-error"
        >
          プレイヤー2のキャラクターを選択してください
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.players-panel {
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: 22px 24px 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(130, 208, 255, 0.24), rgba(51, 110, 188, 0.2));
  border: 1px solid rgba(255, 247, 221, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 14px 28px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  font-size: 28px;
  color: #fff2a8;
  text-shadow:
    0 1px 0 rgba(96, 60, 0, 0.52),
    0 4px 14px rgba(0, 0, 0, 0.22);
}

.swap-button {
  min-height: 42px;
  padding: 0 18px;
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
  grid-template-columns: 1fr;
  gap: 18px;
}

.player-card {
  display: grid;
  gap: 10px;
  min-width: 0;
  min-height: 198px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 247, 221, 0.18);
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 20px rgba(0, 0, 0, 0.08);
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
  font-size: 18px;
  font-weight: 900;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.38),
    0 3px 10px rgba(0, 0, 0, 0.16);
}

.field-label {
  margin-top: 2px;
  font-size: 12px;
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
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 244, 214, 0.16);
  background: rgba(22, 34, 64, 0.28);
  color: #fff4cf;
  font-size: 15px;
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

.select-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

.select-input option {
  color: #10233f;
  background: #f5f8ff;
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

</style>
