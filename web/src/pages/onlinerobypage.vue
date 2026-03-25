<script setup lang="ts">
import { RouterLink } from "vue-router";
import LobbyShell from "../components/lobby/LobbyShell.vue";
import OnlineLobbyContent from "../features/online-lobby/components/OnlineLobbyContent.vue";
</script>

<template>
  <section class="lobby-page">
    <div class="page-overlay"></div>

    <LobbyShell>
      <OnlineLobbyContent />
    </LobbyShell>

    <RouterLink class="back-link" to="/">
      mode選択へ
    </RouterLink>
  </section>
</template>

<style scoped>
.lobby-page {
  position: relative;
  min-height: 100dvh;
  padding: 14px 16px 18px;
  background: url("../assets/background/loby.png") center / cover no-repeat;
  color: #fff8ea;
  overflow: hidden;
}
/* ===== オンラインロビー文字色 上書きここから ===== */

/* 見出し */
.lobby-page :deep(.online-lobby-content .user-area h2),
.lobby-page :deep(.online-lobby-content .action-area h2),
.lobby-page :deep(.online-lobby-content .status-area h2) {
  color: #193257;
  text-shadow: none;
}

/* 小見出し・ラベル */
.lobby-page :deep(.online-lobby-content .mini-label),
.lobby-page :deep(.online-lobby-content .code-label),
.lobby-page :deep(.online-lobby-content .card-label),
.lobby-page :deep(.online-lobby-content .field-label),
.lobby-page :deep(.online-lobby-content .member-role),
.lobby-page :deep(.online-lobby-content .state-pill span) {
  color: #41689a;
  text-shadow: none;
}

/* メイン文字 */
.lobby-page :deep(.online-lobby-content .card-value),
.lobby-page :deep(.online-lobby-content .member-name),
.lobby-page :deep(.online-lobby-content .room-code),
.lobby-page :deep(.online-lobby-content .state-pill strong) {
  color: #0f2546;
  text-shadow: none;
}

/* 補助テキスト */
.lobby-page :deep(.online-lobby-content .member-character),
.lobby-page :deep(.online-lobby-content .subtext),
.lobby-page :deep(.online-lobby-content .switch-hint),
.lobby-page :deep(.online-lobby-content .hint),
.lobby-page :deep(.online-lobby-content .empty-state) {
  color: #28466f;
  text-shadow: none;
}

/* 入力欄 */
.lobby-page :deep(.online-lobby-content .user-select),
.lobby-page :deep(.online-lobby-content .room-code-input) {
  color: #10233f;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .user-select option) {
  color: #10233f;
  background: #f5f8ff;
}

.lobby-page :deep(.online-lobby-content .room-code-input::placeholder) {
  color: #6f86a8;
}

/* ステータス表示 */
.lobby-page :deep(.online-lobby-content .status-badge) {
  color: #173253;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .status-badge.open) {
  color: #7a4b00;
}

.lobby-page :deep(.online-lobby-content .status-badge.matched) {
  color: #18456d;
}

.lobby-page :deep(.online-lobby-content .status-badge.playing) {
  color: #145235;
}

.lobby-page :deep(.online-lobby-content .status-badge.closed) {
  color: #7a1f3d;
}

.lobby-page :deep(.online-lobby-content .ready-badge) {
  color: #173253;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .ready-badge.active) {
  color: #145235;
}

/* ボタン文字 */
.lobby-page :deep(.online-lobby-content .join-button) {
  color: #20375e;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .create-button) {
  color: #31285a;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .copy-button) {
  color: #23365e;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .ready-button) {
  color: #123824;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .start-button) {
  color: #5b3b00;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .leave-button) {
  color: #6a1834;
  text-shadow: none;
}

/* 通知 */
.lobby-page :deep(.online-lobby-content .notice.success) {
  color: #10412b;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .notice.error) {
  color: #6c1734;
  text-shadow: none;
}

