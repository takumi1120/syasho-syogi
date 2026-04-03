import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

router.get("/stats", async (_req, res) => {
    try {
        const users = await db.user.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
            },
        });

        const results = await db.result.findMany({
            select: {
                userId: true,
                win: true,
                lose: true,
            },
        });

        const statsMap = new Map<number, { win_count: number; lose_count: number }>();

        for (const result of results) {
            if (result.userId == null) continue;

            const current = statsMap.get(result.userId) ?? {
                win_count: 0,
                lose_count: 0,
            };

            current.win_count += result.win;
            current.lose_count += result.lose;

            statsMap.set(result.userId, current);
        }

        const items = users
            .map((user) => {
                const stat = statsMap.get(user.id);

                return {
                    id: user.id,
                    name: user.name,
                    win_count: stat?.win_count ?? 0,
                    lose_count: stat?.lose_count ?? 0,
                };
            })
            .sort((a, b) => {
                if (b.win_count !== a.win_count) return b.win_count - a.win_count;
                if (a.lose_count !== b.lose_count) return a.lose_count - b.lose_count;
                return a.id - b.id;
            });

        res.json({ items });
    } catch (error) {
        console.error("stats error:", error);
        res.status(500).json({ message: "戦績取得に失敗しました" });
    }
});

router.post("/battle/result", async (req, res) => {
    try {
        const { winnerId, loserId } = req.body;

        if (typeof winnerId !== "number" || typeof loserId !== "number") {
            return res.status(400).json({
                message: "winnerId と loserId は数値で送ってください",
            });
        }

        if (winnerId === loserId) {
            return res.status(400).json({
                message: "winnerId と loserId には別のユーザーを指定してください",
            });
        }

        const users = await db.user.findMany({
            where: {
                id: {
                    in: [winnerId, loserId],
                },
            },
            select: { id: true },
        });

        if (users.length !== 2) {
            return res.status(404).json({
                message: "指定したユーザーが存在しません",
            });
        }
        console.log("インサート前")
        await db.$transaction([
            db.result.create({
                data: {
                    userId: winnerId,
                    win: 1,
                    lose: 0,
                },
            }),
            db.result.create({
                data: {
                    userId: loserId,
                    win: 0,
                    lose: 1,
                },
            }),
        ]);

        console.log("インサート後")
        res.status(201).json({
            message: "対戦結果を登録しました",
            winnerId,
            loserId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "対戦結果の登録に失敗しました" });
    }
});

export default router;