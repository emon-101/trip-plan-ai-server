import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const destinationsRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("destinations");

  // GET /api/destinations
  router.get("/", async (req: Request, res: Response) => {
    try {
      const destinations = await collection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Destinations fetched successfully",
        data: destinations,
      });
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // GET /api/destinations/:slug
  router.get("/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const destination = await collection.findOne({ slug });
      if (!destination) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      res.status(200).json({
        success: true,
        data: destination,
      });
    } catch (error) {
      console.error("Failed to fetch destination:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/destinations
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const result = await collection.insertOne(data);
      res.status(201).json({
        success: true,
        message: "Destination created",
        data: { _id: result.insertedId, ...data },
      });
    } catch (error) {
      console.error("Failed to create destination:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/destinations/:id
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      delete data._id; // prevent updating _id
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: "Destination updated" });
    } catch (error) {
      console.error("Failed to update destination:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/destinations/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: "Destination deleted" });
    } catch (error) {
      console.error("Failed to delete destination:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
