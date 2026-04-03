<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api";

const router = useRouter();

const STORAGE_KEY = "gobblet-start-page-selection";

async function go(route: string) {
  router.push(route);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

type User = {
  id: number;
  name: string;
};

type Character = {
  id: number;
  name: string;
  image: string;
};

type StartPageSelectionState = {
  selectedP1: number | null;
  selectedP2: number | null;
  selectedP1CharacterId: number | null;
  selectedP2CharacterId: number | null;
};

const items = ref<User[]>([]);
const characters = ref<Character[]>([]);

const selectedP1 = ref<number | null>(null);
const selectedP2 = ref<number | null>(null);
const selectedP1CharacterId = ref<number | null>(null);
const selectedP2CharacterId = ref<number | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);

const showP1CharacterModal = ref(false);
const showP2CharacterModal = ref(false);

function restoreSelectionState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw) as Partial<StartPageSelectionState>;

    selectedP1.value = toNumberOrNull(saved.selectedP1);
    selectedP2.value = toNumberOrNull(saved.selectedP2);
    selectedP1CharacterId.value = toNumberOrNull(saved.selectedP1CharacterId);
    selectedP2CharacterId.value = toNumberOrNull(saved.selectedP2CharacterId);
  } catch (e) {
    console.error("開始画面の選択状態の復元に失敗しました", e);
  }
}

function saveSelectionState() {
  const payload: StartPageSelectionState = {
    selectedP1: selectedP1.value,
    selectedP2: selectedP2.value,
    selectedP1CharacterId: selectedP1CharacterId.value,
    selectedP2CharacterId: selectedP2CharacterId.value,
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function validateUserSelections() {
  const userIds = new Set(items.value.map((u) => Number(u.id)));

  if (selectedP1.value !== null && !userIds.has(selectedP1.value)) {
    selectedP1.value = null;
  }

  if (selectedP2.value !== null && !userIds.has(selectedP2.value)) {
    selectedP2.value = null;
  }

  if (
    selectedP1.value !== null &&
    selectedP2.value !== null &&
    selectedP1.value === selectedP2.value
  ) {
    selectedP2.value = null;
  }
}

function validateCharacterSelections() {
  const characterIds = new Set(characters.value.map((c) => Number(c.id)));

  if (
    selectedP1CharacterId.value !== null &&
    !characterIds.has(selectedP1CharacterId.value)
  ) {
    selectedP1CharacterId.value = null;
  }

  if (
    selectedP2CharacterId.value !== null &&
    !characterIds.has(selectedP2CharacterId.value)
  ) {
    selectedP2CharacterId.value = null;
  }
}

restoreSelectionState();

watch(
  [
    selectedP1,
    selectedP2,
    selectedP1CharacterId,
    selectedP2CharacterId,
  ],
  () => {
    saveSelectionState();
  }
);

onMounted(() => {
  fetchUsers();
  fetchCharacters();
});

async function fetchUsers() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/users");
    items.value = (res.data.items ?? []).map((u: any) => ({
      ...u,
      id: Number(u.id),
    }));
    validateUserSelections();
  } catch (e: any) {
    error.value =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "ユーザー取得に失敗しました";
  } finally {
    loading.value = false;
  }
}

async function fetchCharacters() {
  try {
    const res = await api.get("/characters");
    characters.value = (res.data.items ?? []).map((ch: any) => ({
      ...ch,
      id: Number(ch.id),
    }));
    validateCharacterSelections();
  } catch (e: any) {
    error.value =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "キャラクター取得に失敗しました";
  }
}

const p1Options = computed(() => {
  return items.value.filter((u) => u.id !== selectedP2.value);
});

const p2Options = computed(() => {
  return items.value.filter((u) => u.id !== selectedP1.value);
});

const player1Character = computed(() => {
  return (
    characters.value.find((c) => Number(c.id) === selectedP1CharacterId.value) ??
    null
  );
});

const player2Character = computed(() => {
  return (
    characters.value.find((c) => Number(c.id) === selectedP2CharacterId.value) ??
    null
  );
});

function selectCharacterForP1(character: Character) {
  selectedP1CharacterId.value = Number(character.id);
  showP1CharacterModal.value = false;
}

function selectCharacterForP2(character: Character) {
  selectedP2CharacterId.value = Number(character.id);
  showP2CharacterModal.value = false;
}

