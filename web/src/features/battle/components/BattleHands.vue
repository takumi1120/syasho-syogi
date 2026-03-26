<script setup lang="ts">
import type { SyahoShogiHandPieceType } from "../../../lib/syahosyogi";

type BattleHandPieceView = {
  pieceType: SyahoShogiHandPieceType;
  label: string;
  count: number;
  active: boolean;
  disabled: boolean;
};

withDefaults(
  defineProps<{
    title?: string;
    pieces?: BattleHandPieceView[];
  }>(),
  {
    title: "持ち駒",
    pieces: () => [],
  },
);

const emit = defineEmits<{
  (e: "select", pieceType: SyahoShogiHandPieceType): void;
}>();
</script>

<template>
  <section class="panel">
    <h3>{{ title }}</h3>

    <div class="hand-list">
      <button
        v-for="piece in pieces"
        :key="piece.pieceType"
        class="hand-chip"
        :class="{ active: piece.active }"
        :disabled="piece.disabled"
        type="button"
        @click="emit('select', piece.pieceType)"
      >
        <span class="label">{{ piece.label }}</span>
        <strong class="count">×{{ piece.count }}</strong>
      </button>
    </div>

    <p class="hint">
      持ち駒を選んでから空きマスを押します
    </p>
  </section>
</template>

<style scoped>
.panel {
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.hand-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hand-chip {
  min-width: 0;
  display: grid;
  gap: 4px;
  justify-items: center;
  align-items: center;
  border-radius: 16px;
  border: 1px solid rgba(160, 205, 255, 0.22);
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
  padding: 10px 6px;
  cursor: pointer;
  font-weight: 700;
  text-align: center;
}

.hand-chip.active {
  outline: 2px solid #8ec5ff;
  background: rgba(45, 86, 145, 0.9);
}

.hand-chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.label {
  font-size: 11px;
  line-height: 1.2;
  word-break: break-word;
}

.count {
  font-size: 14px;
  line-height: 1;
}

.hint {
  margin: 10px 0 0;
  color: #bcd4ef;
  line-height: 1.45;
  font-size: 12px;
}
</style>