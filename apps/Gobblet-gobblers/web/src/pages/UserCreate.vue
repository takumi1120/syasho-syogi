<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../lib/api";
import goblinBar1 from "../assets/goblin-bar1.png";
import { useRouter } from "vue-router";


onMounted(() => {
  fetchUsers();
});
async function go(route: string){
        router.push(route);

}
type User = { id: number; name: string };
const router = useRouter();

const newName = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<User[]>([]);
const editingId = ref<number | null>(null);
const editingName = ref("");

async function fetchUsers() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/users");
    items.value = res.data.items ?? [];
  } catch (e: any) {
    error.value =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "通信に失敗しました";
  } finally {
    loading.value = false;
  }
}

async function addUser() {
  if (!newName.value.trim()) return;

  loading.value = true;
  error.value = null;

  try {
    await api.post("/users/user", {
      name: newName.value.trim(),
    });
    newName.value = "";
    await fetchUsers();
  } catch (e: any) {
    error.value =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "通信に失敗しました";
  } finally {
    loading.value = false;
  }
}

function startEdit(u: User) {
  editingId.value = u.id;
  editingName.value = u.name;
}

function cancelEdit() {
  editingId.value = null;
  editingName.value = "";
}

async function updateUser() {
  if (editingId.value == null) return;
  if (!editingName.value.trim()) return;

  loading.value = true;
  error.value = null;

  try {
    await api.put(`/users/${editingId.value}`, {
      name: editingName.value.trim(),
    });
    cancelEdit();
    await fetchUsers();
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ?? e?.message ?? "更新に失敗しました";
  } finally {
    loading.value = false;
  }
}

async function deleteUser(id: number) {
  loading.value = true;
  error.value = null;

  try {
    await api.delete(`/users/${id}`);
    await fetchUsers();
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ?? e?.message ?? "削除に失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="app" :style="{ backgroundImage: `url(${goblinBar1})` }">
    <header class="navbar">
      ユーザー登録
    </header>

    <main class="content">
      <div class="card">
        <div class="input-area">
          <input v-model="newName" placeholder="Enter name..." />
          <button @click="addUser">追加</button>
        </div>

        <ul>
          <li v-for="u in items" :key="u.id" class="item">
            <template v-if="editingId === u.id">
              <input v-model="editingName" />
              <button @click="updateUser">保存</button>
              <button @click="cancelEdit">キャンセル</button>
            </template>

            <template v-else>
              <span>{{ u.name }}</span>
              <div class="actions">
                <button @click="startEdit(u)">編集</button>
                <button class="danger" @click="deleteUser(u.id)">削除</button>
              </div>  
                 
            </template> 
           

          </li>
        </ul>
      </div>  
    </main>
   <div class="back-area">
  <button class="back" @click="go('/')">戻る</button>
</div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  font-family: system-ui;
}

.back {
  margin-right: 12px;
  background: transparent;
  border: 1px solid #ffcc70;
  color: #ffcc70;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.back:hover {
  background: rgba(255, 204, 112, 0.2);
}
.app::before {
  content: "";
  /* position: absolute; */
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
}

.navbar {
  position: relative;
  z-index: 1;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #ffcc70;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 10px #ffcc70;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.card {
  width: 420px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  padding: 20px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.input-area {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  outline: none;
}

button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #42b883;
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: 0.85;
}

button.danger {
  background: #ff5f5f;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.actions {
  display: flex;
  gap: 6px;
}
</style>