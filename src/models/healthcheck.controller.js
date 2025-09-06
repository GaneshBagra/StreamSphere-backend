import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/async-Handler.js"


const healthCheck = asyncHandler(async (req, res) =>{
    res.status(200).
    json(
        new ApiResponse(200,"Everything is fine")
    )
})

export {healthCheck}