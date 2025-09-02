import mongoose, { model, Schema } from "mongoose";

const playlistSchema = Schema(
  {
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Playlist = model("Playlist", playlistSchema);
