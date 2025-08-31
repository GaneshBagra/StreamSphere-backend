import { asyncHandler } from "../utils/async-Handler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/fileUpload.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const resgisterUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validation for the data - not empty
    // check does user exist ? : username and email
    // check is files available : avtar and cover image
    // if available then upload it to cloudinary, : avtar bcoz it is required
    // create user object - create entry in db
    // remove password and refresh token filed from response
    // check for user creation
    // return response
    
    const {username, fullName,email,password,} = req.body
    console.log("email : ",email)

    if(
        [fullName,email,username,password].some((field) => {
            field?.trim() === ""
        })
    ){
        throw new ApiError(400,`All fields are compulsary is required`);
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })
    if(existedUser) {
        throw new ApiError(409,`User with email or username is already registered`);
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath ;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage.path
    }else{
        coverImageLocalPath = ''
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar  = await uploadOnCloudinary(avatarLocalPath);
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.secure_url,
        coverImage : coverImage?.secure_url || "",
        email,
        password,
        username : username.toLowerCase()
    });

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!userCreated){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User created successfully")
    )



})

export {resgisterUser};