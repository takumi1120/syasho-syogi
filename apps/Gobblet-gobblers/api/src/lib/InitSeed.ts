import { db } from "./db";

export async function seedCharacters(): Promise<void> {
    await db.character.createMany({
        data: [
            { name: "スティーブ・ジョブズ", image: "/characters/steve-jobs.png" },
            { name: "Kプラチナム代表", image: "/characters/KCEO.png" },
            { name: "イーロンマスク", image: "/characters/Elon.png" },
            { name: "ビルゲイツ", image: "/characters/bil.png" },
        ],
        skipDuplicates: true,
    });

    console.log("characters seeded");
}