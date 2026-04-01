<script setup lang="ts">
import type { Room } from "../../../services/roomService";

defineProps<{
  room: Room | null;
  statusLabel: string;
}>();

const emit = defineEmits<{
  (e: "copy"): void;
}>();
</script>

<template>
  <section class="panel status-area">
    <div class="topline">
      <div class="title-wrap">
        <p class="mini-label">ROOM STATUS</p>
        <h2>現在の部屋</h2>
      </div>

      <span class="status-badge" :class="room?.status?.toLowerCase()">
        {{ statusLabel }}
      </span>
    </div>

    <template v-if="room">
      <div class="room-code-line">
        <div class="room-code-wrap">
          <span class="code-label">ROOM CODE</span>
          <strong class="room-code">{{ room.roomCode }}</strong>
        </div>

        <button class="copy-button" @click="emit('copy')">
          コピー
        </button>
      </div>

      <div class="member-list">
        <article class="member-row">
          <span class="member-role">HOST</span>
          <strong class="member-name">{{ room.hostUser?.name || "ホスト" }}</strong>
          <span class="member-character">
            {{ room.hostCharacter || "キャラ未選択" }}
          </span>
          <span class="ready-badge" :class="{ active: room.hostReady }">
            {{ room.hostReady ? "READY" : "WAITING" }}
          </span>
        </article>

        <article class="member-row">
          <span class="member-role">GUEST</span>
          <strong class="member-name">{{ room.guestUser?.name || "参加待ち" }}</strong>
          <span class="member-character">
            {{ room.guestCharacter || "キャラ未選択" }}
          </span>
          <span class="ready-badge" :class="{ active: room.guestReady }">
            {{ room.guestReady ? "READY" : "WAITING" }}
          </span>
        </article>
      </div>
    </template>

    <template v-else>
      <div class="empty-state">
        まだ部屋に入っていません。左側からルーム作成または参加をしてください。
      </div>
    </template>
  </section>
</template>

<style scoped>
.panel {
  min-width: 0;
}

.status-area {
  display: grid;
  gap: 10px;
  padding: 8px 0;
}

.topline,
.room-code-line,
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.topline,
.room-code-line {
  justify-content: space-between;
}

.title-wrap {
  min-width: 0;
}

.mini-label,
.code-label {
  display: block;
  margin: 0;
  letter-spacing: 0.18em;
  font-size: 10px;
  font-weight: 800;
  color: #ffe892;
  text-shadow:
    0 0 12px rgba(255, 232, 146, 0.28),
    0 2px 10px rgba(0, 0, 0, 0.08);
}

h2 {
  margin: 2px 0 0;
  font-size: 20px;
  color: #fff7d2;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.status-badge,
.ready-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  backdrop-filter: blur(8px);
}

.status-badge {
  min-width: 92px;
  height: 30px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff7dc;
  border: 1px solid rgba(255, 245, 214, 0.20);
}

.status-badge.open {
  background: rgba(255, 208, 120, 0.20);
  color: #fff0c6;
}

.status-badge.matched {
  background: rgba(138, 202, 255, 0.20);
  color: #eef8ff;
}

.status-badge.playing {
  background: rgba(126, 239, 188, 0.22);
  color: #f2fff9;
}

.status-badge.closed {
  background: rgba(255, 131, 156, 0.20);
  color: #fff3f6;
}

.room-code-wrap {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.room-code {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 14px;
  background: rgba(16, 22, 40, 0.34);
  border: 1px solid rgba(255, 245, 214, 0.18);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.14em;
  color: #fffaf0;
  backdrop-filter: blur(8px);
}

.copy-button {
  min-width: 78px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 247, 221, 0.56);
  background: linear-gradient(180deg, rgba(145, 227, 255, 0.92) 0%, rgba(196, 161, 255, 0.86) 100%);
  color: #36270d;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.member-list {
  display: grid;
  gap: 8px;
}

.member-row {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 245, 214, 0.20);
  backdrop-filter: blur(8px);
}

.member-role {
  flex: 0 0 auto;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: #ffe892;
}

.member-name {
  flex: 1 1 auto;
  min-width: 0;
  color: #fffaf0;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-character {
  flex: 0 1 auto;
  min-width: 0;
  color: rgba(255, 244, 214, 0.90);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ready-badge {
  min-width: 82px;
  height: 28px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff7dc;
  border: 1px solid rgba(255, 245, 214, 0.18);
}

.ready-badge.active {
  background: rgba(126, 239, 188, 0.22);
  color: #f3fff9;
}

.empty-state {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 245, 214, 0.20);
  color: rgba(255, 249, 230, 0.98);
  line-height: 1.7;
  backdrop-filter: blur(8px);
}

</style>
