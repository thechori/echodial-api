require("dotenv").config();

import express from "express";
//
import { authMiddleware } from "../middlewares/auth";
import { createUser } from "../controllers/user/create-user";
import { getUserByID } from "../controllers/user/get-user-by-id";
import { getAllUsers } from "../controllers/user/get-all-users";

const router = express.Router();

// Read all users
router.get("/", authMiddleware, getAllUsers);

// Read single user by id
router.get("/:id", authMiddleware, getUserByID);

// Create new user
router.post("/", createUser);

export default router;
