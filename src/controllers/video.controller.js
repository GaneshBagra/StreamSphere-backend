import mongoose from "mongoose"
import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js"
import {Video} from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {deleteOnCloudinary} from "../utils/FileDelete.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));

  let pipeline = [];

  // Filter by user
  if (userId) {
    pipeline.push({ $match: { videoOwner: new mongoose.Types.ObjectId(userId) } });
  }

  // Search by title
  if (query) {
    pipeline.push({
      $match: { title: { $regex: query, $options: "i" } },
    });
  }

  // Sorting
  if (sortBy) {
    let sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: sortStage });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  const agg = Video.aggregate(pipeline);

  Video.aggregatePaginate(
    agg,
    { page: pageNum, limit: limitNum },
    (err, result) => {
      if (err) {
        throw new ApiError(500 , err.message || "Error to get the videos")
      }
      res.status(200)
      .json(
        new ApiResponse(200, result, "Data fetched successfully")
      )
    }
  );
});


const publishAVideo = asyncHandler( async (req, res) => {
    const {title, description} = req.body

    if(!title || !description){
        throw new ApiError(404,"All fields are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    
    if(!videoLocalPath){
        throw new ApiError(500, "Video local path not available")
    }
    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
    if(!thumbnailLocalPath){
        throw new ApiError(500, "Thumnail local path not available")
    }
    
    const videoClodinaryResult = await uploadOnCloudinary(videoLocalPath)

    if(!videoClodinaryResult){
        throw new ApiError(500, "Video not uploaded on clodinary")
    }

    const duration = videoClodinaryResult?.duration // duration in miliseconds

    const thumbnailCloudinaryResult = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoClodinaryResult){
        throw new ApiError(500, "Thumbnail not uploaded on clodinary")
    }

    const video = await Video.create({
        videoFile : videoClodinaryResult?.secure_url,
        thumbnail : thumbnailCloudinaryResult?.secure_url,
        title,
        description,
        isPublished : false,
        videoOwner : req.user._id,
        duration
    })

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            uploadedVideo,
            "Video uploaded Successfully"
        )
    )


    
})

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(404, "Video id is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video found successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    if(!videoId){
        throw new ApiError(404, "video id is required")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }

    const {title, description} = req.body
    
    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400,"All fields are required")
    }

    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath){
        throw new ApiError(500,"Thumbnail local path not found")
    }

    const cloudinaryResult = await uploadOnCloudinary(thumbnailLocalPath)

    if(!cloudinaryResult){
        throw new ApiError(500,"Error while uploading on clodinary")
    }

    const updatedVideo = await Video.findOneAndUpdate(
        {_id : video._id},
        {
            $set : {
                title,
                description,
                thumbnail : cloudinaryResult?.secure_url
            }
        },{
            new : true
        }
    )

    await deleteOnCloudinary(video.thumbnail.split('/').at(-1).split('.')[0]);

   
    res.status(200).
    json(
        new ApiResponse(200, updatedVideo, "Video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400, "video id required")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(400, "Video not found")
    }
    
    await deleteOnCloudinary(video.thumbnail.split('/').at(-1).split('.')[0]);
    console.log("video public id : ", video.videoFile.split('/').at(-1).split('.')[0])
    await deleteOnCloudinary(video.videoFile.split('/').at(-1).split('.')[0], "video");


    res.status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})  

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Video id is required")
    }
    
    const {isPublishedNumber} = req.body // 0 for false and 1 for true
    
    if(!isPublishedNumber){
        throw new ApiError(400, "Video not found")
    }

    const isPublished = isPublishedNumber === "1" ? true : false

    const video = await Video.findByIdAndUpdate(
        {_id : videoId},
        {
            $set : {
                isPublished
            }
        },
        {new : true}
        )

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    res.status(200).
    json(
        new ApiResponse(200, video, "Video is published")
    )

    

})  

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}