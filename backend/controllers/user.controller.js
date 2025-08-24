import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connection.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);

  doc.pipe(stream);

  if (userData.userId.profilePicture) {
    doc.image(`uploads/${userData.userId.profilePicture}`, {
      align: "center",
      width: 100,
    });
  }

  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

  doc.fontSize(14).text("Past Work: ");
  (userData.pastWork || []).forEach((work) => {
    doc.fontSize(14).text(`Company Name: ${work.companyName}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });

  doc.end();

  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All Files are required" });

    const user = await User.findOne({
      email,
    });

    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.json({ message: "User Created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All Files are required" });
    const user = await User.findOne({
      email,
    });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });
    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename;

    await user.save();

    return res.json({ message: "Profile Picture uploaded" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { token, ...newUserData } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (!existingUser) {
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res
          .status(400)
          .json({ message: "Username or Email already exists" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();

    return res.json({ message: "User Profile updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  // Add a console.log at the start to check if the function is even called
  console.log("✅ updateProfileData function was called.");

  try {
    const { token, ...newProfileData } = req.body;
    console.log("Request Body:", req.body); // Log the received data

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      console.log("❌ User not found for the given token.");
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    if (!profile_to_update) {
      console.log("❌ Profile not found for the user.");
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    console.log("✅ Profile updated successfully!");
    await res.json({ message: "Profile updated" });
  } catch (error) {
    console.error("❌ An error occurred:", error); // Log the full error
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );

    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;

  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name email username profilePicture"
  );

  let outputPath = await convertUserDataTOPDF(userProfile);

  return res.json({ message: outputPath });
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "connection User Not Found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    return res.json({ message: "Request Sent" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error sending connection request" });
  }
};

// ✅ FIXED: Return an object with a 'connections' key.
export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    // Return an object instead of a raw array
    return res.json({ connections: connections });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching connection requests" });
  }
};

// ✅ FIXED: Return an object with a 'connections' key.
export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    // Return an object instead of a raw array
    return res.json({ connections: connections });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findOne({ _id: requestId });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.json({ message: "Connection request updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error accepting connection request" });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "usename name"
    );

    return res.json(comments.reverse());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );

    return res.json({ profile: userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
