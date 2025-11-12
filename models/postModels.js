import mongoose from "mongoose";
import User from "./userModels.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: [String], // optional image URL
    },
    tags: {
      type: [String],
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // users who liked this post
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
