import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * GET /users
 * ユーザー一覧取得
 */
router.get("/", async (_req, res) => {
    try {
        const users = await db.user.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
            },
        });

        return res.json(users);
    } catch (error) {
        console.error("GET /users error", error);
        return res.status(500).json({ message: "failed to fetch users" });
    }
});

/**
 * POST /users/register
 * ユーザー登録（同名がいればそのユーザーを返す）
 * body: { name: string }
 */
router.post("/register", async (req, res) => {
    try {
        const { name } = req.body as { name?: unknown };

        if (!isNonEmptyString(name)) {
            return res.status(400).json({ message: "name is required" });
        }

        const trimmedName = name.trim();

        const existingUser = await db.user.findFirst({
            where: { name: trimmedName },
            select: {
                id: true,
                name: true,
            },
        });

        if (existingUser) {
            return res.json({
                ...existingUser,
                created: false,
            });
        }

        const createdUser = await db.user.create({
            data: {
                name: trimmedName,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return res.status(201).json({
            ...createdUser,
            created: true,
        });
    } catch (error) {
        console.error("POST /users/register error", error);
        return res.status(500).json({ message: "failed to register user" });
    }
});

/**
 * GET /users/:id
 * 単体ユーザー取得
 */
router.get("/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ message: "invalid user id" });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error("GET /users/:id error", error);
        return res.status(500).json({ message: "failed to fetch user" });
    }
});

export default router;