async function startBattle() {
  if (selectedP1.value === null || selectedP2.value === null) {
    alert("プレイヤーを選択してください");
    return;
  }

  if (selectedP1.value === selectedP2.value) {
    alert("同じユーザーは選べません");
    return;
  }

  if (
    selectedP1CharacterId.value === null ||
    selectedP2CharacterId.value === null
  ) {
    alert("キャラクターを選択してください");
    return;
  }

  const p1 = items.value.find((user) => user.id === selectedP1.value);
  const p2 = items.value.find((user) => user.id === selectedP2.value);

  const p1Character = characters.value.find(
    (c) => Number(c.id) === selectedP1CharacterId.value
  );
  const p2Character = characters.value.find(
    (c) => Number(c.id) === selectedP2CharacterId.value
  );

  if (!p1 || !p2 || !p1Character || !p2Character) {
    alert("ユーザーまたはキャラクター情報が見つかりません");
    return;
  }

  router.push({
    path: "/battle",
    query: {
      p1Id: String(p1.id),
      p2Id: String(p2.id),
      p1Name: p1.name,
      p2Name: p2.name,
      p1CharacterName: p1Character.name,
      p2CharacterName: p2Character.name,
      p1CharacterImage: p1Character.image ?? "",
      p2CharacterImage: p2Character.image ?? "",
    },
  });
}
async function startCpuBattle() {
  if (selectedP1.value === null) {
    alert("P1ユーザーを選択してください");
    return;
  }

  if (selectedP1CharacterId.value === null) {
    alert("P1キャラクターを選択してください");
    return;
  }

  const p1 = items.value.find((user) => user.id === selectedP1.value);
  const p1Character = characters.value.find(
    (c) => Number(c.id) === selectedP1CharacterId.value
  );

  const cpuCharacter =
    characters.value.find((c) => Number(c.id) === selectedP2CharacterId.value) ??
    null;

  if (!p1 || !p1Character) {
    alert("ユーザーまたはキャラクター情報が見つかりません");
    return;
  }

  router.push({
    path: "/battle",
    query: {
      mode: "cpu",
      p1Id: String(p1.id),
      p1Name: p1.name,
      p2Name: "CPU",
      p1CharacterName: p1Character.name,
      p2CharacterName: cpuCharacter?.name ?? "CPU",
      p1CharacterImage: p1Character.image ?? "",
      p2CharacterImage: cpuCharacter?.image ?? "",
    },
  });
}
</script>

<template>
  <div class="app">
    <h1>Gobolin Gobblers</h1>

    <div class="player-box p1-box">
      <label class="select-label" for="P1">P1ユーザー選択</label>
      <select id="P1" v-model.number="selectedP1" class="player-select">
        <option :value="null">選択してください</option>
        <option v-for="u in p1Options" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>

      <button class="Cselect" @click="showP1CharacterModal = true">
        キャラクター選択
      </button>

      <div v-if="player1Character" class="selected-character">
        <img
          :src="player1Character.image"
          :alt="player1Character.name"
          class="character-preview"
        />
        <p>{{ player1Character.name }}</p>
      </div>
    </div>

    <div class="player-box p2-box">
      <label class="select-label" for="P2">P2ユーザー選択</label>
      <select id="P2" v-model.number="selectedP2" class="player-select">
        <option :value="null">選択してください</option>
        <option v-for="u in p2Options" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>

      <button class="Cselect" @click="showP2CharacterModal = true">
        キャラクター選択
      </button>

      <div v-if="player2Character" class="selected-character">
        <img
          :src="player2Character.image"
          :alt="player2Character.name"
          class="character-preview"
        />
        <p>{{ player2Character.name }}</p>
      </div>
    </div>
<div class="bottom-buttons">
  <button @click="go('/result')">戦績表示</button>
  <button @click="startBattle">対戦開始</button>
  <button @click="startCpuBattle">CPU対戦開始</button>
  <button @click="go('/user')">ユーザー登録</button>
</div>

    <button class="back-mode-button" @click="go('/')">
      モード選択に戻る
    </button>

    <p v-if="error" class="error">{{ error }}</p>

    <div
      v-if="showP1CharacterModal"
      class="modal-overlay"
      @click.self="showP1CharacterModal = false"
    >
      <div class="modal">
        <h2>P1キャラクター選択</h2>
        <div class="character-grid">
          <button
            v-for="ch in characters"
            :key="ch.id"
            class="character-card"
            @click="selectCharacterForP1(ch)"
          >
            <img :src="ch.image" :alt="ch.name" class="character-image" />
            <p>{{ ch.name }}</p>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showP2CharacterModal"
      class="modal-overlay"
      @click.self="showP2CharacterModal = false"
    >
      <div class="modal">
        <h2>P2キャラクター選択</h2>
        <div class="character-grid">
          <button
            v-for="ch in characters"
            :key="ch.id"
            class="character-card"
            @click="selectCharacterForP2(ch)"
          >
            <img :src="ch.image" :alt="ch.name" class="character-image" />
            <p>{{ ch.name }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background:
    url("../assets/startpage.png") center center / 40% no-repeat,
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  position: relative;
  font-family: system-ui;
  overflow-x: hidden;
}

.app::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

h1 {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  margin: 0;
  color: #ffd27a;
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  text-shadow:
    0 0 4px #fff2b3,
    0 0 8px #13100b,
    0 0 16px #ff9f1c,
    0 0 28px #070606;
}

