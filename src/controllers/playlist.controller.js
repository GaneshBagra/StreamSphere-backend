import { Playlist } from "../models/playlist.model.js"
import {asyncHandler} from "../utils/async-Handler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { Video } from "../models/video.model.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const  {name , description} = req.body
    if(!name.trim() || !description.trim()){
        throw new ApiError(400, "Name and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user._id
    })

    res.status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "user id is required")
    }
    const playlists = await Playlist.find({owner : userId})
    
    res.status(200)
    .json(
        new ApiResponse(200, playlists, "Playlists fetched successfullly")
    )
})

const getPLaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(200, "playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError("Both playlist and video id is required")
    }
    
    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }
    
    const isExist = playlist.videos.includes(videoId)

    if(isExist){
        throw new ApiError(400, "Video already exist in the playlist")
    }

    const addedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet : {
                videos : videoId
            }
        },
        {new : true}
    ).populate("videos")


    res.status(200)
    .json(
        new ApiResponse(200, addedPlaylist, "Video added succcessfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {videoId, playlistId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError("Both playlist and video id is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }

    const isExist = playlist.videos.includes(videoId)

    if(!isExist){
        throw new ApiError(400, "Before removing add video first")
    }

    playlist.videos.pull(videoId)

    await playlist.save({validateBeforeSave : false})

  

    res.status(200)
    .json(
        new ApiResponse(
            200, {},"video removed successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(404, "playlist id is required")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    res.status(200)
    .json(
        new ApiResponse(200, {} , "Playlist deleted successfully" )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updateData },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getPLaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getUserPlaylists,
    updatePlaylist
}