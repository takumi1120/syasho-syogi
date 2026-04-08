import { db } from "./db";

const CHARACTER_SEEDS = [
    { name: "スティーブ・ジョブズ", image: "/gobblet-gobblers/characters/steve-jobs.png" },
    { name: "Kプラチナム代表", image: "/gobblet-gobblers/characters/KCEO.png" },
    { name: "イーロンマスク", image: "/gobblet-gobblers/characters/Elon.png" },
    { name: "ビルゲイツ", image: "/gobblet-gobblers/characters/bil.png" },
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