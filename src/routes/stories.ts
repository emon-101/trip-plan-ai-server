import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const storiesRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("stories");

  // GET /api/stories (Admin: all stories or filtered by status)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const query = status ? { status } : {};
      const stories = await collection.find(query).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ success: true, data: stories });
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // GET /api/stories/user/:userId
  router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const stories = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ success: true, data: stories });
    } catch (error) {
      console.error("Failed to fetch user stories:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/stories
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = { ...req.body, status: "Pending", createdAt: new Date() };
      const result = await collection.insertOne(data);
      res.status(201).json({ success: true, data: { _id: result.insertedId, ...data } });
    } catch (error) {
      console.error("Failed to create story:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/stories/:id (Update status for moderation)
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({ success: false, message: "Story not found" });
        return;
      }
      res.status(200).json({ success: true, message: "Story updated" });
    } catch (error) {
      console.error("Failed to update story:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/stories/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await collection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: true, message: "Story deleted" });
    } catch (error) {
      console.error("Failed to delete story:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
