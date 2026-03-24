import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { roomService, type Room } from "../../../services/roomService";
import { userService, type User } from "../../../services/userServices";

function readStringQuery(route: ReturnType<typeof useRoute>, keys: string[]): string {
  for (const key of keys) {
    const value = route.query[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return "";
}

function readNumberQuery(route: ReturnType<typeof useRoute>, keys: string[]): number | null {
  for (const key of keys) {
    const value = route.query[key];
    const num = Number(value);
    if (Number.isInteger(num) && num > 0) return num;
  }
  return null;
}

export function useOnlineLobby() {
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const loadingUsers = ref(false);
  const message = ref("");
  const errorMessage = ref("");
  const room = ref<Room | null>(null);
  const roomCodeInput = ref("");
  const pollingId = ref<ReturnType<typeof window.setInterval> | null>(null);

  const users = ref<User[]>([]);
  const selectedLobbyUserId = ref("");

  const userId = computed(() => {
    const fromQuery = readNumberQuery(route, ["userId", "playerId", "selectedUserId", "p1Id"]);
    if (fromQuery) return fromQuery;

    const fromStorage = Number(localStorage.getItem("onlineUserId"));
    return Number.isInteger(fromStorage) && fromStorage > 0 ? fromStorage : null;
  });

  const userName = computed(() => {
    const fromQuery = readStringQuery(route, ["userName", "playerName", "selectedUserName", "p1Name"]);
    if (fromQuery) return fromQuery;

    return localStorage.getItem("onlineUserName")?.trim() || "ゲスト";
  });

  const selectedCharacter = computed(() => {
    const fromQuery = readStringQuery(route, [
      "character",
      "selectedCharacter",
      "playerCharacter",
      "p1Character",
    ]);
    if (fromQuery) return fromQuery;

    return localStorage.getItem("onlineCharacter")?.trim() || "";
  });

  watch(
    [userId, userName, selectedCharacter],
    ([id, name, character]) => {
      if (id) localStorage.setItem("onlineUserId", String(id));
      if (name) localStorage.setItem("onlineUserName", name);
      if (character) localStorage.setItem("onlineCharacter", character);
    },
    { immediate: true }
  );

  watch(
    userId,
    (id) => {
      selectedLobbyUserId.value = id ? String(id) : "";
    },
    { immediate: true }
  );

  const isHost = computed(() => room.value?.hostUserId === userId.value);
  const isGuest = computed(() => room.value?.guestUserId === userId.value);
  const isMember = computed(() => isHost.value || isGuest.value);

  const myReady = computed(() => {
    if (!room.value || !userId.value) return false;
    if (room.value.hostUserId === userId.value) return room.value.hostReady;
    if (room.value.guestUserId === userId.value) return room.value.guestReady;
    return false;
  });

  const opponentReady = computed(() => {
    if (!room.value || !userId.value) return false;
    if (room.value.hostUserId === userId.value) return room.value.guestReady;
    if (room.value.guestUserId === userId.value) return room.value.hostReady;
    return false;
  });

  const statusLabel = computed(() => {
    switch (room.value?.status) {
      case "OPEN":
        return "募集中";
      case "MATCHED":
        return "対戦相手が参加中";
      case "PLAYING":
        return "対局中";
      case "CLOSED":
        return "クローズ";
      default:
        return "未参加";
    }
  });

  const currentUserSummary = computed<User | null>(() => {
    const found = users.value.find((user) => user.id === userId.value);
    if (found) return found;

    if (!userId.value) return null;

    return {
      id: userId.value,
      name: userName.value,
    };
  });

  const canCreateRoom = computed(() => !!userId.value && !loading.value);
  const canJoinRoom = computed(() => !!userId.value && roomCodeInput.value.trim().length >= 4 && !loading.value);
  const canToggleReady = computed(() => {
    return !!room.value && isMember.value && room.value.status !== "PLAYING" && room.value.status !== "CLOSED" && !loading.value;
  });
  const canStartGame = computed(() => {
    return (
      !!room.value &&
      isHost.value &&
      !!room.value.guestUserId &&
      room.value.hostReady &&
      room.value.guestReady &&
      room.value.status !== "PLAYING" &&
      room.value.status !== "CLOSED" &&
      !loading.value
    );
  });

  const canChangeLobbyUser = computed(() => {
    return !loading.value && !loadingUsers.value && !isMember.value;
  });

  function setMessage(text = "") {
    message.value = text;
    errorMessage.value = "";
  }

  function setError(text = "") {
    errorMessage.value = text;
    message.value = "";
  }

  function clearNotices() {
    message.value = "";
    errorMessage.value = "";
  }

  async function fetchUsersList() {
    loadingUsers.value = true;

    try {
      const fetched = await userService.getUsers();
      users.value = fetched;

      if (userId.value && !fetched.some((user) => user.id === userId.value)) {
        users.value = [
          {
            id: userId.value,
            name: userName.value,
          },
          ...fetched,
        ];
      }
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "ユーザー一覧の取得に失敗しました";
      setError(text);
    } finally {
      loadingUsers.value = false;
    }
  }

  function updateSelectedLobbyUserId(value: string) {
    selectedLobbyUserId.value = value;
  }

  async function applySelectedLobbyUser() {
    if (isMember.value) {
      setError("部屋参加中はユーザー変更できません。先に退出してください。");
      return;
    }

    const nextUserId = Number(selectedLobbyUserId.value);
    if (!Number.isInteger(nextUserId) || nextUserId <= 0) {
      setError("変更するユーザーを選択してください。");
      return;
    }

    const nextUser = users.value.find((user) => user.id === nextUserId);
    if (!nextUser) {
      setError("選択したユーザーが見つかりません。");
      return;
    }

    localStorage.setItem("onlineUserId", String(nextUser.id));
    localStorage.setItem("onlineUserName", nextUser.name);

    await router.replace({
      path: route.path,
      query: {
        ...route.query,
        userId: String(nextUser.id),
        userName: nextUser.name,
      },
    });

    setMessage(`使用ユーザーを「${nextUser.name}」に変更しました`);
  }

  async function refreshRoom(code?: string) {
    const targetCode = (code || room.value?.roomCode || roomCodeInput.value).trim().toUpperCase();
    if (!targetCode) return;

    try {
      const latest = await roomService.getRoom(targetCode);
      room.value = latest;
      roomCodeInput.value = latest.roomCode;

      if (latest.status === "PLAYING" && latest.gameId) {
        goToBattle(latest.gameId, latest.roomCode);
      }
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "部屋情報の取得に失敗しました";
      setError(text);
    }
  }

  function startPolling() {
    stopPolling();
    pollingId.value = window.setInterval(() => {
      const code = room.value?.roomCode || roomCodeInput.value.trim().toUpperCase();
      if (!code) return;
      refreshRoom(code);
    }, 2500);
  }

  function stopPolling() {
    if (pollingId.value !== null) {
      window.clearInterval(pollingId.value);
      pollingId.value = null;
    }
  }

  async function copyRoomCode() {
    if (!room.value?.roomCode) return;

    try {
      await navigator.clipboard.writeText(room.value.roomCode);
      setMessage(`ルームコード ${room.value.roomCode} をコピーしました`);
    } catch {
      setError("ルームコードのコピーに失敗しました");
    }
  }

  function goToBattle(gameId: number, roomCode: string) {
    router.push({
      path: "/onlinebattle",
      query: {
        gameId: String(gameId),
        roomCode,
        userId: userId.value ? String(userId.value) : "",
      },
    });
  }

  async function handleCreateRoom() {
    if (!userId.value) {
      setError("ユーザー情報がありません。スタート画面から入り直してください。");
      return;
    }

    loading.value = true;
    clearNotices();

    try {
      const created = await roomService.createRoom({
        hostUserId: userId.value,
        hostCharacter: selectedCharacter.value || undefined,
      });

      room.value = created;
      roomCodeInput.value = created.roomCode;
      setMessage(`ルームを作成しました。コード: ${created.roomCode}`);
      startPolling();
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "部屋作成に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  async function handleJoinRoom() {
    if (!userId.value) {
      setError("ユーザー情報がありません。スタート画面から入り直してください。");
      return;
    }

    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code) {
      setError("ルームコードを入力してください。");
      return;
    }

    loading.value = true;
    clearNotices();

    try {
      const joined = await roomService.joinRoom({
        roomCode: code,
        guestUserId: userId.value,
        guestCharacter: selectedCharacter.value || undefined,
      });

      room.value = joined;
      roomCodeInput.value = joined.roomCode;
      setMessage(`ルーム ${joined.roomCode} に参加しました`);
      startPolling();
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "部屋参加に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  async function handleSearchRoom() {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code) {
      setError("ルームコードを入力してください。");
      return;
    }

    loading.value = true;
    clearNotices();

    try {
      const fetched = await roomService.getRoom(code);
      room.value = fetched;
      roomCodeInput.value = fetched.roomCode;
      setMessage(`ルーム ${fetched.roomCode} を取得しました`);
      startPolling();
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "部屋取得に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  async function handleToggleReady() {
    if (!room.value || !userId.value) return;

    loading.value = true;
    clearNotices();

    try {
      const updated = await roomService.updateReady({
        roomCode: room.value.roomCode,
        userId: userId.value,
        ready: !myReady.value,
      });

      room.value = updated;
      setMessage(
        updated.hostReady || updated.guestReady
          ? "準備状態を更新しました"
          : "準備を解除しました"
      );
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "ready 更新に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  async function handleStartGame() {
    if (!room.value) return;

    loading.value = true;
    clearNotices();

    try {
      const result = await roomService.startGame(room.value.roomCode);
      room.value = result.room;
      setMessage("ゲームを開始します");
      goToBattle(result.game.id, result.room.roomCode);
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "ゲーム開始に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  async function handleLeaveRoom() {
    if (!room.value || !userId.value) return;

    loading.value = true;
    clearNotices();

    try {
      await roomService.leaveRoom({
        roomCode: room.value.roomCode,
        userId: userId.value,
      });

      const oldCode = room.value.roomCode;
      room.value = null;
      roomCodeInput.value = "";
      stopPolling();
      setMessage(`ルーム ${oldCode} から退出しました`);
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "退出に失敗しました";
      setError(text);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchUsersList();

    const initialCode = readStringQuery(route, ["roomCode"]);
    if (initialCode) {
      roomCodeInput.value = initialCode.toUpperCase();
      refreshRoom(initialCode);
      startPolling();
    }
  });

  onBeforeUnmount(() => {
    stopPolling();
  });

  return {
    loading,
    loadingUsers,
    message,
    errorMessage,
    room,
    roomCodeInput,

    users,
    selectedLobbyUserId,
    currentUserSummary,

    userId,
    userName,
    selectedCharacter,

    isHost,
    isGuest,
    isMember,
    myReady,
    opponentReady,

    statusLabel,
    canCreateRoom,
    canJoinRoom,
    canToggleReady,
    canStartGame,
    canChangeLobbyUser,

    fetchUsersList,
    updateSelectedLobbyUserId,
    applySelectedLobbyUser,

    copyRoomCode,
    handleCreateRoom,
    handleJoinRoom,
    handleSearchRoom,
    handleToggleReady,
    handleStartGame,
    handleLeaveRoom,
  };
}