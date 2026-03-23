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
  <section class="panel players-panel">
    <div class="panel-head">
      <div>
        <p class="mini-label">PLAYERS</p>
        <h2>プレイヤー設定</h2>
      </div>

      <button class="swap-button" type="button" @click="emit('swap')">
        左右入れ替え
      </button>
    </div>

    <div class="players-grid">
      <article class="player-card p1">
        <div class="player-badge">P1</div>
        <h3>プレイヤー1</h3>

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

        <label class="field-label" for="p1-character">キャラクター名</label>
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

      <article class="player-card p2">
        <div class="player-badge">P2</div>
        <h3>プレイヤー2</h3>

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

        <label class="field-label" for="p2-character">キャラクター名</label>
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
.panel {
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 221, 166, 0.16);
  background: rgba(56, 34, 22, 0.72);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  color: #fff5e8;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #f2cb86;
}

h2 {
  margin: 10px 0 0;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.player-card {
  position: relative;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 221, 166, 0.14);
  background: rgba(255, 255, 255, 0.05);
}

.player-card h3 {
  margin: 8px 0 0;
  font-size: 24px;
}

.player-card.p1 {
  box-shadow: inset 0 0 0 1px rgba(255, 170, 102, 0.08);
}

.player-card.p2 {
  box-shadow: inset 0 0 0 1px rgba(255, 215, 130, 0.08);
}

.player-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 214, 137, 0.14);
  color: #ffe7bb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.field-label {
  display: inline-block;
  margin-top: 18px;
  margin-bottom: 10px;
  font-size: 13px;
  color: rgba(255, 243, 222, 0.88);
}

.text-input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 221, 166, 0.18);
  background: rgba(25, 14, 10, 0.72);
  color: #fff8ef;
  font-size: 16px;
  outline: none;
}

.text-input::placeholder {
  color: rgba(255, 226, 190, 0.34);
}

.field-error {
  margin: 8px 0 0;
  color: #ffcfbf;
  font-size: 13px;
}

.swap-button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 221, 166, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #fff2dc;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 920px) {
  .players-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 18px;
    border-radius: 20px;
  }

  .panel-head {
    flex-direction: column;
  }

  .swap-button {
    width: 100%;
  }
}
</style>