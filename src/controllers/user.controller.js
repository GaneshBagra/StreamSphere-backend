import { asyncHandler } from "../utils/async-Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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

  const loggedInUser = userFound.toObject()
  delete loggedInUser.password;
  delete loggedInUser.refreshToken

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
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200, {}, "Logout successfully")
    )

});
// refreshAccessToken controller 

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorised request")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is exired or used")
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const {accessToken,newRefreshToken } = await generateAccessAnsResponseTokens(user._id)
    return res.status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken, 
          newRefreshToken : newRefreshToken},
        "Tokens successfully refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token")
  }


}) 

// update user controller

const updateUser = asyncHandler(async (req,res) => {
  
})


export { resgisterUser, loginUser, logoutUser, refreshAccessToken };
