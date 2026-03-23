<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createInitialSyahoShogiState,
  applySyahoShogiAction,
  type SyahoShogiState,
  type SyahoShogiSquare,
  type SyahoShogiPiece,
  type SyahoShogiHandPieceType,
  type SyahoShogiPlayer,
} from "../lib/syahosyogi";

const route = useRoute();
const router = useRouter();

function readStringQuery(key: string, fallback = "") {
  const value = route.query[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

const player1Name = computed(() => readStringQuery("p1Name", "Player 1"));
const player2Name = computed(() => readStringQuery("p2Name", "Player 2"));
const player1Character = computed(() => readStringQuery("p1Character", ""));
const player2Character = computed(() => readStringQuery("p2Character", ""));

const battleState = ref<SyahoShogiState>(
  createInitialSyahoShogiState({
    player1BossCharacter: player1Character.value || null,
    player2BossCharacter: player2Character.value || null,
  })
);

const errorMessage = ref("");
const message = ref("");

const selectedSquare = ref<SyahoShogiSquare | null>(null);
const selectedHandPiece = ref<SyahoShogiHandPieceType | null>(null);

const boardRows = computed(() => battleState.value.board);

const currentTurnName = computed(() => {
  return battleState.value.currentPlayer === 1 ? player1Name.value : player2Name.value;
});

const winnerName = computed(() => {
  if (battleState.value.winner === 1) return player1Name.value;
  if (battleState.value.winner === 2) return player2Name.value;
  return "";
});

const currentPlayerHands = computed(() => {
  return battleState.value.hands[battleState.value.currentPlayer];
});

function clearNotice() {
  errorMessage.value = "";
  message.value = "";
}

function clearSelection() {
  selectedSquare.value = null;
  selectedHandPiece.value = null;
}

function pieceLabel(piece: SyahoShogiPiece): string {
  switch (piece.type) {
    case "BOSS":
      return piece.characterName?.trim() || "社長";
    case "SON":
      return "SON";
    case "MIKITANI":
      return "MIKITANI";
    case "MIZOGUCHI":
      return "MIZOGUCHI";
    case "MIKURU":
      return "MIKURU";
    default:
      return piece.type;
  }
}

function handLabel(pieceType: SyahoShogiHandPieceType) {
  switch (pieceType) {
    case "SON":
      return "SON";
    case "MIKITANI":
      return "MIKITANI";
    case "MIZOGUCHI":
      return "MIZOGUCHI";
    default:
      return pieceType;
  }
}

function getCellPiece(row: number, col: number) {
  return battleState.value.board[row][col];
}

function isOwnPiece(piece: SyahoShogiPiece | null) {
  return !!piece && piece.owner === battleState.value.currentPlayer;
}

function isSameSquare(a: SyahoShogiSquare | null, b: SyahoShogiSquare) {
  return !!a && a.row === b.row && a.col === b.col;
}

function applyAction(action:
  | { kind: "MOVE"; from: SyahoShogiSquare; to: SyahoShogiSquare }
  | { kind: "DROP"; pieceType: SyahoShogiHandPieceType; to: SyahoShogiSquare }
) {
  clearNotice();

  const result = applySyahoShogiAction(battleState.value, action);

  if (!result.ok) {
    errorMessage.value = result.error;
    return;
  }

  battleState.value = result.state;
  clearSelection();

  if (result.state.status === "FINISHED") {
    message.value = `対局終了: ${winnerName.value} の勝ち`;
  }
}

function handleHandClick(pieceType: SyahoShogiHandPieceType) {
  if (battleState.value.status === "FINISHED") return;

  const count = currentPlayerHands.value[pieceType] ?? 0;
  if (count <= 0) return;

  if (selectedHandPiece.value === pieceType) {
    selectedHandPiece.value = null;
    return;
  }

  selectedHandPiece.value = pieceType;
  selectedSquare.value = null;
}

function handleCellClick(row: number, col: number) {
  if (battleState.value.status === "FINISHED") return;

  const clickedSquare = { row, col };
  const piece = getCellPiece(row, col);

  if (selectedHandPiece.value) {
    if (piece) return;

    applyAction({
      kind: "DROP",
      pieceType: selectedHandPiece.value,
      to: clickedSquare,
    });
    return;
  }

  if (selectedSquare.value) {
    if (isSameSquare(selectedSquare.value, clickedSquare)) {
      selectedSquare.value = null;
      return;
    }

    if (piece && isOwnPiece(piece)) {
      selectedSquare.value = clickedSquare;
      return;
    }

    applyAction({
      kind: "MOVE",
      from: selectedSquare.value,
      to: clickedSquare,
    });
    return;
  }

  if (piece && isOwnPiece(piece)) {
    selectedSquare.value = clickedSquare;
  }
}

function resetBattle() {
  clearNotice();
  clearSelection();

  battleState.value = createInitialSyahoShogiState({
    player1BossCharacter: player1Character.value || null,
    player2BossCharacter: player2Character.value || null,
  });
}

function backToLobby() {
  router.push("/local-lobby");
}
</script>

<template>
  <section class="battle-page">
    <div class="battle-shell">
      <header class="battle-header card">
        <div>
          <p class="eyebrow">LOCAL BATTLE</p>
          <h1>社長将棋</h1>
          <p class="sub">
            {{ player1Name }} vs {{ player2Name }}
          </p>
        </div>

        <div class="header-actions">
          <button class="ghost-button" type="button" @click="backToLobby">
            ロビーへ戻る
          </button>
          <button class="ghost-button" type="button" @click="resetBattle">
            リセット
          </button>
        </div>
      </header>

      <div class="top-grid">
        <section class="card status-card">
          <h2>対局情報</h2>
          <div class="status-grid">
            <div>
              <span class="label">先手</span>
              <strong>{{ player1Name }}</strong>
              <small>{{ player1Character || "未設定" }}</small>
            </div>
            <div>
              <span class="label">後手</span>
              <strong>{{ player2Name }}</strong>
              <small>{{ player2Character || "未設定" }}</small>
            </div>
            <div>
              <span class="label">現在の手番</span>
              <strong>{{ currentTurnName }}</strong>
              <small>{{ battleState.status === "FINISHED" ? "対局終了" : "操作できます" }}</small>
            </div>
            <div>
              <span class="label">勝敗</span>
              <strong>{{ winnerName || "-" }}</strong>
              <small>{{ battleState.winReason || "進行中" }}</small>
            </div>
          </div>
        </section>

        <section class="card side-card">
          <h2>現在の持ち駒</h2>
          <div class="hand-list">
            <button
              v-for="pieceType in ['SON', 'MIKITANI', 'MIZOGUCHI']"
              :key="pieceType"
              class="hand-chip"
              :class="{ active: selectedHandPiece === pieceType }"
              :disabled="(currentPlayerHands[pieceType as SyahoShogiHandPieceType] ?? 0) <= 0 || battleState.status === 'FINISHED'"
              @click="handleHandClick(pieceType as SyahoShogiHandPieceType)"
            >
              {{ handLabel(pieceType as SyahoShogiHandPieceType) }}
              <span>×{{ currentPlayerHands[pieceType as SyahoShogiHandPieceType] ?? 0 }}</span>
            </button>
          </div>

          <p class="hint">
            自分の駒を選んで移動先をクリック。<br />
            持ち駒は上のボタンを選んでから空きマスをクリック。
          </p>
        </section>
      </div>

      <section class="card board-card">
        <div class="board">
          <button
            v-for="(cell, index) in boardRows.flat()"
            :key="index"
            class="cell"
            :class="{
              selected:
                selectedSquare &&
                selectedSquare.row === Math.floor(index / 3) &&
                selectedSquare.col === index % 3,
              own: cell && cell.owner === battleState.currentPlayer,
              enemy: cell && cell.owner !== battleState.currentPlayer,
              empty: !cell
            }"
            @click="handleCellClick(Math.floor(index / 3), index % 3)"
          >
            <template v-if="cell">
              <span class="owner-badge">{{ cell.owner === 1 ? "先" : "後" }}</span>
              <span class="piece-text">{{ pieceLabel(cell) }}</span>
            </template>
            <template v-else>
              <span class="empty-dot">+</span>
            </template>
          </button>
        </div>
      </section>

      <div v-if="message" class="notice success">{{ message }}</div>
      <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
    </div>
  </section>
</template>

<style scoped>
.battle-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(128, 196, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #16233d 0%, #0d162a 58%, #07101d 100%);
  color: #eef5ff;
}

.battle-shell {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.card,
.battle-header {
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  border-radius: 24px;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h1 {
  margin: 0;
  font-size: 28px;
}

.sub {
  margin: 8px 0 0;
  color: #bcd4ef;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.status-card,
.side-card,
.board-card {
  padding: 18px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #8ec5ff;
}

.status-grid strong {
  display: block;
  font-size: 20px;
}

.status-grid small,
.hint {
  display: block;
  margin-top: 6px;
  color: #bcd4ef;
  line-height: 1.6;
}

.hand-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.hand-chip,
.ghost-button {
  border-radius: 999px;
  border: 1px solid rgba(160, 205, 255, 0.22);
}

.hand-chip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
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

.notice {
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 700;
}

.notice.success {
  background: rgba(69, 182, 120, 0.16);
  border: 1px solid rgba(69, 182, 120, 0.32);
  color: #c8f0d7;
}

.notice.error {
  background: rgba(221, 97, 97, 0.16);
  border: 1px solid rgba(221, 97, 97, 0.32);
  color: #ffd4d4;
}

.ghost-button {
  padding: 10px 16px;
  font-weight: 800;
  cursor: pointer;
  background: rgba(24, 36, 60, 0.95);
  color: #eef5ff;
}

@media (max-width: 980px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .battle-page {
    padding: 14px;
  }

  .battle-header {
    padding: 18px;
  }

  h1 {
    font-size: 22px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .cell {
    min-height: 96px;
  }

  .piece-text {
    font-size: 15px;
  }
}
</style>