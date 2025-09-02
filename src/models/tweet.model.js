import mongoose, { model, Schema } from "mongoose";

const tweetSchema = Schema(
  {
    
    content : {
      type: String,
      required: true,
    },
    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = model("Tweet", playlistSchema);
