import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // <-- Corrected reference
  },
  body: {
    type: String,
    required: true,
  },
});

const Comments = mongoose.model("Comments", commentsSchema);

export default Comments;
