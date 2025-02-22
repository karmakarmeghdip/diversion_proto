import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "");

export async function connectToDatabase() {
  await client.connect();
  return client.db("yourmind_space");
}