import { Router, Request, Response } from "express";
import { Db } from "mongodb";
import { destinations, hotels } from "../data/hotels";

export const hotelsRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("hotels");
  const destCollection = db.collection("destinations");

  // GET /api/hotels
  router.get("/", async (req: Request, res: Response) => {
    try {
      // For now, return the mock data directly as requested to replace client-side mock
      // In a real DB scenario, we would do:
      // const h = await collection.find().toArray();
      // const d = await destCollection.find().toArray();
      
      res.status(200).json({
        success: true,
        data: {
          destinations,
          hotels
        }
      });
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
