import { Router } from "express";
import { Db } from "mongodb";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/users.controller";

export const usersRouter = (db: Db) => {
  const router = Router();

  router.get("/", getUsers(db));
  router.put("/:id/role", updateUserRole(db));
  router.put("/:id/status", updateUserStatus(db));
  router.delete("/:id", deleteUser(db));

  return router;
};
