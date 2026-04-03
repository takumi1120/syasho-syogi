import type {
  SyahoShogiHandPieceType,
  SyahoShogiPiece,
} from "../../../lib/syahosyogi";

const PIECE_IMAGE_MAP: Record<
  "BOSS" | "SON" | "MIKITANI" | "MIZOGUCHI" | "MIKURU",
  string
> = {
  BOSS: "/battle/pieces/pin/boss.png",
  SON: "/battle/pieces/pin/son.png",
  MIKITANI: "/battle/pieces/pin/mikitani.png",
  MIZOGUCHI: "/battle/pieces/pin/mizoguchi.png",
  MIKURU: "/battle/pieces/pin/mikuru.png",
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