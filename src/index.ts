import "dotenv/config";
import express, { Request, Response } from "express";
import { MongoClient, Db } from "mongodb";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = process.env.DB_NAME as string;

app.use(cors());
app.use(express.json());

let db: Db;

app.get("/", (_req: Request, res: Response) => {
  res.json('foo, bar! updated V2');
});
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", db: db ? "connected" : "disconnected" });
});
app.get("/api/ck", (_req: Request, res: Response) => {
  res.json({ status: "ok", db: db ? "chandan connected" : "chandan disconnected" });
});

// Endpoint to fetch travel categories
app.get("/api/travel-categories", async (_req: Request, res: Response) => {
  try {
    const travelCategories = await db
      .collection("TravelCategories")
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Travel categories fetched successfully",
      data: travelCategories,
    });
  } catch (error) {
    console.error("Failed to fetch travel categories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch travel categories",
    });
  }
});

// endpoint to fetch users
app.get("/api/users", async (_req: Request, res: Response) => {
  try {

    if (!db) {
      return res.status(500).json({ success: false, message: "Database not ready" });
    }

    // const usersCollection = db.collection("user");
    const users = await db.collection("user").find().toArray();
    console.log(users);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// endpoint to fetch featured reviews
app.get("/api/featured-reviews", async (_req: Request, res: Response) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, message: "Database not ready" });
    }

    const featuredReviews = await db
      .collection("feature-review")
      .find()
      .toArray();

    res.status(200).json({
      success: true,
      message: "Featured reviews fetched successfully",
      data: featuredReviews,
    });
  } catch (error) {
    console.error("Failed to fetch featured reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured reviews",
    });
  }
});


async function start() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();