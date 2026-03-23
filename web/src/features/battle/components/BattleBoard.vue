<script setup lang="ts">
import { getPieceLabel } from "../utils/battleLabels";
import type {
  SyahoShogiBoard,
  SyahoShogiCell,
  SyahoShogiPlayer,
  SyahoShogiSquare,
} from "../../../lib/syahosyogi";

const props = defineProps<{
  board: SyahoShogiBoard;
  selectedSquare: SyahoShogiSquare | null;
  activePlayer: SyahoShogiPlayer;
}>();

const emit = defineEmits<{
  (e: "cell-click", row: number, col: number): void;
}>();

function isSelected(row: number, col: number) {
  return (
    props.selectedSquare?.row === row &&
    props.selectedSquare?.col === col
  );
}

function pieceLabel(cell: SyahoShogiCell) {
  return cell ? getPieceLabel(cell) : "";
}
</script>

<template>
  <section class="board-card">
    <div class="board">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <button
          v-for="(cell, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          class="cell"
          :class="{
            selected: isSelected(rowIndex, colIndex),
            own: cell && cell.owner === activePlayer,
            enemy: cell && cell.owner !== activePlayer,
            empty: !cell,
          }"
          type="button"
          @click="emit('cell-click', rowIndex, colIndex)"
        >
          <template v-if="cell">
            <span class="owner-badge">{{ cell.owner === 1 ? "先" : "後" }}</span>
            <span class="piece-text">{{ pieceLabel(cell) }}</span>
          </template>

          <template v-else>
            <span class="empty-dot">+</span>
          </template>
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.board-card {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(88px, 1fr));
  gap: 12px;
}

.cell {
  position: relative;
  min-height: 122px;
  border-radius: 22px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(16, 29, 51, 0.95);
  color: #eef5ff;
  padding: 16px 10px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.cell.selected {
  outline: 3px solid #8ec5ff;
}

.cell.own {
  box-shadow: inset 0 0 0 1px rgba(118, 225, 178, 0.34);
}

.cell.enemy {
  box-shadow: inset 0 0 0 1px rgba(255, 137, 137, 0.28);
}

.owner-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(142, 197, 255, 0.16);
  font-size: 12px;
  font-weight: 700;
}

.piece-text {
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}

.empty-dot {
  font-size: 24px;
  opacity: 0.35;
}

@media (max-width: 640px) {
  .cell {
    min-height: 96px;
  }

  .piece-text {
    font-size: 15px;
  }
}
</style>