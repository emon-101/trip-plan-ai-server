import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const categoriesRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("TravelCategories");

  // GET /api/categories
  router.get("/", async (req: Request, res: Response) => {
    try {
      const categories = await collection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/categories
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const result = await collection.insertOne(data);
      res.status(201).json({
        success: true,
        message: "Category created",
        data: { _id: result.insertedId, ...data },
      });
    } catch (error) {
      console.error("Failed to create category:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/categories/:id
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
      
      res.status(200).json({ success: true, message: "Category updated" });
    } catch (error) {
      console.error("Failed to update category:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/categories/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
      console.error("Failed to delete category:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
