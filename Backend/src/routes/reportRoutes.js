import express from "express";
import { getReports, getRoleReports } from "../controllers/reportController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("reports", "view"),
    getReports
);

router.get(
    "/roles",
    authenticate,
    authorize("reports", "view"),
    getRoleReports
);

export default router;

