import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

type ResultStats = {
    userId: number;
    userName: string;
    totalWins: number;
    totalLoses: number;
    totalGames: number;
    winRate: number;
    rank: number | null;
};

function isPositiveInt(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function toWinRate(totalWins: number, totalGames: number) {
    if (totalGames <= 0) return 0;
    return Number(((totalWins / totalGames) * 100).toFixed(1));
}

async function buildResultStatsList(): Promise<ResultStats[]> {
    const [users, grouped] = await Promise.all([
        db.user.findMany({
            select: {
                id: true,
                name: true,
            },
        }),
        db.result.groupBy({
            by: ["userId"],
            _sum: {
                win: true,
                lose: true,
            },
        }),
    ]);

    const groupedMap = new Map<
        number,
        {
            totalWins: number;
            totalLoses: number;
            totalGames: number;
        }
    >();

    for (const row of grouped) {
        if (!isPositiveInt(row.userId)) continue;

        const totalWins = row._sum.win ?? 0;
        const totalLoses = row._sum.lose ?? 0;

        groupedMap.set(row.userId, {
            totalWins,
            totalLoses,
            totalGames: totalWins + totalLoses,
        });
    }

    const statsBase = users.map((user) => {
        const groupedRow = groupedMap.get(user.id);

        const totalWins = groupedRow?.totalWins ?? 0;
        const totalLoses = groupedRow?.totalLoses ?? 0;
        const totalGames = groupedRow?.totalGames ?? 0;

        return {
            userId: user.id,
            userName: user.name,
            totalWins,
            totalLoses,
            totalGames,
            winRate: toWinRate(totalWins, totalGames),
        };
    });

    const rankedUsers = statsBase
        .filter((item) => item.totalGames > 0)
        .sort((a, b) => {
            if (b.winRate !== a.winRate) return b.winRate - a.winRate;
            if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
            if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames;
            return a.userId - b.userId;
        })
        .map((item, index) => ({
            ...item,
            rank: index + 1,
        }));

    const unrankedUsers = statsBase
        .filter((item) => item.totalGames === 0)
        .sort((a, b) => a.userId - b.userId)
        .map((item) => ({
            ...item,
            rank: null,
        }));

    return [...rankedUsers, ...unrankedUsers];
}

/**
 * GET /results/stats
 * 全ユーザー戦績一覧
 */
router.get("/stats", async (_req, res) => {
    try {
        const stats = await buildResultStatsList();
        return res.json(stats);
    } catch (error) {
        console.error("GET /results/stats error", error);
        return res.status(500).json({ message: "failed to fetch result stats" });
    }
});

/**
 * GET /results/stats/:userId
 * 単一ユーザー戦績
 */
router.get("/stats/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ message: "invalid user id" });
        }

        const stats = await buildResultStatsList();
        const userStats = stats.find((item) => item.userId === userId);

        if (!userStats) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.json(userStats);
    } catch (error) {
        console.error("GET /results/stats/:userId error", error);
        return res.status(500).json({ message: "failed to fetch user result stats" });
    }
});

export default router;