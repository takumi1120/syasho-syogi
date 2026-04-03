import type { OnlineLobbyState, OnlineLobbyStatus } from "../types/onlineLobby";

export type OnlineLobbyQuery = {
  roomCode: string;
  status: OnlineLobbyStatus;
};

export function createOnlineLobbyQuery(
  state: Partial<OnlineLobbyState> = {},
): OnlineLobbyQuery {
  return {
    roomCode: state.roomCode ?? "",
    status: state.status ?? "idle",
  };
}
