export type OnlineLobbyStatus = "idle" | "creating" | "waiting" | "ready" | "error";

export type OnlineLobbyState = {
  roomCode: string;
  status: OnlineLobbyStatus;
  memberNames: string[];
  errorMessage: string | null;
};
