import {Router} from "express"
import { resgisterUser,loginUser, logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = new Router();

// route to register

router.route("/register").post(upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1,
        
    }
]),
    resgisterUser);

// route to login

router.route("/login").post( loginUser)

// secured routes
router.route("/logout").post(varifyJWT, logoutUser)

export default router; 