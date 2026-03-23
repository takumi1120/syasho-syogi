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
        <span>{{ piece.label }}</span>
        <strong>×{{ piece.count }}</strong>
      </button>
    </div>

    <p class="hint">
      自分の持ち駒を選んでから、空きマスをクリックしてください。
    </p>
  </section>
</template>

<style scoped>
.panel {
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

h3 {
  margin: 0 0 12px;
}

.hand-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hand-chip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(160, 205, 255, 0.22);
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
}

.hand-chip.active {
  outline: 2px solid #8ec5ff;
  background: rgba(45, 86, 145, 0.9);
}

.hand-chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hint {
  margin: 12px 0 0;
  color: #bcd4ef;
  line-height: 1.6;
  font-size: 14px;
}
</style>