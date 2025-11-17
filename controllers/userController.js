import User from "../models/userModels.js";
import Post from "../models/postModels.js";
import { uploadToS3 } from "../services/s3Service.js";
import fs from "fs";

export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("-password"); // hide password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(id).select("-password").lean();;
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
      // Get all posts for this user
    const posts = await Post.find({ user: id })
      .populate("user", "name email profileImage") // optional
      .sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {

     const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }


    // Find user
    const user = await User.findById(userId);
    if (!user) {
      // Clean up temp file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

      // Delete old profile image from S3 if exists
    if (user.profileImage) {
      try {
        const oldKey = user.profileImage.split('.com/')[1];
        if (oldKey && oldKey.startsWith('profiles/')) {
          await deleteFromS3(oldKey);
          console.log("Old profile image deleted:", oldKey);
        }
      } catch (error) {
        console.error("Error deleting old profile image:", error);
        // Continue even if deletion fails
      }
    }

  // Upload new profile image to S3
    const imageUrl = await uploadToS3(
      req.file.path, 
      req.file.originalname, 
      req.file.mimetype,
      'profiles' // Custom folder for profile images
    );
    // remove local file
    fs.unlinkSync(req.file.path);

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    );

    return res.status(200).json({
      message: "Profile image updated",
      profileImage: imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload profile image error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, bio },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
