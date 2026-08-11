import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";
import { UUID } from "node:crypto";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result; 
}

export async function resetUsers() {
  const [result] = await db.delete(users);
  return result;
}

export async function getUsers() {
  const result = await db.select({field1: users.name}).from(users);
  return result;
}