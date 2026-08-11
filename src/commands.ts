import { url } from "node:inspector";
import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { createFeed, printFeed } from "./lib/db/queries/feeds";
import { createUser, getUser, getUsers, resetUsers } from "./lib/db/queries/users";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

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

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    const name = args[0];
    const url = args[1];
    const cfg = readConfig();
    const user = await getUser(cfg.currentUserName);
    const feed = await createFeed(name, url, user.id);
    printFeed(feed, user);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    await registry[cmdName](cmdName, ...args);
}

