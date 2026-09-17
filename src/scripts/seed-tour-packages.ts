import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.DB_NAME;

if (!mongoUri || !databaseName) {
  throw new Error("MONGODB_URI and DB_NAME must be set before seeding tour packages.");
}

async function seedTourPackages() {
  const dataPath = resolve(process.cwd(), "src/data/tour-packages.json");
  const packages = JSON.parse(await readFile(dataPath, "utf8")) as Array<{
    slug: string;
    [key: string]: unknown;
  }>;

  const client = new MongoClient(mongoUri as string);

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("tour-packages");

    await collection.createIndex({ slug: 1 }, { unique: true });

    const result = await collection.bulkWrite(
      packages.map((tourPackage) => ({
        updateOne: {
          filter: { slug: tourPackage.slug },
          update: {
            $set: {
              ...tourPackage,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      }))
    );

    console.log(
      `Tour packages seeded: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`
    );
  } finally {
    await client.close();
  }
}

seedTourPackages().catch((error) => {
  console.error("Failed to seed tour packages:", error);
  process.exit(1);
});
