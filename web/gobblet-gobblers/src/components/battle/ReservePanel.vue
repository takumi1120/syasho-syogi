<script setup lang="ts">
import { computed } from "vue";
import PieceCone from "./PieceCone.vue";
import type { Piece, PieceSize, Player } from "../../types/battle.types";

const props = withDefaults(
  defineProps<{
    title: string;
    pieces: Piece[];
    currentPlayer: Player;
    owner: Player;
    winner: Player | null;
    pieceSizeClass: (size: PieceSize) => string;
    isSelectedReservePiece: (pieceId: string) => boolean;
    reserveText: (piece: Piece) => string;
    playerImage: (owner: Player) => string;
    panelEnabled?: boolean;
  }>(),
  {
    panelEnabled: true,
  }
);

const emit = defineEmits<{
  select: [pieceId: string];
}>();

type ReserveSlot = {
  id: string;
  size: PieceSize;
  piece: Piece | null;
};

const reserveSlots = computed<ReserveSlot[]>(() => {
  const slotDefs: Array<{ id: string; size: PieceSize }> = [
    { id: `P${props.owner}-S1`, size: 1 },
    { id: `P${props.owner}-S2`, size: 1 },
    { id: `P${props.owner}-M1`, size: 2 },
    { id: `P${props.owner}-M2`, size: 2 },
    { id: `P${props.owner}-L1`, size: 3 },
    { id: `P${props.owner}-L2`, size: 3 },
  ];

  return slotDefs.map((slot) => ({
    ...slot,
    piece: props.pieces.find((piece) => piece.id === slot.id) ?? null,
  }));
});

function handleSelect(piece: Piece | null) {
  if (!piece) return;
  emit("select", piece.id);
}
</script>

<template>
  <section class="side-panel">
    <h2>{{ title }}</h2>

    <div class="reserve-grid">
      <button
        v-for="slot in reserveSlots"
        :key="slot.id"
        class="reserve-piece"
        :class="[
          pieceSizeClass(slot.size),
          {
            selected:
              slot.piece &&
              panelEnabled &&
              currentPlayer === owner &&
              isSelectedReservePiece(slot.piece.id),
            empty: !slot.piece,
          },
        ]"
        :disabled="
          !slot.piece || !panelEnabled || currentPlayer !== owner || winner !== null
        "
        @click="handleSelect(slot.piece)"
        :title="slot.piece ? reserveText(slot.piece) : ''"
        type="button"
      >
        <div class="reserve-piece-inner" :class="pieceSizeClass(slot.size)">
          <PieceCone
            v-if="slot.piece"
            :size="slot.piece.size"
            :owner="slot.piece.owner"
            :image="playerImage(slot.piece.owner)"
            placement="reserve"
            :selected="
              panelEnabled &&
              currentPlayer === owner &&
              isSelectedReservePiece(slot.piece.id)
            "
          />
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.side-panel {
  background: linear-gradient(180deg, rgba(66, 45, 26, 0.95), rgba(40, 27, 16, 0.95));
  border: 1px solid rgba(214, 170, 93, 0.45);
  border-radius: 22px;
  padding:
    var(--battle-side-panel-padding-top, 18px)
    var(--battle-side-panel-padding-x, 16px)
    var(--battle-side-panel-padding-bottom, 20px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.side-panel h2 {
  margin: 0 0 clamp(8px, 1vh, 14px);
  text-align: center;
  color: #ffd48a;
  font-size: var(--battle-side-heading-size, 28px);
  font-weight: 800;
}

.reserve-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(var(--battle-side-piece-column-min, 88px), 1fr));
  gap: var(--battle-reserve-gap, 12px);
}

.reserve-piece {
  border: 1px solid rgba(255, 221, 160, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.reserve-piece:hover:enabled {
  transform: translateY(-2px);
  border-color: rgba(255, 221, 160, 0.5);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
}

.reserve-piece:disabled {
  cursor: default;
  opacity: 0.72;
}

.reserve-piece.empty {
  opacity: 0.35;
}

.reserve-piece.selected {
  border-color: #ffd86b;
  box-shadow: 0 0 0 2px rgba(255, 216, 107, 0.25);
}

.reserve-piece-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
}

.reserve-piece-inner.piece-s {
  transform: scale(var(--battle-reserve-scale-s, 0.72));
}

.reserve-piece-inner.piece-m {
  transform: scale(var(--battle-reserve-scale-m, 0.84));
}

.reserve-piece-inner.piece-l {
  transform: scale(var(--battle-reserve-scale-l, 0.96));
}

.reserve-piece.piece-s {
  min-height: var(--battle-reserve-height-s, 88px);
}

.reserve-piece.piece-m {
  min-height: var(--battle-reserve-height-m, 104px);
}

.reserve-piece.piece-l {
  min-height: var(--battle-reserve-height-l, 120px);
}

@media (max-width: 768px) {
  .side-panel {
    border-radius: 18px;
  }

  .side-panel h2 {
    margin-bottom: 8px;
  }

  .reserve-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .reserve-piece {
    border-radius: 12px;
  }
}

@media (max-width: 420px) {
  .reserve-grid {
    gap: 6px;
  }
}
</style>