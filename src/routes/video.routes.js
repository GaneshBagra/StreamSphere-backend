import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos
} from "../controllers/video.controller.js";

const router = new Router();

router.use(varifyJWT);

// upload a video
router.route("/").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

// get video by query
router.route("/").get(getAllVideos);
// get video by id
router.route("/:videoId").get(getVideoById)
// update video details
router.route("/update-video-details/:videoId").patch(upload.single("thumbnail"), updateVideo)
// delete video
router.route("/delete-video/:videoId").delete(deleteVideo);
// toggle publish status
router.route("/toggle-publish-status/:videoId").patch(togglePublishStatus)



export default router;
