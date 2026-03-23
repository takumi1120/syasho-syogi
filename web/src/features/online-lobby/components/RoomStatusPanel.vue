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
  <section class="panel status-panel">
    <div class="status-head">
      <div>
        <p class="mini-label">ROOM STATUS</p>
        <h2>現在の部屋</h2>
      </div>
      <span class="status-badge" :class="room?.status?.toLowerCase()">
        {{ statusLabel }}
      </span>
    </div>

    <template v-if="room">
      <div class="room-topline">
        <div>
          <span class="mini-label">ROOM CODE</span>
          <div class="room-code-box">{{ room.roomCode }}</div>
        </div>

        <button class="ghost-button" @click="emit('copy')">
          コピー
        </button>
      </div>

      <div class="members-grid">
        <article class="member-card host">
          <p class="member-role">HOST</p>
          <strong class="member-name">{{ room.hostUser?.name || `User ${room.hostUserId}` }}</strong>
          <p class="member-sub">ID: {{ room.hostUserId }}</p>
          <p class="member-sub">キャラ: {{ room.hostCharacter || "未選択" }}</p>
          <span class="ready-badge" :class="{ active: room.hostReady }">
            {{ room.hostReady ? "READY" : "WAITING" }}
          </span>
        </article>

        <article class="member-card guest">
          <p class="member-role">GUEST</p>
          <strong class="member-name">
            {{ room.guestUser?.name || (room.guestUserId ? `User ${room.guestUserId}` : "参加待ち") }}
          </strong>
          <p class="member-sub">ID: {{ room.guestUserId ?? "未参加" }}</p>
          <p class="member-sub">キャラ: {{ room.guestCharacter || "未選択" }}</p>
          <span class="ready-badge" :class="{ active: room.guestReady }">
            {{ room.guestReady ? "READY" : "WAITING" }}
          </span>
        </article>
      </div>
    </template>

    <template v-else>
      <div class="empty-state">
        <p>まだ部屋に入っていません。</p>
        <p>左側からルーム作成、またはルームコード入力で参加してください。</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.panel {
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(157, 206, 255, 0.18);
  background: rgba(18, 29, 52, 0.74);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #eef5ff;
}

.status-head,
.room-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mini-label {
  margin: 0;
  letter-spacing: 0.28em;
  font-size: 12px;
  color: #8ec5ff;
}

h2 {
  margin: 10px 0 0;
}

.status-badge,
.ready-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge {
  min-width: 110px;
  height: 36px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #dff0ff;
}

.status-badge.open {
  background: rgba(255, 196, 92, 0.16);
  color: #ffe1a2;
}

.status-badge.matched {
  background: rgba(98, 171, 255, 0.18);
  color: #cde7ff;
}

.status-badge.playing {
  background: rgba(111, 255, 207, 0.16);
  color: #c7ffed;
}

.status-badge.closed {
  background: rgba(255, 103, 130, 0.16);
  color: #ffd6df;
}

.room-topline {
  margin-top: 18px;
}

.room-code-box {
  margin-top: 6px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(8, 17, 33, 0.72);
  border: 1px solid rgba(157, 206, 255, 0.16);
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 900;
  letter-spacing: 0.16em;
  color: #ffffff;
}

.ghost-button {
  min-width: 88px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(157, 206, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #def0ff;
  font-weight: 800;
  cursor: pointer;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.member-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(157, 206, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
}

.member-role {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.22em;
  color: #8ec5ff;
}

.member-name {
  display: block;
  margin-top: 10px;
  font-size: 22px;
  color: #f5f9ff;
}

.member-sub {
  margin: 8px 0 0;
  color: rgba(223, 236, 255, 0.74);
  font-size: 14px;
}

.ready-badge {
  min-width: 96px;
  height: 34px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.08);
  color: #dcecff;
}

.ready-badge.active {
  background: linear-gradient(180deg, #7ceeb7 0%, #49d59b 100%);
  color: #082217;
}

.empty-state {
  margin-top: 18px;
  padding: 28px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(225, 238, 255, 0.8);
  line-height: 1.8;
  text-align: center;
}

@media (max-width: 920px) {
  .members-grid {
    grid-template-columns: 1fr;
  }

  .room-topline,
  .status-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>