.player-box {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 240px;
}

.p1-box {
  top: 15%;
  left: 5%;
}

.p2-box {
  top: 15%;
  right: 5%;
}

.select-label {
  color: #ffdc9a;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.player-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.8);
  color: #ffdc9a;
  font-size: 16px;
  outline: none;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 180, 80, 0.18);
}

button {
  position: relative;
  z-index: 1;
  padding: 12px 20px;
  margin: 8px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.75);
  color: #ffdc9a;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 180, 80, 0.18);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

button:hover {
  background: rgba(70, 40, 15, 0.88);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(255, 190, 90, 0.35);
  transform: translateY(-2px);
}

.bottom-buttons {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  gap: 12px;
}

.back-mode-button {
  position: absolute;
  right: 40px;
  bottom: 40px;
  z-index: 1;
  margin: 0;
}

.error {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  color: #ff8a8a;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 10px;
  border-radius: 8px;
}

.selected-character {
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(20, 10, 5, 0.65);
  text-align: center;
  color: #ffdc9a;
}

.selected-character p {
  margin: 0;
}

.character-preview {
  width: 90px;
  height: 115px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  display: block;
  margin: 0 auto 8px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: min(900px, 92vw);
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(30, 18, 10, 0.96);
  border: 1px solid rgba(255, 204, 112, 0.45);
  border-radius: 18px;
  padding: 20px;
  color: #ffdc9a;
}

.modal h2 {
  margin-top: 0;
  text-align: center;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.character-card {
  margin: 0;
  padding: 12px;
  background: rgba(60, 35, 15, 0.8);
  border-radius: 14px;
}

.character-image {
  width: 100%;
  aspect-ratio: 0.8;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .app {
    min-height: 100dvh;
    padding:
      calc(env(safe-area-inset-top, 0px) + 14px)
      16px
      calc(env(safe-area-inset-bottom, 0px) + 18px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    background:
      url("../assets/startpage.png") center 108px / min(72vw, 300px) no-repeat,
      url("../assets/tavern-bg.png") center center / cover no-repeat;
  }

  h1 {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    width: 100%;
    font-size: 28px;
    line-height: 1.1;
    margin-top: 0;
    margin-bottom: 150px;
    padding-inline: 8px;
  }

  .player-box {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    width: min(100%, 360px);
    gap: 10px;
  }

  .p1-box,
  .p2-box {
    top: auto;
    left: auto;
    right: auto;
  }

  .select-label {
    font-size: 16px;
  }

  .player-select {
    font-size: 15px;
    padding: 11px 12px;
  }

  button {
    margin: 0;
    font-size: 15px;
    padding: 11px 14px;
  }

  .Cselect {
    width: 100%;
  }

  .selected-character {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    text-align: left;
    width: 100%;
    min-height: 104px;
  }

  .character-preview {
    width: 72px;
    height: 92px;
    margin: 0;
    flex-shrink: 0;
  }

  .bottom-buttons {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    width: min(100%, 360px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 2px;
  }

  .bottom-buttons button {
    width: 100%;
  }

  .bottom-buttons button:last-child {
    grid-column: 1 / -1;
  }

  .back-mode-button {
    position: relative;
    right: auto;
    bottom: auto;
    width: min(100%, 360px);
    margin-top: 0;
  }

  .error {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    width: min(100%, 360px);
    text-align: center;
  }

  .modal {
    width: min(92vw, 560px);
    max-height: 82dvh;
    padding: 16px;
  }

  .character-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .character-card {
    padding: 10px;
  }
}

@media (max-width: 430px) and (min-height: 850px) {
  .app {
    padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
    background:
      url("../assets/startpage.png") center 104px / min(70vw, 292px) no-repeat,
      url("../assets/tavern-bg.png") center center / cover no-repeat;
  }

  h1 {
    font-size: 26px;
    margin-bottom: 146px;
  }

  .player-box,
  .bottom-buttons,
  .back-mode-button,
  .error {
    width: min(100%, 352px);
  }
}

@media (max-width: 420px) {
  .app {
    padding:
      calc(env(safe-area-inset-top, 0px) + 12px)
      12px
      calc(env(safe-area-inset-bottom, 0px) + 16px);
  }

  h1 {
    font-size: 24px;
    margin-bottom: 136px;
  }

  .player-box,
  .bottom-buttons,
  .back-mode-button,
  .error {
    width: 100%;
  }

  .select-label {
    font-size: 15px;
  }

  .player-select,
  button {
    font-size: 14px;
  }

  .selected-character {
    padding: 10px;
    gap: 10px;
    min-height: 96px;
  }

  .character-preview {
    width: 64px;
    height: 82px;
  }

  .modal {
    padding: 14px;
  }

  .character-grid {
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .bottom-buttons {
    grid-template-columns: 1fr;
  }

  .bottom-buttons button:last-child {
    grid-column: auto;
  }
}
</style>