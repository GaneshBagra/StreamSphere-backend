import {asyncHandler} from "../utils/async-Handler.js"
import {ApiError} from "../utils/ApiError.js"
import { Tweet } from "../models/tweet.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content.trim()){
        throw new ApiError(400, "Content is needed")
    }
    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    res.status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    )
} )

const getUserTweet = asyncHandler(async (req, res) => {
    
    const {userId} = req.params

    const tweets = await Tweet.find({
        owner : req.user?._id
    })

    if(!tweets){
        throw new ApiError(404, "No tweets found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, tweets, "All tweets fetched successfully")
    )

})


const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} =  req.params
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }
    const {content} = req.body

    if(!content.trim()){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content
            }
        },
        {new : true}
    )
    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }
    res.status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "tweet id is required")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(400, "tweet not found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet 
}