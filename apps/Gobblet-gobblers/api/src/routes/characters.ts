import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

export type Character = {
    id: number;
    name: string;
    image: string | null;
};

export async function findAllCharacters(): Promise<Character[]> {
    return db.character.findMany({
        orderBy: { id: "asc" },
        select: {
            id: true,
            name: true,
            image: true,
        },
    });
}

router.get("/", async (_req, res) => {
    try {
        const items = await findAllCharacters();
        res.json({ items });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: {
                message: "キャラクター取得に失敗しました",
            },
        });
    }
});

export default router;
