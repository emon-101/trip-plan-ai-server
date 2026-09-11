import "dotenv/config";
import express, { Request, Response } from "express";
import { MongoClient, Db } from "mongodb";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";

import { destinationsRouter } from "./routes/destinations";
import { reviewsRouter } from "./routes/reviews";
import { tripsRouter } from "./routes/trips";
import { categoriesRouter } from "./routes/categories";
import { bookmarksRouter } from "./routes/bookmarks";
import { usersRouter } from "./routes/users";
import { statsRouter } from "./routes/stats";
import { expensesRouter } from "./routes/expenses";
import { storiesRouter } from "./routes/stories";
import { settingsRouter } from "./routes/settings";
import { hotelsRouter } from "./routes/hotels";
import { foodRouter } from "./routes/food";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = process.env.DB_NAME as string;

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow any origin in development
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log("[Request]", req.method, req.url, req.originalUrl);
  next();
});

const authHandler = toNodeHandler(auth);

app.all("/api/auth/*path", async (req, res, next) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("[Better Auth Error]", error);
    next(error);
  }
});

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

// Mount routers
app.use("/api/destinations", (req, res, next) => destinationsRouter(db)(req, res, next));
app.use("/api/reviews", (req, res, next) => reviewsRouter(db)(req, res, next));
app.use("/api/trips", (req, res, next) => tripsRouter(db)(req, res, next));
app.use("/api/travel-categories", (req, res, next) => categoriesRouter(db)(req, res, next));
app.use("/api/bookmarks", (req, res, next) => bookmarksRouter(db)(req, res, next));
app.use("/api/users", (req, res, next) => usersRouter(db)(req, res, next));
app.use("/api/stats", (req, res, next) => statsRouter(db)(req, res, next));
app.use("/api/expenses", (req, res, next) => expensesRouter(db)(req, res, next));
app.use("/api/stories", (req, res, next) => storiesRouter(db)(req, res, next));
app.use("/api/settings", (req, res, next) => settingsRouter(db)(req, res, next));
app.use("/api/hotels", (req, res, next) => hotelsRouter(db)(req, res, next));
app.use("/api/food", (req, res, next) => foodRouter(db)(req, res, next));

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