/* 強すぎる全体影を無効化 */
.lobby-page :deep(.online-lobby-content h1),
.lobby-page :deep(.online-lobby-content h2),
.lobby-page :deep(.online-lobby-content h3),
.lobby-page :deep(.online-lobby-content p),
.lobby-page :deep(.online-lobby-content span),
.lobby-page :deep(.online-lobby-content strong),
.lobby-page :deep(.online-lobby-content label),
.lobby-page :deep(.online-lobby-content li),
.lobby-page :deep(.online-lobby-content small),
.lobby-page :deep(.online-lobby-content button),
.lobby-page :deep(.online-lobby-content input),
.lobby-page :deep(.online-lobby-content select) {
  text-shadow: none;
}

/* ===== オンラインロビー文字色 上書きここまで ===== */
.page-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 14%, rgba(255, 242, 180, 0.16), transparent 24%),
    radial-gradient(circle at 18% 22%, rgba(112, 220, 255, 0.18), transparent 26%),
    radial-gradient(circle at 82% 18%, rgba(200, 146, 255, 0.16), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.10), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(110, 205, 255, 0.10), transparent 32%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.02) 0%,
      rgba(6, 12, 24, 0.01) 30%,
      rgba(6, 12, 24, 0.05) 100%
    );
  pointer-events: none;
}

:deep(.lobby-shell) {
  position: relative;
  z-index: 1;
  height: calc(100dvh - 32px);
}

/* ===== オンラインロビー 黄色寄り文字 上書きここから ===== */

/* ヒーロー */
.lobby-page :deep(.hero-card .eyebrow) {
  color: #ffe27a;
  text-shadow:
    0 1px 0 rgba(84, 52, 0, 0.55),
    0 2px 6px rgba(0, 0, 0, 0.28);
}

.lobby-page :deep(.hero-card h1) {
  color: #fff2a8;
  text-shadow:
    0 1px 0 rgba(96, 60, 0, 0.58),
    0 2px 0 rgba(96, 60, 0, 0.28),
    0 6px 16px rgba(0, 0, 0, 0.24);
}

