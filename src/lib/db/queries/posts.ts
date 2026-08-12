import { eq, and, sql } from "drizzle-orm";
import { db } from "..";
import { feed_follows, posts } from "../schema";
import { User } from "./feeds";

export type Post = typeof posts.$inferSelect;

export async function createPost(title: string, description: string | null, url: string, feed_id: string, pubDate: string) {
    try {
        const [result] = await db.insert(posts).values({ title: title, description: description, url: url, feed_id: feed_id, publishedAt: new Date(pubDate) }).returning();
        return result;
    } catch (error) {
        console.log(`Post at ${url} already exists`);
    }
}

export async function getPostsForUser(user: User, amt: number) {
    const results = await db.select().from(posts).innerJoin(feed_follows, eq(feed_follows.feed_id, posts.feed_id)).where(eq(feed_follows.user_id, user.id)).orderBy(sql`${posts.publishedAt} DESC NULLS LAST`).limit(amt);
    return results;
}