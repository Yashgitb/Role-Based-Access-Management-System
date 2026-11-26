import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("settings", "view"),
    getSettings
);

router.put(
    "/",
    authenticate,
    authorize("settings", "edit"),
    updateSettings
);

export default router;

