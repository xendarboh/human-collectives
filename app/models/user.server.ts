import { db } from "~/db.server";

export type User = {
  id: number;
  bioid: string;
};

export const createUser = async (
  user: Omit<User, "id">
): Promise<User | null> => {
  const res = await db.insert(user, ["id"]).into("users");
  return !res.length ? null : res[0];
};

export const deleteUser = async (query: Partial<User>) =>
  await db("users").where(query).del();

export const getUsers = async (): Promise<User[]> =>
  await db.select("id", "bioid").from<User>("users");

export const getUser = async (query: Partial<User>): Promise<User | null> => {
  const res = await db.select("id", "bioid").from<User>("users").where(query);
  return !res.length ? null : res[0];
};
