import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getLikedVideos,
  getLikedComments,
  getLikedTweets,
} from "../controllers/like.controller.js";

const router = Router();

router.use(varifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

router.route("/videos").get(getLikedVideos);
router.route("/comments").get(getLikedComments);
router.route("/tweets").get(getLikedTweets);


export default router;
