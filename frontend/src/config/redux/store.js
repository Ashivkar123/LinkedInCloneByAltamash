import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer/index.js";
import postReducer from "./reducer/postReducer/index.js"

/**
 * STEPS FOR STATE Managemnet
 * Submit Action
 * Handle Action in its's reducer
 * Register Here -> Reducer
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer
  },
});
