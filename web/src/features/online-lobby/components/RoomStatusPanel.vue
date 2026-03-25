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
  color: #7fe7ff;
  text-shadow: 0 0 10px rgba(127, 231, 255, 0.24);
}

h2 {
  margin: 2px 0 0;
  font-size: 20px;
  color: #ffffff;
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
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
  background: rgba(255, 255, 255, 0.08);
  color: #e5f3ff;
  border: 1px solid rgba(232, 241, 255, 0.14);
}

.status-badge.open {
  background: rgba(255, 196, 92, 0.14);
  color: #ffe1a2;
}

.status-badge.matched {
  background: rgba(98, 171, 255, 0.16);
  color: #cde7ff;
}

.status-badge.playing {
  background: rgba(111, 255, 207, 0.14);
  color: #c7ffed;
}

.status-badge.closed {
  background: rgba(255, 103, 130, 0.14);
  color: #ffd6df;
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
  background: rgba(11, 21, 40, 0.30);
  border: 1px solid rgba(232, 241, 255, 0.14);
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 900;
  letter-spacing: 0.14em;
  color: #ffffff;
  backdrop-filter: blur(8px);
}

.copy-button {
  min-width: 78px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(232, 241, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(120, 214, 255, 0.20) 0%, rgba(165, 123, 255, 0.16) 100%);
  color: #f2f9ff;
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(232, 241, 255, 0.14);
  backdrop-filter: blur(8px);
}

.member-role {
  flex: 0 0 auto;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: #7fe7ff;
}

.member-name {
  flex: 1 1 auto;
  min-width: 0;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-character {
  flex: 0 1 auto;
  min-width: 0;
  color: rgba(228, 238, 255, 0.82);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ready-badge {
  min-width: 82px;
  height: 28px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #dcecff;
  border: 1px solid rgba(232, 241, 255, 0.14);
}

.ready-badge.active {
  background: rgba(106, 239, 183, 0.22);
  color: #ddffef;
}

.mini-label,
.code-label {
  color: #ffd978;
  text-shadow: none;
}

h2 {
  color: #fff0b8;
}

.status-badge {
  background: rgba(14, 22, 40, 0.56);
  color: #fff4cf;
  border: 1px solid rgba(255, 223, 156, 0.18);
}

.room-code {
  background: rgba(8, 14, 28, 0.68);
  border: 1px solid rgba(255, 223, 156, 0.20);
  color: #fff4c8;
}

.copy-button {
  color: #18213a;
  background: linear-gradient(180deg, rgba(145, 227, 255, 0.94) 0%, rgba(196, 161, 255, 0.90) 100%);
  border: 1px solid rgba(255, 247, 221, 0.56);
}

.member-row {
  background: rgba(10, 18, 33, 0.54);
  border: 1px solid rgba(255, 223, 156, 0.16);
}

.member-role {
  color: #ffd978;
}

.member-name {
  color: #fff7dc;
}

.member-character {
  color: rgba(255, 238, 198, 0.84);
}

.ready-badge {
  color: #fff2c7;
}

.empty-state {
  background: rgba(10, 18, 33, 0.54);
  border-color: rgba(255, 223, 156, 0.16);
  color: rgba(255, 244, 214, 0.92);
}

.empty-state {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(232, 241, 255, 0.14);
  color: rgba(230, 239, 255, 0.86);
  line-height: 1.7;
  backdrop-filter: blur(8px);
}

@media (max-width: 820px) {
  .room-code-line,
  .topline,
  .member-row {
    flex-wrap: wrap;
  }

  .copy-button {
    width: 100%;
  }

  .member-name,
  .member-character {
    width: 100%;
    white-space: normal;
  }
}
</style>