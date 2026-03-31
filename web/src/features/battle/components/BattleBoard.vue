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

/**
 * マス自体の位置調整
 * x: 左右, y: 上下
 */
const squareCellOffsetMap: Record<string, { x: number; y: number }> = {
  "0-0": { x: 0, y: 12 },
  "0-1": { x: 0, y: 12 },
  "0-2": { x: -3, y: 12 },

  "1-0": { x: 0, y: 4 },
  "1-1": { x: 0, y: 5 },
  "1-2": { x: -3, y: 5 },

  "2-0": { x: 0, y: 0 },
  "2-1": { x: 0, y: 0 },
  "2-2": { x: 0, y: 0 },

  "3-0": { x: 1, y: -17 },
  "3-1": { x: 0, y: -12 },
  "3-2": { x: -2, y: -13 },
};

/**
 * 通常駒の位置調整
 * x: 左右, y: 上下
 */
const squarePieceOffsetMap: Record<string, { x: number; y: number }> = {
  "0-0": { x: 0, y: 0 },
  "0-1": { x: 0, y: 0 },
  "0-2": { x: 0, y: 0 },

  "1-0": { x: 0, y: 0 },
  "1-1": { x: 0, y: 0 },
  "1-2": { x: 0, y: 0 },

  "2-0": { x: 0, y: 0 },
  "2-1": { x: 0, y: 1 },
  "2-2": { x: 0, y: 0 },

  "3-0": { x: 0, y: 0 },
  "3-1": { x: 0, y: 0 },
  "3-2": { x: 0, y: 0 },
};

/**
 * 成り駒(MIKURU)専用の位置調整
 */
const promotedPieceOffsetMap: Record<string, { x: number; y: number }> = {
  "0-0": { x: 0, y: 0 },
  "0-1": { x: 0, y: 0 },
  "0-2": { x: 0, y: 0 },

  "1-0": { x: 0, y: 0 },
  "1-1": { x: 0, y: 0 },
  "1-2": { x: 0, y: 0 },

  "2-0": { x: 0, y: 0 },
  "2-1": { x: 0, y: -3 },
  "2-2": { x: 0, y: 0 },

  "3-0": { x: 0, y: 0 },
  "3-1": { x: 0, y: -6 },
  "3-2": { x: 0, y: -5 },
};

/**
 * ボス(BOSS)専用の位置調整
 * 先手用 / 後手用 を分ける
 * x: 左右, y: 上下
 */
const bossPieceOffsetMapPlayer1: Record<string, { x: number; y: number }> = {
  "0-0": { x: 0, y: -9 },
  "0-1": { x: 0, y: -9 },
  "0-2": { x: 0, y: -9 },

  "1-0": { x: 0, y: -9 },
  "1-1": { x: 0, y: -9 },
  "1-2": { x: 0, y: -9 },

  "2-0": { x: 0, y: -9 },
  "2-1": { x: 0, y: -9 },
  "2-2": { x: 0, y: -9 },

  "3-0": { x: 0, y: -9 },
  "3-1": { x: 0, y: -9 },
  "3-2": { x: 0, y: -9 },
};

const bossPieceOffsetMapPlayer2: Record<string, { x: number; y: number }> = {
  "0-0": { x: 0, y: -12 },
  "0-1": { x: 0, y: -12 },
  "0-2": { x: 0, y: -12 },

  "1-0": { x: 0, y: -12 },
  "1-1": { x: 0, y: -12 },
  "1-2": { x: 0, y: -12 },

  "2-0": { x: 0, y: -12 },
  "2-1": { x: 0, y: -12 },
  "2-2": { x: 0, y: -12 },

  "3-0": { x: 0, y: -12 },
  "3-1": { x: 0, y: -12 },
  "3-2": { x: 0, y: -12 },
};

function cellOffsetStyle(row: number, col: number) {
  const offset = squareCellOffsetMap[`${row}-${col}`] ?? { x: 0, y: 0 };

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };
}

