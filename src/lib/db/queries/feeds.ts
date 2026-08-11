import { db } from "..";
import { feeds, users } from "../schema";

export type Feed = typeof feeds.$inferSelect; // feeds is the table object in schema.ts
export type User = typeof users.$inferSelect;

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id: user_id }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export function printFeed(feed: Feed, user: User) {
    console.log(`Feed: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${user.name}`);
}