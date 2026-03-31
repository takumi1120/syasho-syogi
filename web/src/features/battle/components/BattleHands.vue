<script setup lang="ts">
import type { SyahoShogiHandPieceType } from "../../../lib/syahosyogi";

type BattleHandPieceView = {
  pieceType: SyahoShogiHandPieceType;
  label: string;
  imageSrc: string;
  count: number;
  active: boolean;
  disabled: boolean;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    pieces?: BattleHandPieceView[];
    selectable?: boolean;
    showHint?: boolean;
  }>(),
  {
    title: "持ち駒",
    pieces: () => [],
    selectable: true,
    showHint: false,
  },
);

const emit = defineEmits<{
  (e: "select", pieceType: SyahoShogiHandPieceType): void;
}>();

function handlePieceClick(piece: BattleHandPieceView) {
  if (!props.selectable || piece.disabled) return;
  emit("select", piece.pieceType);
}
</script>

<template>
  <section class="hands-root panel">
    <h3 class="hand-title">{{ title }}</h3>

    <div class="hand-list">
      <component
        :is="selectable ? 'button' : 'div'"
        v-for="piece in pieces"
        :key="piece.pieceType"
        class="hand-chip"
        :class="{
          active: selectable && piece.active,
          disabled: piece.count <= 0,
          readonly: !selectable,
        }"
        v-bind="selectable ? { type: 'button', disabled: piece.disabled } : {}"
        @click="handlePieceClick(piece)"
      >
        <img
          class="hand-image"
          :class="{ active: selectable && piece.active }"
          :src="piece.imageSrc"
          :alt="piece.label"
          draggable="false"
        />
        <strong
          class="count"
          :class="{ active: selectable && piece.active }"
        >
          ×{{ piece.count }}
        </strong>
      </component>
    </div>

    <p v-if="showHint" class="hint">
      持ち駒を選んでから空きマスを押します
    </p>
  </section>
</template>

<style scoped>
.hands-root {
  color: #eef5ff;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

.hand-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
}

.hand-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hand-chip {
  min-width: 0;
  display: grid;
  gap: 6px;
  justify-items: center;
  align-items: center;
  border-radius: 16px;
  border: none;
  background: transparent;
  box-shadow: none;
  color: #eef5ff;
  padding: 6px 4px;
  cursor: pointer;
  font-weight: 700;
  text-align: center;
  transition:
    transform 0.16s ease,
    filter 0.16s ease,
    opacity 0.16s ease;
}

.hand-chip:hover {
  transform: translateY(-1px);
}

.hand-chip.readonly {
  cursor: default;
}

.hand-chip.disabled,
.hand-chip:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.hand-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.24));
  transition:
    transform 0.16s ease,
    filter 0.16s ease;
}

.hand-image.active {
  transform: scale(1.06);
  filter:
    drop-shadow(0 0 8px rgba(255, 239, 150, 0.9))
    drop-shadow(0 0 18px rgba(147, 216, 255, 0.75))
    drop-shadow(0 8px 14px rgba(0, 0, 0, 0.28));
}

.count {
  font-size: 14px;
  line-height: 1;
  transition:
    color 0.16s ease,
    text-shadow 0.16s ease,
    transform 0.16s ease;
}

.count.active {
  color: #fff6b8;
  text-shadow:
    0 0 8px rgba(255, 240, 150, 0.95),
    0 0 16px rgba(147, 216, 255, 0.6);
  transform: scale(1.06);
}

.hint {
  margin: 10px 0 0;
  color: #bcd4ef;
  line-height: 1.45;
  font-size: 12px;
}
</style>
