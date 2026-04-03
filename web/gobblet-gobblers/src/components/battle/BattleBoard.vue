<script setup lang="ts">
import PieceCone from "./PieceCone.vue";
import type { Cell, Piece, PieceSize, Player } from "../../types/battle.types";
import boardImage from "../../assets/boards/battle-board.png";

const props = defineProps<{
  board: Cell[][];
  winner: Player | null;
  boardPieceAt: (index: number) => Piece | null;
  pieceSizeClass: (size: PieceSize) => string;
  isSelectedBoardPiece: (row: number, col: number) => boolean;
  isPlayableCell: (row: number, col: number) => boolean;
  isWinningCell: (row: number, col: number) => boolean;
  playerImage: (owner: Player) => string;
}>();

const emit = defineEmits<{
  cellClick: [row: number, col: number];
}>();

type CellPosition = {
  row: number;
  col: number;
  left: string;
  top: string;
};

const cellPositions: CellPosition[] = [
  { row: 0, col: 0, left: "27.4%", top: "26.5%" },
  { row: 0, col: 1, left: "50.3%", top: "26.2%" },
  { row: 0, col: 2, left: "72.5%", top: "26.5%" },

  { row: 1, col: 0, left: "27.4%", top: "45.9%" },
  { row: 1, col: 1, left: "50.3%", top: "45.9%" },
  { row: 1, col: 2, left: "72.5%", top: "45.9%" },

  { row: 2, col: 0, left: "27.4%", top: "65.3%" },
  { row: 2, col: 1, left: "50.3%", top: "65.3%" },
  { row: 2, col: 2, left: "72.5%", top: "65.3%" },
];

function boardIndex(row: number, col: number): number {
  return row * 3 + col;
}

function pieceAt(row: number, col: number): Piece | null {
  return props.boardPieceAt(boardIndex(row, col));
}

function cellStack(row: number, col: number): Cell {
  return props.board[row][col];
}
</script>

<template>
  <section class="board-shell">
    <div class="board-scene">
      <div class="board-frame">
        <img class="board-image" :src="boardImage" alt="battle board" />

        <button
          v-for="cell in cellPositions"
          :key="`${cell.row}-${cell.col}`"
          class="cell"
          :style="{ left: cell.left, top: cell.top }"
          :class="{
            selected: isSelectedBoardPiece(cell.row, cell.col),
            playable: isPlayableCell(cell.row, cell.col),
            winning: isWinningCell(cell.row, cell.col),
          }"
          @click="emit('cellClick', cell.row, cell.col)"
        >
          <div class="cell-inner">
            <span class="cell-glow"></span>
            <span class="cell-ring"></span>

            <template v-if="pieceAt(cell.row, cell.col)">
              <div class="board-piece-anchor">
                <div
                  class="board-piece"
                  :class="pieceSizeClass(pieceAt(cell.row, cell.col)!.size)"
                >
                  <PieceCone
                    :size="pieceAt(cell.row, cell.col)!.size"
                    :owner="pieceAt(cell.row, cell.col)!.owner"
                    :image="playerImage(pieceAt(cell.row, cell.col)!.owner)"
                    placement="board"
                    :selected="isSelectedBoardPiece(cell.row, cell.col)"
                  />
                </div>
              </div>
            </template>

            <span class="stack-count" v-if="cellStack(cell.row, cell.col).length > 1">
              {{ cellStack(cell.row, cell.col).length }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-scene {
  width: min(100%, var(--battle-board-size, 1200px));
  max-width: var(--battle-board-size, 1200px);
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.board-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0;
  overflow: visible;
}

.board-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.cell {
  position: absolute;
  width: 21%;
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%);
  border: 0;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.12s ease;
}

.cell:hover {
  transform: translate(-50%, calc(-50% - 2px));
}

.cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.cell-glow {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.18s ease;
  background: radial-gradient(circle, rgba(255, 220, 133, 0.22), transparent 62%);
}

.cell-ring {
  position: absolute;
  inset: 14%;
  border-radius: 50%;
  border: 2px solid rgba(255, 227, 173, 0.22);
  opacity: 0;
  transition:
    opacity 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.cell.playable .cell-glow {
  opacity: 1;
}

.cell.playable .cell-ring {
  opacity: 1;
  border-color: rgba(103, 214, 255, 0.42);
  box-shadow: 0 0 18px rgba(103, 214, 255, 0.2);
}

.cell.selected .cell-ring {
  opacity: 1;
  border-color: rgba(255, 216, 107, 0.88);
  box-shadow:
    0 0 0 3px rgba(255, 216, 107, 0.16),
    0 0 22px rgba(255, 216, 107, 0.32);
}

.cell.winning .cell-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(89, 214, 118, 0.22), transparent 62%);
}

.cell.winning .cell-ring {
  opacity: 1;
  border-color: rgba(89, 214, 118, 0.9);
  box-shadow:
    0 0 0 4px rgba(89, 214, 118, 0.16),
    0 0 24px rgba(89, 214, 118, 0.34);
}

.board-piece-anchor {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(0, calc(var(--battle-piece-size-s, 56px) * -0.07));
}

.board-piece {
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-piece.piece-s {
  transform:
    translate(
      calc(var(--battle-piece-size-s, 56px) * -0.09),
      calc(var(--battle-piece-size-s, 56px) * -0.09)
    )
    scale(0.92);
}

.board-piece.piece-m {
  transform: translate(0, calc(var(--battle-piece-size-m, 76px) * -0.03)) scale(1);
}

.board-piece.piece-l {
  transform: translate(0, calc(var(--battle-piece-size-l, 96px) * -0.125)) scale(1.08);
}

.stack-count {
  position: absolute;
  right: 6px;
  bottom: 4px;
  min-width: var(--battle-stack-size, 24px);
  height: var(--battle-stack-size, 24px);
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(56, 34, 18, 0.82);
  color: #ffe2a8;
  font-size: var(--battle-stack-font-size, 13px);
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1240px) {
  .board-scene {
    width: min(100%, var(--battle-board-size, 520px));
    max-width: var(--battle-board-size, 520px);
  }
}

@media (max-width: 980px) {
  .board-scene {
    width: min(100%, var(--battle-board-size, 420px));
    max-width: var(--battle-board-size, 420px);
  }

  .stack-count {
    right: 2px;
    bottom: 2px;
    padding: 0 4px;
  }
}

@media (max-width: 420px) {
  .cell {
    width: 22.5%;
  }
}

</style>
