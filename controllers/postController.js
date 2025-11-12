import Post from "../models/postModels.js";

// Create post
export const createPost = async (req, res) => {
  try {
    const { userId, content, image, tags, visibility } = req.body;
    const post = await Post.create({
      user: userId,
      content,
      image,
      tags,
      visibility,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ visibility: "public" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all post by Id
export const getAllPostById = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find all posts created by that user
    const posts = await Post.find({ user: userId })
      .populate("user", "name email") // optional if you want user details
      .sort({ createdAt: -1 }); // optional to get latest first

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get Allpublic post by userId
export const getAllPublicPostById = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId, visibility: "public" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get onlyme posts
export const getPrivatePostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
      visibility: "private",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    // 1. Find the post first
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 2. Check if logged-in user is the owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    // 3. Delete the post
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//toggle like
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.body.userId; // from session

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res
      .status(200)
      .json({
        likes: post.likes.length,
        likedByUser: post.likes.includes(userId),
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