function pieceOffsetStyle(row: number, col: number, cell: SyahoShogiCell) {
  const key = `${row}-${col}`;

  const normalOffset = squarePieceOffsetMap[key] ?? { x: 0, y: 0 };
  const promotedOffset = promotedPieceOffsetMap[key] ?? normalOffset;

  const bossOffsetPlayer1 = bossPieceOffsetMapPlayer1[key] ?? normalOffset;
  const bossOffsetPlayer2 = bossPieceOffsetMapPlayer2[key] ?? normalOffset;

  const bossOffset =
    cell?.owner === 1 ? bossOffsetPlayer1 : bossOffsetPlayer2;

  const offset =
    cell?.type === "MIKURU"
      ? promotedOffset
      : cell?.type === "BOSS"
        ? bossOffset
        : normalOffset;

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };
}

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
  <section class="board-overlay">
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
          :style="cellOffsetStyle(rowIndex, colIndex)"
          type="button"
          @click="emit('cell-click', rowIndex, colIndex)"
        >
          <span
            v-if="isLegalTarget(rowIndex, colIndex) && !cell"
            class="move-marker"
          />

          <template v-if="cell">
            <div
              class="piece-token"
              :class="{
                'owner-1': cell.owner === 1,
                'owner-2': cell.owner === 2,
                boss: cell.type === 'BOSS',
                'boss-owner-1': cell.type === 'BOSS' && cell.owner === 1,
                'boss-owner-2': cell.type === 'BOSS' && cell.owner === 2,
                promoted: cell.type === 'MIKURU',
                'promoted-1': cell.type === 'MIKURU' && cell.owner === 1,
                'promoted-2': cell.type === 'MIKURU' && cell.owner === 2,
              }"
              :style="pieceOffsetStyle(rowIndex, colIndex, cell)"
            >
              <!-- <span class="owner-badge">
                {{ cell.owner === 1 ? "P1" : "P2" }}
              </span> -->

              <img
                class="piece-image"
                :class="{
                  reverse: cell.owner === 2,
                  'piece-image-promoted': cell.type === 'MIKURU',
                }"
                :src="pieceImageSrc(cell)"
                :alt="pieceLabel(cell)"
                draggable="false"
              />
            </div>
          </template>
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.board-overlay {
  position: relative;
  width: 400px;
  height: 500px;
  background: url("/battle/board.png") center / 100% 100% no-repeat;
}

.board-grid {
  position: absolute;
  inset: 13% 13% 13% 13%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1.8%;
}

.cell {
  position: relative;
  border: none;
  background: transparent;
  border-radius: 16px;
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
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.92),
    0 0 18px rgba(131, 232, 255, 0.55);
}

.cell.movable:not(.empty) {
  box-shadow:
    inset 0 0 0 2px rgba(255, 238, 154, 0.92),
    0 0 14px rgba(255, 228, 110, 0.48);
}

.move-marker {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 245, 173, 0.95);
  box-shadow:
    0 0 12px rgba(255, 228, 110, 0.72),
    inset 0 0 0 2px rgba(255, 255, 255, 0.55);
}

.piece-token {
  position: relative;
  display: grid;
  place-items: center;
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
}

/* 通常駒サイズ */
.piece-token.owner-1 {
  width: 78%;
  height: 78%;
  padding: 0;
}

.piece-token.owner-2 {
  width: 78%;
  height: 78%;
  padding: 0;
}

/* ボスだけサイズ変更 */
.piece-token.boss-owner-1 {
  width: 115%;
  height: 115%;
}

.piece-token.boss-owner-2 {
  width: 115%;
  height: 115%;
}

/* 成り駒だけサイズ変更 */
.piece-token.promoted-1 {
  width: 80%;
  height: 80%;
}

.piece-token.promoted-2 {
  width: 80%;
  height: 80%;
}

.owner-badge {
  position: absolute;
  top: -2px;
  left: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 18, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 9px;
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
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.24));
}

.piece-image-promoted {
  object-fit: contain;
}

.piece-image.reverse {
  transform: rotate(180deg);
}
</style>
