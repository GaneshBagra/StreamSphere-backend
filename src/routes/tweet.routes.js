import { Router } from "express";
import {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet 
} from "../controllers/tweet.controller.js"
import {varifyJWT} from "../middlewares/auth.middleware.js"


const router = Router()
router.use(varifyJWT)

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweet)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)


export default router