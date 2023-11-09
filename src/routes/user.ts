require("dotenv").config();

import express from "express";
//
import { createUser } from "../controllers/user/create-user";
import { getUserByID } from "../controllers/user/get-user-by-id";
import { getAllUsers } from "../controllers/user/get-all-users";
import { superUserAuthMiddleware } from "../middlewares/super-user";
import { deleteUser } from "../controllers/user/delete-user";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// Read all users
router.get("/", superUserAuthMiddleware, getAllUsers);

// Read single user by id
router.get("/:id", superUserAuthMiddleware, getUserByID);

// Create new user
router.post("/", createUser);

// Delete user
router.delete("/", authMiddleware, deleteUser);

export default router;
