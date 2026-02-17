import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const options = sqliteTable("options", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    label: text("label").notNull(),
    money: integer("money").notNull(),
    energy: integer("energy").notNull(),
    rep: integer("rep").notNull(),
});

export const questions = sqliteTable("questions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text("text").notNull(),
    optionAId: integer("option_a_id").references(() => options.id),
    optionBId: integer("option_b_id").references(() => options.id),
    correctOption: text("correct_option").notNull(),
});

export const leaderboard = sqliteTable("leaderboard", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    score: integer("score").notNull(),
});
