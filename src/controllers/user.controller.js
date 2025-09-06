import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteOnCloudinary } from "../utils/FileDelete.js";
import mongoose, { set } from "mongoose";

// method for generating access and refresh tokens

const generateAccessAnsResponseTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

// register user
const resgisterUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation for the data - not empty
  // check does user exist ? : username and email
  // check is files available : avtar and cover image
  // if available then upload it to cloudinary, : avtar bcoz it is required
  // create user object - create entry in db
  // remove password and refresh token filed from response
  // check for user creation
  // return response

  const { username, fullName, email, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, `All fields are compulsary is required`);
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      `User with email or username is already registered`
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage.path;
  } else {
    coverImageLocalPath = "";
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User created successfully"));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  // get cridentials(username or email and password) and tokens(refresh token and access token) from client
  // validate the username
  // call mongo db and find the user
  // password check
  // call mongoDB and compare the password
  // send access and refresh tokens
  // send this tokens as cookies

  const { username, email, password } = req.body;

  if (!(username?.trim() || email?.trim())) {
    throw new ApiError(400, "username or email required");
  }

  const userFound = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userFound) {
    throw new ApiError(404, "User doesn't exist");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const isPasswordValid = await userFound.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }

  const { refreshToken, accessToken } = await generateAccessAnsResponseTokens(
    userFound._id
  );

  userFound.refreshToken = refreshToken;

  const loggedInUser = userFound.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  // find user
  // clear cookies
  // reset access and refresh tokens

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout successfully"));
});
// refreshAccessToken controller

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorised request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is exired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } =
      await generateAccessAnsResponseTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Tokens successfully refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token");
  }
});

// update user controllers

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(4040, "invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const UpdateAccoundDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName && email)) {
    throw new ApiError(400, "All fields are required");
  }

  
  

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // console.log(user)

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const cloudinaryPath = await uploadOnCloudinary(avatarLocalPath);

  if (!cloudinaryPath.url) {
    throw new ApiError(500, "Error while uploading avatar");
  }

  user.avatar = cloudinaryPath.url

  const userUpdated = await user.save({validateBeforeSave : false})
  
  const finalUser = userUpdated.toObject()
  delete finalUser.password
  delete finalUser.refreshToken  

  const deleteFromCloudinary = await deleteOnCloudinary(user?.avatar.split('/').at(-1).split('.')[0]);

  if(!deleteFromCloudinary){
    throw new ApiError(500, "Failed to delete from clodinary")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, finalUser, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const cloudinaryPath = await uploadOnCloudinary(coverImageLocalPath);

  if (!cloudinaryPath.url) {
    throw new ApiError(500, "Error while uploading coverImage");
  }

  user.coverImage = cloudinaryPath.url
  const updatedUser = await user.save({validateBeforeSave : false});

  const finalUser = updatedUser.toObject()
  delete finalUser.password
  delete finalUser.refreshToken


  const deleteFromCloudinary = await deleteOnCloudinary(user?.coverImage.split('/').at(-1).split('.')[0]);

  if(!deleteFromCloudinary){
    throw new ApiError(500, "Failed to delete from clodinary")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, finalUser, "coverImage updated successfully"));
});

// using aggragtion pipelines to get the subscribers and subscribed for the user profile

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params

  if(!username?.trim()){
    throw new ApiError(400, "Username is missing")
  }

  const channel = await User.aggregate([
    {
      $match : {
        username : username?.toLowerCase()
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "channel",
        as : "subscribers"
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"
      }
    },
    {
      $addFields : {
        subscribersCount : {
          $size : "$subscribers"
        },
        channelsSubscribedToCount : {
          $size : "$subscribedTo"
        },
        isSubscribed :{
          $cond : [
            {$in : [req.user?._id, "$subscribers.subscriber"]},
            true,
            false
        ]
        }
      }
    },
    {
      $project : {
        fullName : 1,
        username : 1,
        subscribersCount : 1,
        channelsSubscribedToCount : 1,
        avatar : 1,
        coverImage : 1,
        email : 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "channel does not exist")
  }
  
  return res.status(200)
  .json(
    new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})
// using nested aggregation to get watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match : {
        _id : new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup : {
        from : "videos",
        localField : "watchHistory",
        foreignField : "_id",
        as : "watchHistory",
        pipeline : [
          {
            $lookup : {
              from : "users",
              localField : "videoOwner",
              foreignField : "_id",
              as : "videoOwner",
              pipeline : [
                {
                  $project : {
                    username : 1,
                    fullName : 1,
                    avatar : 1,
                    coverImage : 1
                  }
                }
              ]
            }
          },
          {
            $addFields : {
              videoOwner :{
                $first : "$videoOwner"
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200)
  .json(
    new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
  )
})

const addVideoToWatchHistory = asyncHandler(async (req, res) => {
  const {videoId} = req.params

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {$addToSet : {watchHistory : videoId}},
    {new : true}
  )


  res.status(200)
  .json(
    new ApiResponse(200, user, "Video added to the history")
  )
})


export {
  resgisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateAccoundDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addVideoToWatchHistory
};
