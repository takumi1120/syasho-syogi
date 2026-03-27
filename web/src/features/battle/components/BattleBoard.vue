<script setup lang="ts">
import { getPieceLabel } from "../utils/battleLabels";
import { getPieceImageSrc } from "../utils/pieceImages";
import type {
  SyahoShogiBoard,
  SyahoShogiCell,
  SyahoShogiPlayer,
  SyahoShogiSquare,
} from "../../../lib/syahosyogi";

const props = defineProps<{
  board: SyahoShogiBoard;
  selectedSquare: SyahoShogiSquare | null;
  legalTargets: SyahoShogiSquare[];
  activePlayer: SyahoShogiPlayer;
}>();

const emit = defineEmits<{
  (e: "cell-click", row: number, col: number): void;
}>();

function isSelected(row: number, col: number) {
  return props.selectedSquare?.row === row && props.selectedSquare?.col === col;
}

function isLegalTarget(row: number, col: number) {
  return props.legalTargets.some(
    (square) => square.row === row && square.col === col,
  );
}

function pieceLabel(cell: SyahoShogiCell) {
  return cell ? getPieceLabel(cell) : "";
}

function pieceImageSrc(cell: SyahoShogiCell) {
  return cell ? getPieceImageSrc(cell) : "";
}
</script>

<template>
  <section class="board-card">
    <div class="board-stage">
      <div class="board-image" aria-hidden="true" />

      <div class="board-grid">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <button
            v-for="(cell, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            class="cell"
            :class="{
              selected: isSelected(rowIndex, colIndex),
              movable: isLegalTarget(rowIndex, colIndex),
              own: cell && cell.owner === activePlayer,
              enemy: cell && cell.owner !== activePlayer,
              empty: !cell,
            }"
            type="button"
            @click="emit('cell-click', rowIndex, colIndex)"
          >
            <span
              v-if="isLegalTarget(rowIndex, colIndex) && !cell"
              class="move-marker"
            />

            <template v-if="cell">
              <div class="piece-token">
                <span class="owner-badge">
                  {{ cell.owner === 1 ? "先" : "後" }}
                </span>

                <img
                  class="piece-image"
                  :class="{ reverse: cell.owner === 2 }"
                  :src="pieceImageSrc(cell)"
                  :alt="pieceLabel(cell)"
                  draggable="false"
                />
              </div>
            </template>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-card {
  height: 100%;
  min-height: 0;
  padding: 8px;
  border-radius: 18px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.24);
  display: grid;
  place-items: center;
}

.board-stage {
  position: relative;
  width: min(100%, 340px);
  margin: 0 auto;
  aspect-ratio: 3 / 4;
  --board-pad-x: 9%;
  --board-pad-y: 8%;
  overflow: visible;
}

.board-image {
  position: absolute;
  inset: -34px -70px;
  border-radius: 22px;
  background-image: url("/battle/board.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
  pointer-events: none;
}

.board-grid {
  position: absolute;
  inset: var(--board-pad-y) var(--board-pad-x);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2.2%;
}

.cell {
  position: relative;
  border: none;
  background: transparent;
  border-radius: 14px;
  cursor: pointer;
  padding: 0;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background-color 0.12s ease;
}

.cell:hover {
  background: rgba(255, 255, 255, 0.05);
}

.cell.selected {
  box-shadow:
    inset 0 0 0 2px rgba(142, 197, 255, 0.95),
    0 0 12px rgba(142, 197, 255, 0.24);
}

.cell.movable:not(.empty) {
  box-shadow:
    inset 0 0 0 2px rgba(255, 232, 132, 0.7),
    0 0 10px rgba(255, 232, 132, 0.18);
}

.move-marker {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 232, 132, 0.92);
  box-shadow:
    0 0 10px rgba(255, 232, 132, 0.5),
    inset 0 0 0 2px rgba(255, 255, 255, 0.45);
}

.piece-token {
  position: relative;
  width: 86%;
  height: 86%;
  border-radius: 14px;
  display: grid;
  place-items: center;
  padding: 6px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.02)
    ),
    rgba(16, 29, 51, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.cell.own .piece-token {
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.2),
    inset 0 0 0 2px rgba(118, 225, 178, 0.22);
}

.cell.enemy .piece-token {
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.2),
    inset 0 0 0 2px rgba(255, 137, 137, 0.18);
}

.owner-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 14, 28, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f7fbff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  z-index: 2;
}

.piece-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.28));
}

.piece-image.reverse {
  transform: rotate(180deg);
}
</style>