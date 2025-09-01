import {v2 as cloudinary} from "cloudinary"
import { ApiError } from "./ApiError.js";

cloudinary.config({
  secure: true,
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const deleteOnCloudinary = async (clodinaryResult) => {
    try {
        clodinaryPublicId = clodinaryResult?.public_id
        const result = await cloudinary.uploader.destroy(clodinaryPublicId)
        return result;
        
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to delete on cludinary")
    }
}

export {deleteOnCloudinary}