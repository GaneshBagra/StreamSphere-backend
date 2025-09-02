import mongoose,{model, Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
    videoFile : {
        type : String,
        required : [true, "Video is required"]
    },
    thumbnail : {
        type : String,
        required : [true, "Thumbnail is required"]
    },
    title : {
        type : String,
        required : [true, "title is required"]
    },
    description : {
        type : String,
        required : [true, "description is required"]
    },
    duration : {
        type : Number, // get from where the video is saved
        required : true
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    },
    videoOwner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video",videoSchema);