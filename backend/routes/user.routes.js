import { Router } from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionRequests,
  acceptConnectionRequest,
  whatAreMyConnections,
  getUserProfileAndUserBasedOnUsername,
  commentPost,
} from "../controllers/user.controller.js";
import multer from "multer";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// All routes here will automatically be prefixed with "/user"
// thanks to the app.use("/user", userRoutes); line in index.js

router
  .route("/update_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/get_all_users").get(getAllUserProfile);
router.route("/download_resume").get(downloadProfile);
router.route("/send_connection_request").post(sendConnectionRequest);
router.route("/getConnectionRequest").get(getMyConnectionRequests);
router.route("/user_connection_request").get(whatAreMyConnections);
router.route("/accept_connection_request").post(acceptConnectionRequest);
router.route("/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);
router.route("/comment_post").post(commentPost);

export default router;
