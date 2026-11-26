import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("dashboard", "view"),
    getDashboardStats
);

export default router;

