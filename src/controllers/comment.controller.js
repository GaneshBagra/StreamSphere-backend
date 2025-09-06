import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  let pipeline = [];

  if (videoId) {
    pipeline.push({
      $match: { video : new mongoose.Types.ObjectId(videoId) },
    });
  }

  const agg = Comment.aggregate(pipeline);

  Comment.aggregatePaginate(
    agg,
    { page: pageNum, limit: limitNum },
    (err, result) => {
      if (err) {
        throw new ApiError(500, err.message || "Error to get the comments");
      } else {
        res
          .status(200)
          .json(
            new ApiResponse(200, result, "All comments fetched successfully")
          );
      }
    }
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!content.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  res.status(200).json(
    new ApiResponse(200, comment, "Comment added successfully")
  );
});

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }
    const {content} = req.body
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set : {
                content
            }
        },
        {
            new : true
        }
    )
    if(!comment){
        throw new ApiError(400, "Comment not found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(400, "Comment not found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export { getVideoComments, addComment, updateComment, deleteComment};