.lobby-page :deep(.hero-card .description) {
  color: #fff6c8;
  text-shadow:
    0 1px 0 rgba(72, 42, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

/* 見出し */
.lobby-page :deep(.online-lobby-content .user-head h2),
.lobby-page :deep(.online-lobby-content .section-head h2),
.lobby-page :deep(.online-lobby-content .title-wrap h2) {
  color: #ffe79a;
  text-shadow:
    0 1px 0 rgba(88, 54, 0, 0.52),
    0 2px 0 rgba(88, 54, 0, 0.22),
    0 4px 12px rgba(0, 0, 0, 0.16);
}

/* 小ラベル */
.lobby-page :deep(.online-lobby-content .mini-label),
.lobby-page :deep(.online-lobby-content .code-label),
.lobby-page :deep(.online-lobby-content .card-label),
.lobby-page :deep(.online-lobby-content .field-label),
.lobby-page :deep(.online-lobby-content .member-role),
.lobby-page :deep(.online-lobby-content .state-pill span) {
  color: #ffd96a;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.48),
    0 2px 6px rgba(0, 0, 0, 0.14);
}

/* メイン文字 */
.lobby-page :deep(.online-lobby-content .card-value),
.lobby-page :deep(.online-lobby-content .member-name),
.lobby-page :deep(.online-lobby-content .room-code),
.lobby-page :deep(.online-lobby-content .state-pill strong),
.lobby-page :deep(.online-lobby-content .status-badge),
.lobby-page :deep(.online-lobby-content .ready-badge) {
  color: #fff2b8;
  text-shadow:
    0 1px 0 rgba(90, 56, 0, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

/* 補助テキスト */
.lobby-page :deep(.online-lobby-content .member-character),
.lobby-page :deep(.online-lobby-content .subtext),
.lobby-page :deep(.online-lobby-content .switch-hint),
.lobby-page :deep(.online-lobby-content .hint),
.lobby-page :deep(.online-lobby-content .empty-state) {
  color: #ffefbf;
  text-shadow:
    0 1px 0 rgba(82, 48, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

/* 通知 */
.lobby-page :deep(.online-lobby-content .notice.success) {
  color: #fff4cf;
  text-shadow:
    0 1px 0 rgba(36, 64, 30, 0.24),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .notice.error) {
  color: #fff0c9;
  text-shadow:
    0 1px 0 rgba(92, 28, 38, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

/* 入力欄は黄色すぎると見づらいので少し落ち着かせる */
.lobby-page :deep(.online-lobby-content .user-select),
.lobby-page :deep(.online-lobby-content .room-code-input) {
  color: #fff1b4;
  text-shadow:
    0 1px 0 rgba(72, 42, 0, 0.34),
    0 2px 8px rgba(0, 0, 0, 0.14);
}

.lobby-page :deep(.online-lobby-content .user-select option) {
  color: #3b2a0d;
  background: #fff7e2;
}

.lobby-page :deep(.online-lobby-content .room-code-input::placeholder) {
  color: rgba(255, 232, 166, 0.82);
}

/* 状態別 */
.lobby-page :deep(.online-lobby-content .status-badge.open) {
  color: #fff0a8;
}

.lobby-page :deep(.online-lobby-content .status-badge.matched) {
  color: #fff3bf;
}

.lobby-page :deep(.online-lobby-content .status-badge.playing),
.lobby-page :deep(.online-lobby-content .ready-badge.active) {
  color: #f4ffd6;
}

.lobby-page :deep(.online-lobby-content .status-badge.closed) {
  color: #ffe0c4;
}

/* ボタン文字は可読性優先 */
.lobby-page :deep(.online-lobby-content .join-button) {
  color: #3d2d0f;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .create-button) {
  color: #3a2b16;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .copy-button) {
  color: #402d0e;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .ready-button) {
  color: #133022;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .start-button) {
  color: #3a2908;
  text-shadow: none;
}

.lobby-page :deep(.online-lobby-content .leave-button) {
  color: #4a1826;
  text-shadow: none;
}

/* 前に足した強い全体影をこのブロックで上書き */
.lobby-page :deep(.online-lobby-content h1),
.lobby-page :deep(.online-lobby-content h2),
.lobby-page :deep(.online-lobby-content h3),
.lobby-page :deep(.online-lobby-content p),
.lobby-page :deep(.online-lobby-content span),
.lobby-page :deep(.online-lobby-content strong),
.lobby-page :deep(.online-lobby-content label),
.lobby-page :deep(.online-lobby-content li),
.lobby-page :deep(.online-lobby-content small) {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ===== オンラインロビー 黄色寄り文字 上書きここまで ===== */
@media (max-width: 980px) {
  .lobby-page {
    overflow: auto;
    padding-bottom: 72px;
  }

  :deep(.lobby-shell) {
    height: auto;
  }
}

@media (max-width: 640px) {
  .lobby-page {
    padding: 12px 10px 72px;
  }

  .back-link {
    right: 10px;
    bottom: 10px;
    min-height: 32px;
    font-size: 11px;
    padding: 0 10px;
  }
}

.page-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 14%, rgba(255, 242, 180, 0.16), transparent 24%),
    radial-gradient(circle at 18% 22%, rgba(112, 220, 255, 0.18), transparent 26%),
    radial-gradient(circle at 82% 18%, rgba(200, 146, 255, 0.16), transparent 24%),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.10), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(110, 205, 255, 0.10), transparent 32%),
    linear-gradient(
      180deg,
      rgba(6, 12, 24, 0.02) 0%,
      rgba(6, 12, 24, 0.01) 30%,
      rgba(6, 12, 24, 0.05) 100%
    );
  pointer-events: none;
}

:deep(.lobby-shell) {
  position: relative;
  z-index: 1;
  height: calc(100dvh - 32px);
}

.back-link {
  position: fixed;
  right: 16px;
  bottom: 14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #4b3608;
  background: rgba(255, 229, 150, 0.95);
  border: 1px solid rgba(255, 245, 214, 0.76);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

@media (max-width: 980px) {
  .lobby-page {
    overflow: auto;
    padding-bottom: 72px;
  }

  :deep(.lobby-shell) {
    height: auto;
  }
}

@media (max-width: 640px) {
  .lobby-page {
    padding: 12px 10px 72px;
  }

  .back-link {
    right: 10px;
    bottom: 10px;
    min-height: 32px;
    font-size: 11px;
    padding: 0 10px;
  }
}
</style>