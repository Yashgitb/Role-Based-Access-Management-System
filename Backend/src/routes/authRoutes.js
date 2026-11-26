import express from "express"
import {
    login,
    getProfile,
    logout
} from "../controllers/authController.js";

import {
    authenticate
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, getProfile);

router.post("/logout", authenticate, logout);

export default router;