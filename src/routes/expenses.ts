import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const expensesRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("expenses");

  // GET /api/expenses/trip/:tripId
  router.get("/trip/:tripId", async (req: Request, res: Response) => {
    try {
      const { tripId } = req.params;
      const expenses = await collection.find({ tripId }).toArray();
      res.status(200).json({ success: true, data: expenses });
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // POST /api/expenses
  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const result = await collection.insertOne(data);
      res.status(201).json({ success: true, data: { _id: result.insertedId, ...data } });
    } catch (error) {
      console.error("Failed to create expense:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/expenses/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await collection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: true, message: "Expense deleted" });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
