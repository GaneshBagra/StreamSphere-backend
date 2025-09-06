import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/async-Handler.js"
import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js"

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



export {
    toggleVideoLike
}




