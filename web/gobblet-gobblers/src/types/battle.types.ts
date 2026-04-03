export type Player = 1 | 2;
export type PieceSize = 1 | 2 | 3;

export type Piece = {
    id: string;
    owner: Player;
    size: PieceSize;
};

export type Cell = Piece[];

export type ReserveSource = {
    type: "reserve";
    pieceId: string;
};

export type BoardSource = {
    type: "board";
    row: number;
    col: number;
    pieceId: string;
};

export type SelectedSource = ReserveSource | BoardSource | null;
export type Line = [number, number][];