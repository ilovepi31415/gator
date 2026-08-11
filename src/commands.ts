import { url } from "node:inspector";
import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { createFeed, createFeedFollow, getFeedByUrl, getFeeds, getFeedsFollowedByUser, printFeed, unfollow, User } from "./lib/db/queries/feeds";
import { createUser, getUser, getUserById, getUsers, resetUsers } from "./lib/db/queries/users";
import { UUID } from "node:crypto";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
            const cfg = readConfig();
        const user = await getUser(cfg.currentUserName);
        if (!user) {
            throw new Error(`User ${cfg.currentUserName} not found`);
        }
        await handler(cmdName, user, ...args);
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("Username argument expected");
    }
    const name = args[0];
    if (cmdName == "login") {
        const response = await getUser(name);
        if (!response) {
            throw new Error("User does not exist");
        }
        setUser(name);
        console.log(`User ${name} logged in`);
    }
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("Username argument expected");
    }
    const name = args[0]
    if (cmdName == "register") {
        const response = await getUser(name);
        if (response) {
            throw new Error("User already exists")
        }
        await createUser(name);
        console.log(`User ${name} created`);
        const data = await getUser(name);
        console.log(data);
        await handlerLogin("login", ...args);
    }
}

export async function handlerReset(cmdName: string) {
    await resetUsers();
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers();
    const cfg = await readConfig();
    const curr = cfg.currentUserName;
    users.forEach((field) => {
        const user = field.field1;
        if (user == curr) {
            console.log(`* ${user} (current)`)
        } else {
            console.log(`* ${user}`);
        }
    });
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    const response = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(response));
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    // Get current user
    const name = args[0];
    const url = args[1];

    // Create feed and record following
    const feed = await createFeed(name, url, user.id);
    const followed_feed = await createFeedFollow(feed, user);
    printFeed(followed_feed.feeds, followed_feed.users);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();
    for (const feed of feeds) {
        console.log(`Feed: ${feed.name}`);
        console.log(` - url: ${feed.url}`);
        const user = await getUserById(feed.user_id);
        console.log(` - created by: ${user.name}`);
    };
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    const url = args[0];
    const feed = await getFeedByUrl(url);
    const response = await createFeedFollow(feed, user);
    console.log(`User ${response.users.name} followed Feed ${response.feeds.name}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    // Query feeds based on current user
    const feeds_followed = await getFeedsFollowedByUser(user);
    
    // Display results
    console.log("Following feeds:")
    for (const feed of feeds_followed) {
        console.log(` - ${feed.feeds.name}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    const feedUrl = args[0];
    const feed = await getFeedByUrl(feedUrl);
    await unfollow(feed, user);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    await registry[cmdName](cmdName, ...args);
}

