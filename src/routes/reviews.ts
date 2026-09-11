import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const reviewsRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("reviews");
  const featureCollection = db.collection("feature-review");

  // GET /api/reviews
  router.get("/", async (req: Request, res: Response) => {
    try {
      const reviews = await collection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        data: reviews,
      });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });
  // GET /api/reviews/insights
  router.get("/insights", async (req: Request, res: Response) => {
    try {
      // In a real DB scenario, we would aggregate the reviews collection.
      // For now, we return the mock structure the frontend expects.
      res.status(200).json({
        success: true,
        data: {
          highlights: [
            { icon: "Waves", title: "Beautiful Beaches", percentage: 96, color: "emerald" },
            { icon: "Sun", title: "Stunning Sunsets", percentage: 89, color: "gold" },
            { icon: "Utensils", title: "Fresh Seafood", percentage: 91, color: "emerald" },
            { icon: "Camera", title: "Scenic Photography", percentage: 87, color: "gold" },
          ],
          concerns: [
            { icon: "Users", title: "Peak-season Crowds", percentage: 32 },
            { icon: "Car", title: "Weekend Traffic", percentage: 28 },
            { icon: "Clock3", title: "Long Waiting Times", percentage: 19 },
            { icon: "CircleAlert", title: "Weather Changes", percentage: 16 },
          ],
          categories: [
            { label: "Overall Experience", score: 4.9 },
            { label: "Family Experience", score: 4.9 },
            { label: "Food & Dining", score: 4.7 },
            { label: "Transportation", score: 4.8 },
            { label: "Accommodation", score: 4.6 },
            { label: "Value for Money", score: 4.5 },
          ]
        }
      });
    } catch (error) {
      console.error("Failed to fetch review insights:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });
  // GET /api/reviews/featured
  router.get("/featured", async (req: Request, res: Response) => {
    try {
      const featuredReviews = await featureCollection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Featured reviews fetched successfully",
        data: featuredReviews,
      });
    } catch (error) {
      console.error("Failed to fetch featured reviews:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/reviews
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      data.date = new Date().toISOString();
      data.status = "Pending";
      
      const result = await collection.insertOne(data);
      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: { _id: result.insertedId, ...data },
      });
    } catch (error) {
      console.error("Failed to submit review:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/reviews/:id/status
  router.put("/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: `Review status updated to ${status}` });
    } catch (error) {
      console.error("Failed to update review status:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/reviews/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
      console.error("Failed to delete review:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
