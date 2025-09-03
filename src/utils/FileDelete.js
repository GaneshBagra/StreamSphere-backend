import {v2 as cloudinary} from "cloudinary"
import { ApiError } from "./ApiError.js";

cloudinary.config({
  secure: true,
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const deleteOnCloudinary = async (publicId, type = "image") => {
    try {
        const clodinaryPublicId = publicId
        const result = await cloudinary.uploader.destroy(clodinaryPublicId,{resource_type : type})
        return result;
        
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to delete on cludinary")
    }
}

export {deleteOnCloudinary}