<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api";

const router = useRouter();

type User = {
  id: number;
  name: string;
};

type Character = {
  id: number;
  name: string;
  image: string;
};

const users = ref<User[]>([]);
const characters = ref<Character[]>([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);

const hostUserId = ref<number | null>(null);
const hostCharacterId = ref<number | null>(null);

const joinRoomId = ref("");
const guestUserId = ref<number | null>(null);
const guestCharacterId = ref<number | null>(null);

function getErrorMessage(e: any, fallback: string): string {
  return (
    e?.response?.data?.message ??
    e?.response?.data?.error?.message ??
    e?.message ??
    fallback
  );
}

function normalizeRoomId(value: string): string {
  return value.trim().toUpperCase();
}

const hostCharacter = computed(() => {
  return characters.value.find((c) => c.id === hostCharacterId.value) ?? null;
});

const guestCharacter = computed(() => {
  return characters.value.find((c) => c.id === guestCharacterId.value) ?? null;
});

onMounted(async () => {
  await fetchInitialData();
});

async function fetchInitialData() {
  loading.value = true;
  error.value = null;

  try {
    const [usersRes, charactersRes] = await Promise.all([
      api.get("/users"),
      api.get("/characters"),
    ]);

    users.value = (usersRes.data.items ?? []).map((u: any) => ({
      ...u,
      id: Number(u.id),
    }));

    characters.value = (charactersRes.data.items ?? []).map((c: any) => ({
      ...c,
      id: Number(c.id),
    }));
  } catch (e: any) {
    error.value = getErrorMessage(e, "初期データの取得に失敗しました");
  } finally {
    loading.value = false;
  }
}

async function createRoom() {
  if (hostUserId.value === null || hostCharacterId.value === null) {
    alert("ユーザーとキャラクターを選択してください");
    return;
  }

  const user = users.value.find((u) => u.id === hostUserId.value);
  const character = characters.value.find((c) => c.id === hostCharacterId.value);

  if (!user || !character) {
    alert("ユーザーまたはキャラクター情報が見つかりません");
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    const res = await api.post("/online/rooms/create", {
      userId: user.id,
      userName: user.name,
      characterName: character.name,
      characterImage: character.image ?? "",
    });

    const roomId = res.data.item?.roomId;
    const player = res.data.item?.player;

    router.push({
      path: `/online/room/${roomId}`,
      query: {
        player: String(player),
      },
    });
  } catch (e: any) {
    error.value = getErrorMessage(e, "部屋作成に失敗しました");
  } finally {
    submitting.value = false;
  }
}

async function joinRoom() {
  if (!joinRoomId.value.trim()) {
    alert("ルームIDを入力してください");
    return;
  }

  if (guestUserId.value === null || guestCharacterId.value === null) {
    alert("ユーザーとキャラクターを選択してください");
    return;
  }

  const user = users.value.find((u) => u.id === guestUserId.value);
  const character = characters.value.find((c) => c.id === guestCharacterId.value);

  if (!user || !character) {
    alert("ユーザーまたはキャラクター情報が見つかりません");
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    const res = await api.post("/online/rooms/join", {
      roomId: normalizeRoomId(joinRoomId.value),
      userId: user.id,
      userName: user.name,
      characterName: character.name,
      characterImage: character.image ?? "",
    });

    const roomId = res.data.item?.roomId;
    const player = res.data.item?.player;

    router.push({
      path: `/online/room/${roomId}`,
      query: {
        player: String(player),
      },
    });
  } catch (e: any) {
    error.value = getErrorMessage(e, "ルーム参加に失敗しました");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="online-lobby">
    <div class="lobby-card">
      <h1>オンライン対戦</h1>
      <p class="sub">部屋を作るか、ルームIDで参加してください</p>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">読み込み中...</p>

      <div class="lobby-grid" v-if="!loading">
        <section class="panel">
          <h2>部屋を作る</h2>

          <label>ユーザー</label>
          <select v-model.number="hostUserId">
            <option :value="null">選択してください</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.name }}
            </option>
          </select>

          <label>キャラクター</label>
          <select v-model.number="hostCharacterId">
            <option :value="null">選択してください</option>
            <option v-for="c in characters" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>

          <div v-if="hostCharacter" class="character-preview-box">
            <img
              :src="hostCharacter.image"
              :alt="hostCharacter.name"
              class="character-preview"
            />
            <p>{{ hostCharacter.name }}</p>
          </div>

          <button class="action-button" :disabled="submitting" @click="createRoom">
            部屋を作成
          </button>
        </section>

        <section class="panel">
          <h2>部屋に参加</h2>

          <label>ルームID</label>
          <input
            v-model="joinRoomId"
            type="text"
            placeholder="例: A1B2C3"
            class="room-input"
          />

          <label>ユーザー</label>
          <select v-model.number="guestUserId">
            <option :value="null">選択してください</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.name }}
            </option>
          </select>

          <label>キャラクター</label>
          <select v-model.number="guestCharacterId">
            <option :value="null">選択してください</option>
            <option v-for="c in characters" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>

          <div v-if="guestCharacter" class="character-preview-box">
            <img
              :src="guestCharacter.image"
              :alt="guestCharacter.name"
              class="character-preview"
            />
            <p>{{ guestCharacter.name }}</p>
          </div>

          <button class="action-button" :disabled="submitting" @click="joinRoom">
            参加する
          </button>
        </section>
      </div>

      <div class="footer-actions">
        <button class="back-button" @click="router.push('/')">タイトルへ戻る</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border-inline: 0;
}

