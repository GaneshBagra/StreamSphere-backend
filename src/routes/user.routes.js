import { Router } from "express";
import {
  resgisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateAccoundDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = new Router();

// route to register

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  resgisterUser
);

// route to login

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(varifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(varifyJWT, changeCurrentPassword);
router.route("/current-user").get(varifyJWT, getCurrentUser);
router.route("/update-account-details").patch(varifyJWT,UpdateAccoundDetails);

router
  .route("/update-user-avatar")
  .patch(varifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-user-coverImage")
  .patch(varifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(getUserChannelProfile);
router.route("/watch-history").get(varifyJWT, getWatchHistory);

export default router;
