import { Router } from "express"
import {getVideoComments, addComment, updateComment, deleteComment} from "../controllers/comment.controller.js"
import {varifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(varifyJWT)

router.route("/:videoId").get(getVideoComments)
router.route("/:videoId").post(addComment)

router.route("/:commentId").patch(updateComment)
router.route("/:commentId").delete(deleteComment)

export default router