.online-lobby {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(118, 74, 34, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(36, 22, 13, 0.34) 0%, rgba(27, 16, 8, 0.46) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("/backgrounds/mode-bg2.jpg") center center / contain no-repeat;
}

.lobby-card {
  width: min(1100px, 100%);
   background: transparent;
  border: 1px solid rgba(255, 201, 117, 0.26);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

h1 {
  margin: 0;
  text-align: center;
  color: #ffd48a;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.sub {
  margin: 8px 0 0;
  text-align: center;
  color: #f3ddb3;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

.error {
  margin-top: 16px;
  color: #ffb2b2;
  text-align: center;
  font-weight: 700;
}

.loading {
  margin-top: 16px;
  color: #ffe2a8;
  text-align: center;
}

.lobby-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.panel {
  background: linear-gradient(
    180deg,
    rgba(66, 45, 26, 0.42),
    rgba(40, 27, 16, 0.34)
  );
  border: 1px solid rgba(214, 170, 93, 0.42);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.panel h2 {
  margin: 0 0 6px;
  color: #ffd48a;
  text-align: center;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}

label {
  color: #f8ddb0;
  font-weight: 700;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}

select,
.room-input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 221, 160, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #fff0d2;
  padding: 0 12px;
  font-size: 15px;
  outline: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

select:focus,
.room-input:focus {
  border-color: rgba(255, 212, 138, 0.7);
  box-shadow: 0 0 0 3px rgba(255, 212, 138, 0.12);
}

select option {
  background: #3a2414;
  color: #fff0d2;
}

.room-input::placeholder {
  color: rgba(255, 230, 188, 0.6);
}

.character-preview-box {
  margin-top: 8px;
  padding: 12px;
  text-align: center;
  color: #ffdfaa;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 221, 160, 0.16);
  border-radius: 14px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.character-preview {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(255, 221, 160, 0.28);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}

.action-button,
.back-button {
  margin-top: 12px;
  height: 46px;
  border: 1px solid rgba(255, 204, 112, 0.42);
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(58, 34, 14, 0.62),
    rgba(34, 20, 9, 0.48)
  );
  color: #ffdc9a;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.action-button:hover,
.back-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 212, 138, 0.72);
}

.action-button:disabled {
  opacity: 0.7;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 900px) {
  .lobby-grid {
    grid-template-columns: 1fr;
  }
}
</style>