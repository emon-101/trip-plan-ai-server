import { Router, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const usersRouter = (db: Db) => {
  const router = Router();
  const collection = db.collection("user"); // better-auth default collection name is "user"

  // GET /api/users
  router.get("/", async (req: Request, res: Response) => {
    try {
      const users = await collection.find().toArray();
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/users/:id/role
  router.put("/:id/role", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const result = await collection.updateOne(
        { _id: id }, // better-auth generates string IDs by default unless ObjectId is forced
        { $set: { role } }
      );
      
      if (result.matchedCount === 0) {
        // Fallback to ObjectId just in case
        const objResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { role } }
        );
        if (objResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }
      }
      
      res.status(200).json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
      console.error("Failed to update user role:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // PUT /api/users/:id/status
  router.put("/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await collection.updateOne(
        { _id: id }, // better-auth ID format
        { $set: { status, updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        // Fallback to ObjectId just in case
        const objResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } }
        );
        if (objResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }
      }
      
      res.status(200).json({ success: true, message: `User status updated to ${status}` });
    } catch (error) {
      console.error("Failed to update user status:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // DELETE /api/users/:id
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const sessionCollection = db.collection("session");
      const accountCollection = db.collection("account");
      
      // Delete user
      let result = await collection.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
         result = await collection.deleteOne({ _id: new ObjectId(id) });
      }
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Not Found" });
      }
      
      // Cascade delete sessions and accounts (best effort)
      await sessionCollection.deleteMany({ userId: id });
      await accountCollection.deleteMany({ userId: id });
      
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
