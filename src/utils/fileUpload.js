import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  secure: true,
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file if an only of file path is available 
        const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type : "auto"
        });
    //   file has been uploaded
      console.log("File is uploaded on cloudinary",result.url);
      return result;
    } catch (error) {
      console.error("File not uploaded on cloudinary so unlined from local storage",error);
        fs.unlinkSync(localFilePath);
        return null;

    }
};

export {uploadOnCloudinary}