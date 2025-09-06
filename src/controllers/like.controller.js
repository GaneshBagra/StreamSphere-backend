import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/async-Handler.js"
import {Video} from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose from "mongoose"



const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(404, "Video id is required")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "No video found")
    }

    const isLiked = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    })
    if(isLiked){
        await isLiked.deleteOne();
        return res.status(200)
        .json(
            new ApiResponse(200, {}, "Video disliked Successfully")
        )
    }else{
        const like = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        res.status(200)
        .json(
            new ApiResponse(200, like, "Video liked successfully")
        )
    }
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400, "Comment id is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    const isCommentLiked = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    })

    if(isCommentLiked){
        await isCommentLiked.deleteOne()
        res.status(200)
        .json(
            new ApiResponse(200, {}, "Comment disliked successfully")
        )
    }else{
        const like = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })

        res.status(200)
        .json(
            new ApiResponse(200 , like , "Comment Liked Successfully")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError("No tweet found")
    }

    const isTweetLiked = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user._id
    })

    if(isTweetLiked){
        await isTweetLiked.deleteOne()
        res.status(200)
        .json(
            new ApiResponse(200, {}, "Tweet disliked successfully")
        )
    }else{
        const like = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        })

        res.status(200)
        .json(
            new ApiResponse(200, like, "Tweet liked successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        likedBy : new mongoose.Types.ObjectId(req.user?._id),
        video : {
            $exists : true
        }
    }).populate("video")

    if(!likedVideos){
        throw new ApiError(404, "No Videos found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, likedVideos, "Fetched Liked videos successfully")
    )
})
const getLikedComments = asyncHandler(async (req, res) => {
    const likedComments = await Like.find({
        likedBy : new mongoose.Types.ObjectId(req.user?._id),
        comment : {
            $exists : true
        }
    }).populate("comment")

    if(!likedComments){
        throw new ApiError(404, "No Videos found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, likedComments, "Fetched Liked videos successfully")
    )
})
const getLikedTweets = asyncHandler(async (req, res) => {
    const likedTweets = await Like.find({
        likedBy : new mongoose.Types.ObjectId(req.user?._id),
        tweet : {
            $exists : true
        }
    }).populate("tweet")

    if(!likedTweets){
        throw new ApiError(404, "No Videos found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, likedTweets, "Fetched Liked videos successfully")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}




