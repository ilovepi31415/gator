import { eq, and, sql } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";

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

export async function getFeedsFollowedByUser(user: User) {
    const result = await db.select().from(feed_follows)
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .where(eq(feed_follows.user_id, user.id));
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export function printFeed(feed: Feed, user: User) {
    console.log(`Feed: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${user.name}`);
}

export async function createFeedFollow(feed: Feed, user: User) {
    const [newFeedFollow] = await db.insert(feed_follows).values({
        feed_id: feed.id,
        user_id: user.id,
    }).returning();
    const [result] = await db.select().from(feed_follows)
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .where(eq(feed_follows.id, newFeedFollow.id));
    return result;
}

export async function unfollow(feed: Feed, user: User) {
    await db.delete(feed_follows).where(and(eq(feed_follows.feed_id, feed.id), eq(feed_follows.user_id, user.id)));
}

export async function markFeedFetched(feed: Feed) {
    await db.update(feeds).set({ last_fetched_at: new Date(), updatedAt: new Date()}).where(eq(feeds.id, feed.id));
}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`${feeds.last_fetched_at} ASC NULLS FIRST`).limit(1);
    return result;
}