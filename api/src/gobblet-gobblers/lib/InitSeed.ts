import { db } from "./db";

const CHARACTER_SEEDS = [
    { name: "スティーブ・ジョブズ", image: "/characters/steve-jobs.png" },
    { name: "Kプラチナム代表", image: "/characters/KCEO.png" },
    { name: "イーロンマスク", image: "/characters/Elon.png" },
    { name: "ビルゲイツ", image: "/characters/bil.png" },
] as const;

export async function seedCharacters(): Promise<void> {
    await Promise.all(
        CHARACTER_SEEDS.map((seed) =>
            db.character.upsert({
                where: { name: seed.name },
                update: { image: seed.image },
                create: { name: seed.name, image: seed.image },
            }),
        ),
    );

    console.log("characters seeded");
}