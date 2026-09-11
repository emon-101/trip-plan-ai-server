import { Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const getStories = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const stories = await db.collection("stories").find(query).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserStories = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stories = await db.collection("stories").find({ userId }).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    console.error("Failed to fetch user stories:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createStory = (db: Db) => async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, status: "Pending", createdAt: new Date() };
    const result = await db.collection("stories").insertOne(data);
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...data } });
  } catch (error) {
    console.error("Failed to create story:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateStoryStatus = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db.collection("stories").updateOne(
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
};

export const deleteStory = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("stories").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, message: "Story deleted" });
  } catch (error) {
    console.error("Failed to delete story:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
