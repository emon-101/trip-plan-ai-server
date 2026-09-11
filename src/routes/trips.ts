import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const tripsRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("trips");

  // GET /api/trips (Admin: all trips)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const trips = await collection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Trips fetched successfully",
        data: trips,
      });
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // GET /api/trips/user/:userId
  router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const trips = await collection.find({ userId }).toArray();
      res.status(200).json({
        success: true,
        message: "User trips fetched successfully",
        data: trips,
      });
    } catch (error) {
      console.error("Failed to fetch user trips:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/trips
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // If the trip comes with an existing ID from local storage, we might want to map it, 
      // but MongoDB requires _id to be an ObjectId if it generates it, or we can use string.
      // We will let MongoDB generate the _id, and we can keep a localId if needed.
      if (data.id && typeof data.id === "string") {
        data.localId = data.id;
        delete data.id;
      }
      
      data.createdAt = new Date().toISOString();
      
      const result = await collection.insertOne(data);
      res.status(201).json({
        success: true,
        message: "Trip saved successfully",
        data: { _id: result.insertedId, ...data },
      });
    } catch (error) {
      console.error("Failed to save trip:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/trips/:id
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      delete data._id; // prevent updating _id
      
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        // Fallback for custom string IDs
        query = { localId: id };
      }
      
      const result = await collection.updateOne(
        query,
        { $set: data }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: "Trip updated" });
    } catch (error) {
      console.error("Failed to update trip:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/trips/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        query = { localId: id };
      }
      
      const result = await collection.deleteOne(query);
      
      if (result.deletedCount === 0) {
        // Also try by localId if not found by _id
        const altResult = await collection.deleteOne({ localId: id });
        if (altResult.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Not Found" });
        }
      }
      
      res.status(200).json({ success: true, message: "Trip deleted" });
    } catch (error) {
      console.error("Failed to delete trip:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
