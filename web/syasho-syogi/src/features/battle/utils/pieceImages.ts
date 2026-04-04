import type {
  SyahoShogiHandPieceType,
  SyahoShogiPiece,
} from "../../../lib/syahosyogi";

const BASE = import.meta.env.BASE_URL;

const PIECE_IMAGE_MAP: Record<
  "BOSS" | "SON" | "MIKITANI" | "MIZOGUCHI" | "MIKURU",
  string
> = {
  BOSS: `${BASE}battle/pieces/pin/boss.png`,
  SON: `${BASE}battle/pieces/pin/son.png`,
  MIKITANI: `${BASE}battle/pieces/pin/mikitani.png`,
  MIZOGUCHI: `${BASE}battle/pieces/pin/mizoguchi.png`,
  MIKURU: `${BASE}battle/pieces/pin/mikuru.png`,
};

export function getPieceImageSrc(piece: SyahoShogiPiece): string {
  if (piece.type === "BOSS") {
    const customImage = piece.characterImage?.trim();
    if (customImage) {
      return customImage;
    }
  }

  return PIECE_IMAGE_MAP[piece.type];
}

export function getHandPieceImageSrc(
  pieceType: SyahoShogiHandPieceType,
): string {
  return PIECE_IMAGE_MAP[pieceType];
}