export type BattleSide = "self" | "opponent";

export type BattleCellView = {
  key: string;
  label: string;
  pieceCode?: string | null;
  owner?: BattleSide | null;
  highlighted?: boolean;
};

export type BattleHandPieceView = {
  pieceCode: string;
  label: string;
  count: number;
};

export type BattlePlayerView = {
  name: string;
  characterName: string;
  side: BattleSide;
};

export type BattleStatusView = {
  turnLabel: string;
  resultLabel: string | null;
  lastActionLabel: string | null;
};
