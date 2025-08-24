// post.routes.js

import { Router } from "express";
import {
  activeCheck,
  commentPost,
  createPost,
  delete_comment_of_user,
  deletePost,
  get_comments_by_post,
  getAllPosts,
  like_post, 
  // All messaging-related functions (like getMessages) have been removed from the import
} from "../controllers/post.controller.js";
import multer from "multer";

console.log("Setting up post routes...");
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(activeCheck);
console.log("Route for / registered (activeCheck).");

router.route("/user/post").post(upload.single("media"), createPost);
console.log("Route for /user/post registered.");

router.route("/posts").get(getAllPosts);
console.log("Route for /posts registered.");

router.route("/user/delete_post").delete(deletePost);
console.log("Route for /user/delete_post registered.");

router.route("/user/comment").post(commentPost);
console.log("Route for /user/comment registered.");

router.route("/user/get_comments").get(get_comments_by_post);
console.log("Route for /user/get_comments registered.");

router.route("/user/delete_comments").delete(delete_comment_of_user);
console.log("Route for /user/delete_comments registered.");

// Route for liking/unliking a post
router.route("/user/like_post").post(like_post); 

// All messaging-related routes have been removed.
console.log("All messaging routes have been removed to resolve the error.");

export default router;
