import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { isNonEmptyString } from "../validate";
import { notFoundError, validationError } from "../lib/errors";

export type User = { id: number; name: string };

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const q = (req.query.q as string | undefined)?.trim();

    const items = await db.user.findMany({
        where: q
            ? {
                  name: {
                      contains: q,
                      mode: "insensitive",
                  },
              }
            : undefined,
        orderBy: { id: "asc" },
        select: {
            id: true,
            name: true,
        },
    });

    res.status(200).json({ items, page: 1, limit: 20, total: items.length });
});

router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const item = await db.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
        },
    });

    if (!item) return res.status(404).json(notFoundError("user not found"));

    res.status(200).json({ item: item satisfies User });
});

router.post("/user", async (req: Request, res: Response) => {
    const { name } = req.body ?? {};
    const details: { field: string; reason: string }[] = [];

    if (!isNonEmptyString(name)) details.push({ field: "name", reason: "required" });
    if (details.length) return res.status(400).json(validationError("invalid request", details));

    const item = await db.user.create({
        data: { name: name.trim() },
        select: {
            id: true,
            name: true,
        },
    });

    res.status(201).json({ item: item satisfies User });
});

router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};
    const details: { field: string; reason: string }[] = [];

    if (!isNonEmptyString(name)) details.push({ field: "name", reason: "required" });
    if (details.length) return res.status(400).json(validationError("invalid request", details));

    const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json(notFoundError("user not found"));

    const item = await db.user.update({
        where: { id },
        data: { name: name.trim() },
        select: {
            id: true,
            name: true,
        },
    });

    res.status(200).json({ item: item satisfies User });
});

router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json(notFoundError("user not found"));

    await db.user.delete({ where: { id } });
    res.status(204).send();
});

export default router;
