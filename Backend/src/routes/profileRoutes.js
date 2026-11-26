import express from "express";
import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("myProfile", "view"),
    getMyProfile
);

router.put(
    "/",
    authenticate,
    authorize("myProfile", "edit"),
    updateMyProfile
);

router.put(
    "/password",
    authenticate,
    authorize("myProfile", "edit"),
    changeMyPassword
);

export default router;

