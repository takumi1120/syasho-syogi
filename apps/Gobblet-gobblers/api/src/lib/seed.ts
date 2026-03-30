import { db } from "./db";

export async function seedDemoUser() {
    const name = "Demo";

    const exists = await db.user.findFirst({
        where: { name },
        select: { id: true },
    });
    if (exists) return;

    await db.user.create({
        data: { name },
    });

    console.log("[seed] demo user inserted");
}
