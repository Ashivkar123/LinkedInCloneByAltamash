import { createSlice } from "@reduxjs/toolkit";
import {
  getAllComments,
  getAllPosts,
  likePost, // <-- The new action name
} from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching comments...";
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postId = action.payload.post_id || "";
        state.comments = action.payload.comments || [];
        console.log(state.comments);
      })
      .addCase(getAllComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch comments";
      })
      // Correctly handle the 'likePost' action
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload.post;
        if (updatedPost) {
          const postIndex = state.posts.findIndex(
            (post) => post._id === updatedPost._id
          );
          if (postIndex !== -1) {
            // Replace the old post with the new, updated post object
            state.posts[postIndex] = updatedPost;
          }
        }
      });
  },
});

export const { resetPostId } = postSlice.actions;

export default postSlice.reducer;
