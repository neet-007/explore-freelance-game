import { db } from "./index";
import { questions, options } from "./schema";

async function seed() {
    console.log("Environment: Seeding local database...");

    const insertedOptions = await db.insert(options).values([
        { label: "Accept (Great for Rep)", money: 0, energy: -10, rep: 5 },
        { label: "Decline (Save Energy)", money: 0, energy: 0, rep: -2 },
        { label: "Work through the night", money: 200, energy: -40, rep: 5 },
        { label: "Go to sleep", money: 0, energy: 20, rep: 0 },
    ]).returning();

    await db.insert(questions).values([
        {
            text: "A client wants a logo for 'Exposure' only. No pay.",
            optionAId: insertedOptions[0].id,
            optionBId: insertedOptions[1].id,
            correctOption: "A",
        },
        {
            text: "It's 11 PM. A rush job worth $200 just came in!",
            optionAId: insertedOptions[2].id,
            optionBId: insertedOptions[3].id,
            correctOption: "B",
        }
    ]);

    console.log("Seeding complete!");
}

seed();
