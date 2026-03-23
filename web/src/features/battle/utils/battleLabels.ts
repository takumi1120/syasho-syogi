// src/features/battle/utils/battleLabels.ts
export function getPieceLabel(piece: {
  type: "BOSS" | "SON" | "MIKITANI" | "MIZOGUCHI" | "MIKURU";
  characterName?: string | null;
}) {
  switch (piece.type) {
    case "BOSS":
      return piece.characterName?.trim() || "社長";
    case "SON":
      return "SON";
    case "MIKITANI":
      return "MIKITANI";
    case "MIZOGUCHI":
      return "MIZOGUCHI";
    case "MIKURU":
      return "MIKURU";
  }
}

export function getHandLabel(pieceType: "SON" | "MIKITANI" | "MIZOGUCHI") {
  switch (pieceType) {
    case "SON":
      return "SON";
    case "MIKITANI":
      return "MIKITANI";
    case "MIZOGUCHI":
      return "MIZOGUCHI";
  }
}