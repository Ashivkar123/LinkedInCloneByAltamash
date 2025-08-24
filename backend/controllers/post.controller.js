// post.controller.js

import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";
// The import for Message model has been removed to fix the error.

export const activeCheck = async (req, res) => {
  console.log("[POST CONTROLLER] Active check successful.");
  return res.status(200).json({ message: "RUNNING" });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body || {};
  console.log("[POST CONTROLLER] Received request to create a post.");

  if (!token) {
    console.log("[POST CONTROLLER] Unauthorized: No token provided.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      console.log("[POST CONTROLLER] Unauthorized: User not found.");
      return res.status(401).json({ message: "User not found" });
    }
    const post = new Post({
      userId: user._id,
      body: body,
      media: req.file != undefined ? req.file.filename : "",
      filetypes: req.file != undefined ? req.file.mimetype.split("/") : "",
    });

    await post.save();
    console.log("[POST CONTROLLER] Post created successfully.");
    return res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("[POST CONTROLLER] Error creating post:", error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

export const getAllPosts = async (req, res) => {
  console.log("[POST CONTROLLER] Received request for all posts.");
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    console.log(`[POST CONTROLLER] Found ${posts.length} posts.`);
    return res.json({ posts });
  } catch (error) {
    console.error("[POST CONTROLLER] Error fetching posts:", error);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

export const deletePost = async (req, res) => {
  // Add a check to ensure req.body exists
  if (!req.body) {
    console.log("[POST CONTROLLER] Bad Request: Request body is empty.");
    return res.status(400).json({ message: "Bad Request: No body provided." });
  }

  let { token, post_id } = req.body;

  // ⭐ NEW FIX: Check if post_id is an object and extract the string if needed.
  if (typeof post_id === "object" && post_id !== null) {
    post_id = post_id.post_id;
  }

  console.log(
    `[POST CONTROLLER] Received request to delete post ID: ${post_id}`
  );

  try {
    // Check if token and post_id were provided
    if (!token || !post_id) {
      console.log(
        "[POST CONTROLLER] Missing required fields: token or post_id."
      );
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      console.log("[POST CONTROLLER] Unauthorized: User not found.");
      return res.status(401).json({ message: "user not found" });
    }

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      console.log("[POST CONTROLLER] Post not found.");
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      console.log(
        "[POST CONTROLLER] Unauthorized: User does not own this post."
      );
      return res.status(401).json({ message: "unauthorized" });
    }

    await Comment.deleteMany({ postId: post_id });
    await Post.deleteOne({ _id: post_id });
    console.log(
      `[POST CONTROLLER] Post ID: ${post_id} and related comments deleted.`
    );
    return res.json({ message: "Post Deleted" });
  } catch (err) {
    console.error(
      `[POST CONTROLLER] Error deleting post ID: ${post_id}. Error details:`,
      err
    );
    return res
      .status(500)
      .json({
        message: "An internal server error occurred.",
        details: err.message,
      });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body || {};
  console.log(
    `[POST CONTROLLER] Received request to comment on post ID: ${post_id}`
  );

  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      console.log("[POST CONTROLLER] User not found.");
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      console.log("[POST CONTROLLER] Post not found.");
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,
    });

    await comment.save();
    console.log(`[POST CONTROLLER] Comment added to post ID: ${post_id}`);
    return res.json({ message: "Comment Added", comment });
  } catch (err) {
    console.error("[POST CONTROLLER] Error adding comment:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;
  console.log(
    `[POST CONTROLLER] Received request to get comments for post ID: ${post_id}`
  );

  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      console.log("[POST CONTROLLER] Post not found.");
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username profilePicture"
    );
    console.log(
      `[POST CONTROLLER] Found ${comments.length} comments for post ID: ${post_id}`
    );

    return res.json({ success: true, comments: comments || [] });
  } catch (err) {
    console.error("[POST CONTROLLER] Error getting comments:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body || {};
  console.log(
    `[POST CONTROLLER] Received request to delete comment ID: ${comment_id}`
  );

  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      console.log("[POST CONTROLLER] User not found.");
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      console.log("[POST CONTROLLER] Comment not found.");
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      console.log(
        "[POST CONTROLLER] Unauthorized: User does not own this comment."
      );
      return res.status(401).json({ message: "unauthorized" });
    }

    await Comment.deleteOne({ _id: comment_id });
    console.log(`[POST CONTROLLER] Comment ID: ${comment_id} deleted.`);
    return res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("[POST CONTROLLER] Error deleting comment:", err);
    return res.status(500).json({ message: err.message });
  }
};

// This function replaces the old increment_likes
export const like_post = async (req, res) => {
  const { post_id, token } = req.body || {};
  console.log(
    `[POST CONTROLLER] Received request to like/unlike post ID: ${post_id}`
  );

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = user._id;

    const post = await Post.findById(post_id);
    if (!post) {
      console.log("[POST CONTROLLER] Post not found.");
      return res.status(404).json({ message: "Post not found" });
    }

    // ⭐ NEW FIX: Check the data type of post.likes to prevent MongoServerError
    // If the 'likes' field is not an array, it's a corrupted document.
    // We update it to an empty array to fix the data for future operations.
    if (!Array.isArray(post.likes)) {
      await Post.updateOne({ _id: post_id }, { $set: { likes: [] } });
      console.log(
        `[POST CONTROLLER] Fixed corrupted 'likes' field for post ID: ${post_id}`
      );
      // Refresh the post document to get the corrected 'likes' array
      const updatedPostAfterFix = await Post.findById(post_id);
      post.likes = updatedPostAfterFix.likes;
    }

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // If the user already liked the post, unlike it
      await Post.updateOne({ _id: post_id }, { $pull: { likes: userId } });
      console.log(
        `[POST CONTROLLER] User ${userId} unliked post ID: ${post_id}`
      );
    } else {
      // If the user hasn't liked the post, like it
      await Post.updateOne({ _id: post_id }, { $push: { likes: userId } });
      console.log(`[POST CONTROLLER] User ${userId} liked post ID: ${post_id}`);
    }

    // Return the updated post to the frontend
    const updatedPost = await Post.findById(post_id).populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ message: "Success", post: updatedPost });
  } catch (err) {
    console.error("[POST CONTROLLER] Error liking/unliking post:", err);
    return res.status(500).json({ message: err.message });
  }
};
// All messaging-related functions have been removed to fix the import error.
