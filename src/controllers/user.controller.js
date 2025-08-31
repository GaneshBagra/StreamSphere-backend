import { asyncHandler } from "../utils/async-Handler.js";



const resgisterUser = asyncHandler(async (req,res) => {
    res.status(200).json({
        message : "ok"
    })
})

export {resgisterUser};