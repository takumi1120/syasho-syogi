import type { LocationQuery } from "vue-router";

export type BattleRouteQuery = {
  mode: "local" | "online";
  gameId: number | null;
  roomCode: string | null;
};

export function readBattleQuery(query: LocationQuery): BattleRouteQuery {
  const mode = query.mode === "online" ? "online" : "local";
  const gameId =
    typeof query.gameId === "string" && Number.isFinite(Number(query.gameId))
      ? Number(query.gameId)
      : null;
  const roomCode = typeof query.roomCode === "string" ? query.roomCode : null;

  return {
    mode,
    gameId,
    roomCode,
  };
}
