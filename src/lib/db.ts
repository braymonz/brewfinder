import mongoose, { Mongoose } from "mongoose";

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

globalWithMongoose.mongoose ??= { conn: null, promise: null };

const cached = globalWithMongoose.mongoose;

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: process.env.MONGODB_DB_NAME,
  });

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getConnectionDBClient(): Promise<mongoose.mongo.MongoClient> {
  const connection = await connectToDatabase();
  return connection.connection.getClient();
}