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
                <span class="piece-text">
                  {{ pieceLabel(cell) }}
                </span>
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
}

.board-image {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background-image: url("/battle/board.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
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
  width: 82%;
  height: 82%;
  border-radius: 14px;
  display: grid;
  place-items: center;
  padding: 8px 5px;
  text-align: center;
  color: #f7fbff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.03)),
    rgba(16, 29, 51, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.cell.own .piece-token {
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.24),
    inset 0 0 0 2px rgba(118, 225, 178, 0.3);
}

.cell.enemy .piece-token {
  box-shadow:
    0 8px 14px rgba(0, 0, 0, 0.24),
    inset 0 0 0 2px rgba(255, 137, 137, 0.24);
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
  background: rgba(8, 14, 28, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.piece-text {
  font-size: 13px;
  font-weight: 900;
  line-height: 1.15;
  word-break: break-word;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

@media (max-width: 980px) {
  .board-card {
    height: auto;
  }

  .board-stage {
    width: min(100%, 320px);
  }
}

@media (max-width: 640px) {
  .board-card {
    padding: 8px;
  }

  .board-stage {
    width: min(100%, 82vw);
    --board-pad-x: 9.5%;
    --board-pad-y: 8.5%;
  }

  .piece-text {
    font-size: 12px;
  }
}
</style>