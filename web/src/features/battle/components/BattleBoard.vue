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
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
}

.board-stage {
  position: relative;
  width: min(100%, 560px);
  margin: 0 auto;
  aspect-ratio: 3 / 4;

  /* 盤面画像の「マス部分」に合わせて必要なら調整 */
  --board-pad-x: 9%;
  --board-pad-y: 8%;
}

.board-image {
  position: absolute;
  inset: 0;
  border-radius: 28px;
  background-image: url("/battle/board.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.35));
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
  border-radius: 18px;
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
    inset 0 0 0 3px rgba(142, 197, 255, 0.95),
    0 0 16px rgba(142, 197, 255, 0.28);
}

.cell.movable:not(.empty) {
  box-shadow:
    inset 0 0 0 2px rgba(255, 232, 132, 0.7),
    0 0 14px rgba(255, 232, 132, 0.2);
}

.move-marker {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 232, 132, 0.92);
  box-shadow:
    0 0 12px rgba(255, 232, 132, 0.55),
    inset 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.piece-token {
  position: relative;
  width: 78%;
  height: 78%;
  border-radius: 18px;
  display: grid;
  place-items: center;
  padding: 12px 8px;
  text-align: center;
  color: #f7fbff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.04)),
    rgba(16, 29, 51, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 12px 22px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.cell.own .piece-token {
  box-shadow:
    0 12px 22px rgba(0, 0, 0, 0.28),
    inset 0 0 0 2px rgba(118, 225, 178, 0.34);
}

.cell.enemy .piece-token {
  box-shadow:
    0 12px 22px rgba(0, 0, 0, 0.28),
    inset 0 0 0 2px rgba(255, 137, 137, 0.26);
}

.owner-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 14, 28, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.piece-text {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.25;
  word-break: break-word;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
}

@media (max-width: 640px) {
  .board-card {
    padding: 12px;
  }

  .board-stage {
    width: min(100%, 92vw);
    --board-pad-x: 9.5%;
    --board-pad-y: 8.5%;
  }

  .piece-token {
    width: 82%;
    height: 82%;
    padding: 10px 6px;
    border-radius: 14px;
  }

  .piece-text {
    font-size: 13px;
  }

  .owner-badge {
    top: 6px;
    left: 6px;
    min-width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .move-marker {
    width: 14px;
    height: 14px;
  }
}
</style>