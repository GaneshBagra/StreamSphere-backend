import { Router } from "express";
import {varifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()

router.use(varifyJWT)

router.route("/:videoId").post(toggleVideoLike)

export default router